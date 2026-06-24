import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { OFFSETS_0_36 } from '../logic/RouletteUtils';

// --- LOGIC ENGINE (Ported & Enhanced for Bet Placement) ---
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23,
  10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Generate bets with IDs compatible with BettingBoard
const generateBets = () => {
  const bets = [];
  // 1. Straight Up
  for (let i = 0; i <= 36; i++) {
    bets.push({ type: 'STR', cost: 1, nums: [i], id: i.toString() });
  }
  // 2. Splits
  const addSplit = (n1, n2) => bets.push({ type: 'SPLIT', cost: 1, nums: [n1, n2], id: `SPLIT_${Math.min(n1, n2)}_${Math.max(n1, n2)}` });
  for (let n = 1; n <= 33; n++) addSplit(n, n + 3);
  for (let n = 1; n <= 35; n++) if (n % 3 !== 0) addSplit(n, n + 1);
  addSplit(0, 1); addSplit(0, 2); addSplit(0, 3);

  // 3. Corners
  for (let n = 1; n <= 32; n++) if (n % 3 !== 0) {
    const ids = [n, n + 1, n + 3, n + 4].sort((a, b) => a - b);
    bets.push({ type: 'CNR', cost: 1, nums: ids, id: `CORNER_${ids.join('_')}` });
  }
  bets.push({ type: 'CNR_0', cost: 1, nums: [0, 1, 2, 3], id: 'CORNER_0_1_2_3' });

  // 4. Trios
  bets.push({ type: 'TRIO', cost: 1, nums: [0, 1, 2], id: 'TRIO_0_1_2' });
  bets.push({ type: 'TRIO', cost: 1, nums: [0, 2, 3], id: 'TRIO_0_2_3' });

  // 5. Streets (Row)
  for (let n = 1; n <= 34; n += 3) {
    bets.push({ type: 'STRT', cost: 1, nums: [n, n + 1, n + 2], id: `STREET_${n}` });
  }

  // 6. Lines (Double Street)
  for (let n = 1; n <= 31; n += 3) {
    bets.push({ type: 'LINE', cost: 1, nums: [n, n + 1, n + 2, n + 3, n + 4, n + 5], id: `LINE_${n}` });
  }

  // 7. Outside Bets (Rule 5x)
  const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const COL1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
  const COL2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const COL3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

  bets.push({ type: 'OUT', cost: 5, nums: REDS, id: 'RED' });
  bets.push({ type: 'OUT', cost: 5, nums: WHEEL_ORDER.filter(n => n !== 0 && !REDS.includes(n)), id: 'BLACK' });
  bets.push({ type: 'OUT', cost: 5, nums: WHEEL_ORDER.filter(n => n !== 0 && n % 2 === 0), id: 'EVEN' });
  bets.push({ type: 'OUT', cost: 5, nums: WHEEL_ORDER.filter(n => n !== 0 && n % 2 !== 0), id: 'ODD' });
  bets.push({ type: 'OUT', cost: 5, nums: WHEEL_ORDER.filter(n => n >= 1 && n <= 18), id: 'LOW' });
  bets.push({ type: 'OUT', cost: 5, nums: WHEEL_ORDER.filter(n => n >= 19 && n <= 36), id: 'HIGH' });

  bets.push({ type: 'OUT', cost: 5, nums: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], id: 'DOZ1' });
  bets.push({ type: 'OUT', cost: 5, nums: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24], id: 'DOZ2' });
  bets.push({ type: 'OUT', cost: 5, nums: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], id: 'DOZ3' });

  bets.push({ type: 'OUT', cost: 5, nums: COL1, id: 'COL1' });
  bets.push({ type: 'OUT', cost: 5, nums: COL2, id: 'COL2' });
  bets.push({ type: 'OUT', cost: 5, nums: COL3, id: 'COL3' });

  return bets;
};

const BETS = generateBets();

const calculateMinCost = (requiredNums) => {
  if (!requiredNums || requiredNums.length === 0) return { cost: 0, bets: [] };
  let remaining = new Set(requiredNums);
  let totalCost = 0;
  let chosenBets = [];

  while (remaining.size > 0) {
    let bestBet = null;
    let bestEfficiency = Infinity; // Lower is better (Cost / Covered)
    let maxCovered = 0;

    // Create a target set for strict containment audit
    const targetSet = new Set(requiredNums);

    for (const bet of BETS) {
      // STRICT GEOMETRIC AUDIT: Only allow a bet if 100% of its numbers are in targetSet
      const isClean = bet.nums.every(n => targetSet.has(n));
      if (!isClean) continue;

      let useful = 0;
      for (const n of bet.nums) {
        if (remaining.has(n)) useful++;
      }

      if (useful === 0) continue;

      const efficiency = bet.cost / useful;
      // TIE BREAKER:
      // 1. Better efficiency (Cost / TargetCovered)
      // 2. If equal, MINIMUM total coverage (nums.length) to avoid collateral disaster
      // 3. If still equal, prefer higher coverage (to consolidate chips)
      if (efficiency < bestEfficiency ||
        (efficiency === bestEfficiency && bet.nums.length < (bestBet ? bestBet.nums.length : 99)) ||
        (efficiency === bestEfficiency && bet.nums.length === (bestBet ? bestBet.nums.length : 99) && useful > maxCovered)) {
        bestEfficiency = efficiency;
        maxCovered = useful;
        bestBet = bet;
      }
    }

    if (bestBet && bestEfficiency < 1) { // 1 is the cost of a Straight Up pleno
      totalCost += bestBet.cost;
      chosenBets.push(bestBet.id);
      for (const n of bestBet.nums) remaining.delete(n);
    } else {
      // Step 3: Plenos (Remaining)
      const arr = Array.from(remaining);
      totalCost += arr.length;
      arr.forEach(n => chosenBets.push(n.toString()));
      remaining.clear();
    }
  }
  return { cost: totalCost, bets: chosenBets };
};

const getRelativeSectors = (centerNum) => {
  const centerIndex = WHEEL_ORDER.indexOf(centerNum);
  const getSlice = (start, end) => {
    const nums = [];
    for (let i = start; i <= end; i++) {
      let idx = (centerIndex + i) % 37;
      if (idx < 0) idx += 37;
      nums.push(WHEEL_ORDER[idx]);
    }
    return nums;
  };

  // UNIFIED CRITERIA: [-3, +3] Global
  let set = OFFSETS_0_36[centerNum];
  if (!set) set = { n: [-3, 3], v: [-9, 9] }; // Fallback

  return {
    nucleo: getSlice(set.n[0], set.n[1]),
    vecinos: getSlice(set.v[0], set.v[1]),
    tiers: getSlice(11, 22),
    orphelins: [...getSlice(8, 10), ...getSlice(23, 27)]
  };
};

const SystemEfficiencyModal = ({ onClose, onBatchBet, currentBets, selectedChip }) => {
  const [data, setData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'asc' });

  useEffect(() => {
    const results = [];
    for (let i = 0; i <= 36; i++) {
      const sectors = getRelativeSectors(i);

      const resNucleo = calculateMinCost(sectors.nucleo);
      const resTiers = calculateMinCost(sectors.tiers);
      const resOrph = calculateMinCost(sectors.orphelins);
      const resVecinos = calculateMinCost(sectors.vecinos);

      const total = resTiers.cost + resOrph.cost + resVecinos.cost;
      const fTotal = `${total}/37`;
      const dTotal = (total / 37).toFixed(3);
      const bTotal = [...resNucleo.bets, ...resTiers.bets, ...resOrph.bets, ...resVecinos.bets];

      results.push({
        sys: i,
        // Nucleo (Dynamic Coverage)
        cNucleo: resNucleo.cost,
        nNucleo: sectors.nucleo.length,
        dNucleo: (resNucleo.cost / sectors.nucleo.length).toFixed(3),
        bNucleo: resNucleo.bets,
        // Tiers
        cTiers: resTiers.cost,
        nTiers: sectors.tiers.length,
        dTiers: (resTiers.cost / sectors.tiers.length).toFixed(3),
        bTiers: resTiers.bets,
        // Orphelins
        cOrph: resOrph.cost,
        nOrph: sectors.orphelins.length,
        dOrph: (resOrph.cost / sectors.orphelins.length).toFixed(3),
        bOrph: resOrph.bets,
        // Vecinos
        cVecinos: resVecinos.cost,
        nVecinos: sectors.vecinos.length,
        dVecinos: (resVecinos.cost / sectors.vecinos.length).toFixed(3),
        bVecinos: resVecinos.bets,
        // Total
        total,
        dTotal,
        bTotal,
        ratio: dTotal
      });
    }
    results.sort((a, b) => {
      if (a.total !== b.total) return a.total - b.total;
      return a.cNucleo - b.cNucleo;
    });
    setData(results);
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const isUserSelection = (id) => [26, 23, 10].includes(id);

  // Check if a specific sector has chips on the table
  const isSectorActive = (betIds) => {
    if (!currentBets || !betIds) return false;
    // Strictness: Are ALL bets present? Or ANY?
    // "MIENTRAS TENGA FICHAS" implies even one makes it active.
    // Let's go with ANY for visibility, but ALL is often better for checking "Is this system ON?".
    // Given the dynamic nature, check efficiently:
    const activeIds = Object.keys(currentBets);
    // Intersection - Require ALL bets to be present for the sector to be considered "Active"
    return betIds.every(id => activeIds.includes(id));
  };

  const handleSectorClick = (betIds) => {
    if (onBatchBet && betIds && betIds.length > 0) {
      if (!selectedChip) {
        // Fallback or error if somehow 0/null? Usually passed from parent.
        // CasinoTable handles selectedChip state, so it should be valid.
        onBatchBet(betIds, 1) // Default or fail safe
      } else {
        onBatchBet(betIds, selectedChip);
      }
    }
  };

  const renderCell = (cost, decimal, bets, color, targetDenominator) => {
    const active = isSectorActive(bets);
    const isElite = cost <= 4;

    // CALCULATIONS FOR ALPHA
    const percentage = ((targetDenominator / 37) * 100).toFixed(1);
    const alpha = (parseFloat(percentage) * parseFloat(decimal)).toFixed(1);

    // Thresholds for Alpha highlighting
    const isPowerful = parseFloat(alpha) > 20.0;
    const isBalanced = parseFloat(alpha) >= 15.0 && parseFloat(alpha) <= 20.0;

    return (
      <td
        onClick={() => handleSectorClick(bets)}
        style={{
          padding: '4px 6px', // Slightly more padding
          textAlign: 'center',
          color: active ? '#fff' : isElite ? '#0ff' : color,
          fontWeight: isElite ? 'bold' : 'normal',
          textShadow: isElite && !active ? '0 0 5px rgba(0,255,255,0.5)' : 'none',
          cursor: 'pointer',
          background: active
            ? `rgba(${color === '#ffd700' ? '255,215,0' : color === '#e57373' ? '229,115,115' : color === '#64b5f6' ? '100,181,246' : '129,199,132'}, 0.25)`
            : isElite ? 'rgba(0, 255, 255, 0.05)' : 'transparent',
          borderRadius: '4px',
          border: active ? `1px solid ${color}` : isElite ? '1px dashed rgba(0,255,255,0.3)' : 'none',
          transition: 'all 0.2s',
          lineHeight: '1.2'
        }}
        title={`Click to place bets\nAlpha Index: ${alpha}`}
      >
        {isElite && <span style={{ marginRight: '4px', fontSize: '0.9em' }}>💎</span>}
        <div style={{ fontSize: '0.95em', fontWeight: 'bold' }}>[{cost}F|{targetDenominator}N]</div>
        <div style={{ fontSize: '0.85em', color: active ? '#eee' : '#bbb' }}>
          {decimal} <span style={{ color: active ? '#fff' : color }}>{percentage}%</span>
        </div>

        {/* ALPHA INDEX DISPLAY */}
        <div style={{
          fontSize: '0.9em',
          marginTop: '2px',
          color: isPowerful ? '#00e676' : (isBalanced ? '#ffd700' : '#888'),
          fontWeight: 'bold',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: '2px'
        }}>
          α {alpha}
        </div>
      </td>
    );
  };

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.92)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
        border: '1px solid #333',
        borderRadius: '20px',
        boxShadow: '0 0 50px rgba(0,0,0,0.8)',
        width: '95vw',
        height: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding: '20px 30px',
          borderBottom: '1px solid #333',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: '#111'
        }}>
          <h2 style={{
            margin: 0, color: '#d4af37', fontSize: '1.5rem',
            textTransform: 'uppercase', letterSpacing: '1px',
            fontFamily: 'Roboto Mono, monospace'
          }}>
            RANKING DE EFICIENCIA EN EL CILINDRO
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: '#888',
            fontSize: '2rem', cursor: 'pointer', lineHeight: '1'
          }}>&times;</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          <table style={{ width: 'auto', margin: '0 auto', borderCollapse: 'collapse', color: '#ccc', fontFamily: 'Roboto Mono, monospace', fontSize: '1.1rem' }}>
            <thead style={{ position: 'sticky', top: 0, background: '#111', zIndex: 10 }}>
              <tr>
                <th onClick={() => handleSort('sys')} style={{ cursor: 'pointer', padding: '4px 4px', textAlign: 'center', borderBottom: '2px solid #444', color: '#fff' }}># {sortConfig.key === 'sys' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('sys')} style={{ cursor: 'pointer', padding: '4px 4px', textAlign: 'left', borderBottom: '2px solid #444', color: '#fff' }}>Sistema {sortConfig.key === 'sys' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('total')} style={{ cursor: 'pointer', padding: '4px 4px', textAlign: 'center', borderBottom: '2px solid #444', color: '#0f0' }}>Total (37) {sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('cNucleo')} style={{ cursor: 'pointer', padding: '4px 4px', textAlign: 'center', borderBottom: '2px solid #444', color: '#ffd700' }}>Núcleo (7) {sortConfig.key === 'cNucleo' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('cTiers')} style={{ cursor: 'pointer', padding: '4px 4px', textAlign: 'center', borderBottom: '2px solid #444', color: '#e57373' }}>Tercios (12) {sortConfig.key === 'cTiers' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('cOrph')} style={{ cursor: 'pointer', padding: '4px 4px', textAlign: 'center', borderBottom: '2px solid #444', color: '#64b5f6' }}>Huérf. (8) {sortConfig.key === 'cOrph' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                <th onClick={() => handleSort('cVecinos')} style={{ cursor: 'pointer', padding: '4px 4px', textAlign: 'center', borderBottom: '2px solid #444', color: '#81c784' }}>Vecinos (17) {sortConfig.key === 'cVecinos' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, idx) => {
                const isTop = idx < 3;
                const isSelected = isUserSelection(row.sys);
                // Reduce background opacity slightly if cells have their own active background
                const rowBg = isTop ? 'rgba(255, 215, 0, 0.05)' : isSelected ? 'rgba(0, 255, 255, 0.05)' : 'transparent';
                const rowBorder = isSelected ? '1px solid rgba(0,255,255,0.3)' : '1px solid #222';

                return (
                  <tr key={row.sys} style={{ background: rowBg, borderBottom: rowBorder, transition: 'background 0.2s' }}>
                    <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block', width: '26px', height: '26px', lineHeight: '26px', textAlign: 'center', borderRadius: '50%',
                        background: isTop ? '#ffd700' : '#333', color: isTop ? '#000' : '#fff', fontWeight: 'bold', fontSize: '0.9em'
                      }}>{idx + 1}</span>
                    </td>
                    <td style={{ padding: '6px 10px', fontWeight: isSelected ? 'bold' : 'normal', color: isSelected ? '#0ff' : 'inherit' }}>
                      SYS {row.sys}
                    </td>
                    {renderCell(row.total, row.dTotal, row.bTotal, '#0f0', 37)}
                    {renderCell(row.cNucleo, row.dNucleo, row.bNucleo, '#ffd700', row.nNucleo)}
                    {renderCell(row.cTiers, row.dTiers, row.bTiers, '#e57373', row.nTiers)}
                    {renderCell(row.cOrph, row.dOrph, row.bOrph, '#64b5f6', row.nOrph)}
                    {renderCell(row.cVecinos, row.dVecinos, row.bVecinos, '#81c784', row.nVecinos)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SystemEfficiencyModal;
