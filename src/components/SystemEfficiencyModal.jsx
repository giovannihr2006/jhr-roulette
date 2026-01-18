import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  return bets;
};

const BETS = generateBets();

const calculateMinCost = (requiredNums) => {
  let remaining = new Set(requiredNums);
  let totalCost = 0;
  let chosenBets = [];

  while (remaining.size > 0) {
    let bestBet = null;
    let maxCovered = 0;

    for (const bet of BETS) {
      let useful = 0;
      let invalid = false;
      for (const n of bet.nums) {
        if (remaining.has(n)) useful++;
        else invalid = true;
      }
      if (invalid) continue; // Strict clean cover
      if (useful > maxCovered) {
        maxCovered = useful;
        bestBet = bet;
      }
    }

    if (bestBet) {
      totalCost += bestBet.cost;
      chosenBets.push(bestBet.id);
      for (const n of bestBet.nums) remaining.delete(n);
    } else {
      if (remaining.size > 0) {
        const arr = Array.from(remaining);
        totalCost += arr.length;
        arr.forEach(n => chosenBets.push(n.toString()));
        remaining.clear();
      }
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
  return {
    nucleo: getSlice(-3, 3),
    vecinos: getSlice(-8, 8),
    tiers: getSlice(12, 23),
    orphelins: [...getSlice(9, 11), ...getSlice(24, 28)]
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
        // Nucleo (7 nums)
        cNucleo: resNucleo.cost,
        dNucleo: (resNucleo.cost / 7).toFixed(3),
        bNucleo: resNucleo.bets,
        // Tiers (12 nums)
        cTiers: resTiers.cost,
        dTiers: (resTiers.cost / 12).toFixed(3),
        bTiers: resTiers.bets,
        // Orph (8 nums)
        cOrph: resOrph.cost,
        dOrph: (resOrph.cost / 8).toFixed(3),
        bOrph: resOrph.bets,
        // Vecinos (17 nums)
        cVecinos: resVecinos.cost,
        dVecinos: (resVecinos.cost / 17).toFixed(3),
        bVecinos: resVecinos.bets,
        // Total (Complete System - All 37 Numbers)
        total,
        dTotal,
        bTotal, // All bets combined
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

  const renderCell = (cost, decimal, bets, color, denominator) => {
    const active = isSectorActive(bets);
    const isElite = cost <= 4;

    return (
      <td
        onClick={() => handleSectorClick(bets)}
        style={{
          padding: '2px 4px',
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
          transition: 'all 0.2s'
        }}
        title={`Click to place bets${isElite ? ' (Elite Efficiency)' : ''}`}
      >
        {isElite && <span style={{ marginRight: '4px', fontSize: '0.9em' }}>💎</span>}
        <span style={{ fontSize: '1.2em' }}>{cost}/{denominator}</span>
        <div style={{ fontSize: '0.7em', color: active ? '#eee' : '#bbb', marginTop: '0px' }}>{decimal}</div>
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
                    {renderCell(row.cNucleo, row.dNucleo, row.bNucleo, '#ffd700', 7)}
                    {renderCell(row.cTiers, row.dTiers, row.bTiers, '#e57373', 12)}
                    {renderCell(row.cOrph, row.dOrph, row.bOrph, '#64b5f6', 8)}
                    {renderCell(row.cVecinos, row.dVecinos, row.bVecinos, '#81c784', 17)}
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
