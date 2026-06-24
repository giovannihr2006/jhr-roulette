import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';

// --- ROULETTE NUMBER DEFINITIONS ---
const ALL_NUMBERS = Array.from({ length: 37 }, (_, i) => i); // 0-36
const REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Number classification functions
const isRed = (n) => REDS.includes(n);
const isBlack = (n) => n !== 0 && !REDS.includes(n);
const isEven = (n) => n !== 0 && n % 2 === 0;
const isOdd = (n) => n !== 0 && n % 2 !== 0;
const isLow = (n) => n >= 1 && n <= 18;
const isHigh = (n) => n >= 19 && n <= 36;
const isDoc1 = (n) => n >= 1 && n <= 12;
const isDoc2 = (n) => n >= 13 && n <= 24;
const isDoc3 = (n) => n >= 25 && n <= 36;
const isCol1 = (n) => n !== 0 && n % 3 === 1;
const isCol2 = (n) => n !== 0 && n % 3 === 2;
const isCol3 = (n) => n !== 0 && n % 3 === 0;

// Calculate Economic Metrics for "Fixed 4-Chip Outside Bet" Strategy
const calculateEconomics = (bajoAlto, color, parImpar, docCol) => {
    // Strategy: Bet 1 chip on each of the 4 conditions. Total Cost = 4.
    // Payouts:
    // - Even Money (Bajo/Alto, Color, Par/Impar): Pays 1:1 (+1 profit, return 2)
    // - Dozen/Column: Pays 2:1 (+2 profit, return 3)

    let safetyCount = 0; // Net >= 0
    let powerCount = 0;  // Net > 0
    let totalNet = 0;

    // Iterate all 37 numbers (including 0) to get true EV
    for (let n = 0; n <= 36; n++) {
        let winCount = 0;
        let returns = 0;

        // 0 always loses all outside bets in this rule set
        if (n !== 0) {
            // Check Bajo/Alto (Pays 2)
            if (bajoAlto === 'BAJO' && isLow(n)) returns += 2;
            else if (bajoAlto === 'ALTO' && isHigh(n)) returns += 2;

            // Check Color (Pays 2)
            if (color === 'NEGRO' && isBlack(n)) returns += 2;
            else if (color === 'ROJO' && isRed(n)) returns += 2;

            // Check Par/Impar (Pays 2)
            if (parImpar === 'PAR' && isEven(n)) returns += 2;
            else if (parImpar === 'IMPAR' && isOdd(n)) returns += 2;

            // Check Zone (Pays 3)
            if (docCol.includes('DOC')) {
                const doc1 = docCol.includes('1RA');
                const doc2 = docCol.includes('2DA');
                if ((doc1 && isDoc1(n)) || (doc2 && isDoc2(n)) || (!doc1 && !doc2 && isDoc3(n))) returns += 3;
            } else {
                // Column
                const col1 = docCol.includes('1RA');
                const col2 = docCol.includes('2DA');
                if ((col1 && isCol1(n)) || (col2 && isCol2(n)) || (!col1 && !col2 && isCol3(n))) returns += 3;
            }
        }

        const net = returns - 4; // Cost is always 4
        totalNet += net;

        if (net >= 0) safetyCount++;
        if (net > 0) powerCount++;
    }

    // Averages and Percentages over 37 spins
    return {
        safety: (safetyCount / 37) * 100,
        power: (powerCount / 37) * 100,
        ev: totalNet / 37
    };
};

// Generate 48 methods with their attributes
const generateMethodsData = () => {
    const data = [];
    const combinations = [];

    // Generate all 48 combinations
    // bajo/alto (2) × color (2) × par/impar (2) × doc (3) × col (3) = 72, but we use 48
    // Pattern: cycling through all combinations systematically

    const bajoAlto = ['BAJO', 'ALTO'];
    const colors = ['NEGRO', 'ROJO'];
    const parImpar = ['PAR', 'IMPAR'];
    const docenas = ['1RA DOC', '2DA DOC', '3RA DOC'];
    const columnas = ['1RA COL', '2DACOL', '3RACOL'];

    // Generate systematic 48 combinations
    let methodNum = 1;
    for (let ba of bajoAlto) {
        for (let col of colors) {
            for (let pi of parImpar) {
                for (let doc of docenas) {
                    for (let column of columnas) {
                        if (methodNum <= 48) {
                            data.push({
                                metodo: methodNum,
                                bajoAlto: ba,
                                color: col,
                                parImpar: pi,
                                docCol: `${doc.replace(' DOC', '')} DOC`.replace('1RA', '1RA').replace('2DA', '2DA').replace('3RA', '3RA'),
                                columna: column
                            });
                            methodNum++;
                        }
                    }
                }
            }
        }
    }

    return data;
};

// Generate the exact pattern from the image with efficiency calculation
const generateMethodsWithEfficiency = () => {
    const pattern = [
        // método, bajo/alto, color, par/imp, doc/col
        [1, 'BAJO', 'NEGRO', 'PAR', '1RA DOC'],
        [2, 'BAJO', 'NEGRO', 'PAR', '2DA DOC'],
        [3, 'BAJO', 'NEGRO', 'PAR', '3RA DOC'],
        [4, 'BAJO', 'NEGRO', 'PAR', '1RA COL'],
        [5, 'BAJO', 'NEGRO', 'PAR', '2DA COL'],
        [6, 'BAJO', 'NEGRO', 'PAR', '3RA COL'],
        [7, 'ALTO', 'NEGRO', 'PAR', '1RA DOC'],
        [8, 'ALTO', 'NEGRO', 'PAR', '2DA DOC'],
        [9, 'ALTO', 'NEGRO', 'PAR', '3RA DOC'],
        [10, 'ALTO', 'NEGRO', 'PAR', '1RA COL'],
        [11, 'ALTO', 'NEGRO', 'PAR', '2DA COL'],
        [12, 'ALTO', 'NEGRO', 'PAR', '3RA COL'],
        [13, 'BAJO', 'NEGRO', 'IMPAR', '1RA DOC'],
        [14, 'BAJO', 'NEGRO', 'IMPAR', '2DA DOC'],
        [15, 'BAJO', 'NEGRO', 'IMPAR', '3RA DOC'],
        [16, 'BAJO', 'NEGRO', 'IMPAR', '1RA COL'],
        [17, 'BAJO', 'NEGRO', 'IMPAR', '2DA COL'],
        [18, 'BAJO', 'NEGRO', 'IMPAR', '3RA COL'],
        [19, 'ALTO', 'NEGRO', 'IMPAR', '1RA DOC'],
        [20, 'ALTO', 'NEGRO', 'IMPAR', '2DA DOC'],
        [21, 'ALTO', 'NEGRO', 'IMPAR', '3RA DOC'],
        [22, 'ALTO', 'NEGRO', 'IMPAR', '1RA COL'],
        [23, 'ALTO', 'NEGRO', 'IMPAR', '2DA COL'],
        [24, 'ALTO', 'NEGRO', 'IMPAR', '3RA COL'],
        [25, 'BAJO', 'ROJO', 'PAR', '1RA DOC'],
        [26, 'BAJO', 'ROJO', 'PAR', '2DA DOC'],
        [27, 'BAJO', 'ROJO', 'PAR', '3RA DOC'],
        [28, 'BAJO', 'ROJO', 'PAR', '1RA COL'],
        [29, 'BAJO', 'ROJO', 'PAR', '2DA COL'],
        [30, 'BAJO', 'ROJO', 'PAR', '3RA COL'],
        [31, 'ALTO', 'ROJO', 'PAR', '1RA DOC'],
        [32, 'ALTO', 'ROJO', 'PAR', '2DA DOC'],
        [33, 'ALTO', 'ROJO', 'PAR', '3RA DOC'],
        [34, 'ALTO', 'ROJO', 'PAR', '1RA COL'],
        [35, 'ALTO', 'ROJO', 'PAR', '2DA COL'],
        [36, 'ALTO', 'ROJO', 'PAR', '3RA COL'],
        [37, 'BAJO', 'ROJO', 'IMPAR', '1RA DOC'],
        [38, 'BAJO', 'ROJO', 'IMPAR', '2DA DOC'],
        [39, 'BAJO', 'ROJO', 'IMPAR', '3RA DOC'],
        [40, 'BAJO', 'ROJO', 'IMPAR', '1RA COL'],
        [41, 'BAJO', 'ROJO', 'IMPAR', '2DA COL'],
        [42, 'BAJO', 'ROJO', 'IMPAR', '3RA COL'],
        [43, 'ALTO', 'ROJO', 'IMPAR', '1RA DOC'],
        [44, 'ALTO', 'ROJO', 'IMPAR', '2DA DOC'],
        [45, 'ALTO', 'ROJO', 'IMPAR', '3RA DOC'],
        [46, 'ALTO', 'ROJO', 'IMPAR', '1RA COL'],
        [47, 'ALTO', 'ROJO', 'IMPAR', '2DA COL'],
        [48, 'ALTO', 'ROJO', 'IMPAR', '3RA COL'],
    ];

    return pattern.map(([metodo, bajoAlto, color, parImpar, docCol]) => {
        // Calculate standard 'intersecting' numbers for betting purpose (Click to Bet)
        // We still need the list of intersection numbers for the "Bet on Intersection" feature?
        // Wait, user said "Clicking Method 1 -> Places 4 Outside Bets".
        // Let's first update the Metrics. We can keep 'intersect numbers' logic if needed,
        // but for now let's focus on the Table Data.

        // Re-implement basic intersection finding just for the "numbers" property (used for betting?)
        // Actually, previous logic had 'numbers'. Let's keep a small helper for that if we need it for betting.
        // But for now, let's map the economic data.

        const economics = calculateEconomics(bajoAlto, color, parImpar, docCol);

        // We need 'numbers' for the onBet handler passed to CasinoTable.
        // IF the user wants "Place 4 Outside Bets", then 'numbers' should be the LIST of 4 BetType IDs, not specific numbers.
        // But let's stick to the prompt: Update Columns.
        // I will keep 'numbers' as intersection for now to avoid breaking the 'onBet' if it expects numbers.
        // However, I will calculate it internally here briefly.

        let matchingNumbers = ALL_NUMBERS.filter(n => n !== 0);
        if (bajoAlto === 'BAJO') matchingNumbers = matchingNumbers.filter(isLow); else matchingNumbers = matchingNumbers.filter(isHigh);
        if (color === 'NEGRO') matchingNumbers = matchingNumbers.filter(isBlack); else matchingNumbers = matchingNumbers.filter(isRed);
        if (parImpar === 'PAR') matchingNumbers = matchingNumbers.filter(isEven); else matchingNumbers = matchingNumbers.filter(isOdd);
        if (docCol.includes('DOC')) {
            if (docCol.includes('1RA')) matchingNumbers = matchingNumbers.filter(isDoc1);
            else if (docCol.includes('2DA')) matchingNumbers = matchingNumbers.filter(isDoc2);
            else matchingNumbers = matchingNumbers.filter(isDoc3);
        } else {
            if (docCol.includes('1RA')) matchingNumbers = matchingNumbers.filter(isCol1);
            else if (docCol.includes('2DA')) matchingNumbers = matchingNumbers.filter(isCol2);
            else matchingNumbers = matchingNumbers.filter(isCol3);
        }

        // Generate the list of 4 Outside Bet IDs for this method
        const betIds = [];
        // 1. Bajo/Alto
        betIds.push(bajoAlto === 'BAJO' ? 'LOW' : 'HIGH');
        // 2. Color
        betIds.push(color === 'NEGRO' ? 'BLACK' : 'RED');
        // 3. Par/Impar
        betIds.push(parImpar === 'PAR' ? 'EVEN' : 'ODD');
        // 4. Zone (Dozen or Column)
        if (docCol.includes('DOC')) {
            if (docCol.includes('1RA')) betIds.push('DOZ1');
            else if (docCol.includes('2DA')) betIds.push('DOZ2');
            else betIds.push('DOZ3'); // 3RA
        } else {
            // Column
            if (docCol.includes('1RA')) betIds.push('COL1');
            else if (docCol.includes('2DA')) betIds.push('COL2');
            else betIds.push('COL3'); // 3RA
        }

        return {
            metodo,
            bajoAlto,
            color,
            parImpar,
            docCol,
            safety: economics.safety,
            power: economics.power,
            ev: economics.ev,
            // Updated to use the 4 Outside Bets instead of intersection numbers
            betIds: betIds,
            // Keep specific numbers for reference (optional, but good for debugging)
            numbers: matchingNumbers
        };
    });
};

const METHODS_DATA = generateMethodsWithEfficiency();

// --- FILTER DROPDOWN COMPONENT ---
const FilterDropdown = ({ options, value, onChange, label }) => {
    return (
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
            <span>{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    padding: '0',
                    marginLeft: '2px',
                    outline: 'none'
                }}
            >
                <option value="" style={{ background: '#222', color: '#fff' }}>▼</option>
                {options.map(opt => (
                    <option key={opt} value={opt} style={{ background: '#222', color: '#fff' }}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    );
};

// --- RICH TOOLTIP COMPONENT (MAXIMIZED) ---
const RichHeaderTooltip = ({ title, concept, analogy, example, recommendation, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'help' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>ℹ️</div>

            {isVisible && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    // Right aligned
                    right: '0',
                    width: '600px', // Requested "Mucho más grande"
                    background: '#212121',
                    border: '2px solid #666',
                    borderRadius: '16px',
                    padding: '35px',
                    boxShadow: '0 10px 50px rgba(0,0,0,0.95)',
                    zIndex: 99999,
                    textAlign: 'left',
                    marginTop: '20px',
                    color: '#e0e0e0',
                    fontSize: '1.2rem', // Requested "Fuentes mucho más grandes"
                    lineHeight: '1.6',
                    whiteSpace: 'normal'
                }}>
                    <div style={{ borderBottom: '2px solid #424242', paddingBottom: '15px', marginBottom: '20px' }}>
                        <strong style={{ color: '#fff', fontSize: '1.8rem' }}>{title}</strong>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong style={{ color: '#90caf9', fontSize: '1.4rem' }}>Concepto:</strong><br />
                        {concept}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <strong style={{ color: '#ffb74d', fontSize: '1.4rem' }}>Analogía:</strong><br />
                        <em>{analogy}</em>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.08)', padding: '20px', borderRadius: '10px', marginBottom: '20px', borderLeft: '5px solid #66bb6a' }}>
                        <strong style={{ color: '#66bb6a', fontSize: '1.3rem' }}>🔍 Análisis de Escenarios:</strong>
                        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {example}
                        </div>
                    </div>

                    <div style={{ borderTop: '2px solid #444', paddingTop: '15px', marginTop: '10px' }}>
                        <strong style={{ color: '#ce93d8', fontSize: '1.3rem' }}>🎯 Veredicto:</strong><br />
                        <em>{recommendation}</em>
                    </div>

                    {/* Giant Arrow */}
                    <div style={{
                        position: 'absolute', top: '-10px', right: '30px',
                        width: 0, height: 0,
                        borderLeft: '10px solid transparent',
                        borderRight: '10px solid transparent',
                        borderBottom: '10px solid #666'
                    }}></div>
                </div>
            )}
        </div>
    );
};

// Tooltip Content Definitions (Expanded Scenarios)
const TOOLTIP_CONTENT = {
    safety: {
        title: "🛡️ ESCUDO (Seguridad)",
        concept: "Define qué tan difícil es que pierdas dinero en una ronda. Mide la Cobertura Defensiva.",
        analogy: "Tu Blindaje contra la banca.",
        example: (
            <>
                <div>✅ <strong>Si es ALTO (&gt;60%):</strong> Juegas seguro. La gran mayoría de los giros te devuelven tu dinero o te dan ganancia. Es ideal para resistir malas rachas.</div>
                <div style={{ marginTop: '5px' }}>❌ <strong>Si es BAJO (&lt;40%):</strong> Juegas descubierto. Perderás la apuesta completa muy seguido. Necesitas mucha suerte o una banca enorme para aguantar.</div>
            </>
        ),
        recommendation: "Elige métodos con ESCUDO ALTO si quieres jugar sesiones largas y conservar tu capital."
    },
    power: {
        title: "⚡ POTENCIA (Frecuencia)",
        concept: "Define qué tan seguido obtendrás BENEFICIO NETO (Ganancia real al bolsillo).",
        analogy: "El Filo de tu Espada.",
        example: (
            <>
                <div>✅ <strong>Si es ALTO (&gt;25%):</strong> Verás crecer tu pila de fichas con frecuencia. Es gratificante y emocionante.</div>
                <div style={{ marginTop: '5px' }}>❌ <strong>Si es BAJO (&lt;15%):</strong> Ganarás muy pocas veces. La mayoría del tiempo solo estarás 'recuperando' o perdiendo. Es un juego aburrido y de desgaste.</div>
            </>
        ),
        recommendation: "Elige métodos con POTENCIA ALTA si buscas subir tu saldo rápidamente, asumiendo que habrá riesgo."
    },
    ev: {
        title: "💲 VALOR (EV)",
        concept: "Es el cálculo matemático honesto. Te dice cuánto cuesta realmente cada giro a largo plazo.",
        analogy: "El Precio de la Entrada.",
        example: (
            <>
                <div>✅ <strong>Si es MEJOR (Cercano a 0, ej: -0.10):</strong> Es una 'oferta'. Estás perdiendo lo mínimo posible matemáticamente. Es la elección inteligente.</div>
                <div style={{ marginTop: '5px' }}>❌ <strong>Si es PEOR (Lejano a 0, ej: -0.50):</strong> Es un 'robo'. Estás pagando demasiado caro por ver girar la ruleta. A largo plazo, te arruinarás más rápido.</div>
            </>
        ),
        recommendation: "Elige siempre el mejor EV posible (el número menos negativo) para maximizar tu supervivencia matemática."
    }
};

// --- MAIN COMPONENT ---
const MethodsTable = ({ isOpen, onClose, onBet }) => {
    // Sort state: column key and direction ('asc' | 'desc' | null)
    const [sortColumn, setSortColumn] = useState('safety');
    const [sortDirection, setSortDirection] = useState('desc');

    // Get unique values for each column (unused unless filtering is re-implemented)
    // kept for reference if needed later

    // Handle sort click

    // Handle sort click
    const handleSort = (column) => {
        if (sortColumn === column) {
            // Toggle direction or clear
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    // Get sort indicator
    const getSortIndicator = (column) => {
        if (sortColumn !== column) return ' ⇅';
        if (sortDirection === 'asc') return ' ▲';
        if (sortDirection === 'desc') return ' ▼';
        return ' ⇅';
    };

    // Apply filters and sorting
    // Apply sorting
    const filteredAndSortedData = useMemo(() => {
        // Since filters are currently not implemented in the UI, we just copy the data
        let data = [...METHODS_DATA];

        // Sort if a column is selected
        if (sortColumn && sortDirection) {
            data.sort((a, b) => {
                let valA, valB;

                switch (sortColumn) {
                    case 'metodo':
                        valA = a.metodo;
                        valB = b.metodo;
                        break;
                    case 'bajoAlto':
                        valA = a.bajoAlto;
                        valB = b.bajoAlto;
                        break;
                    case 'color':
                        valA = a.color;
                        valB = b.color;
                        break;
                    case 'parImpar':
                        valA = a.parImpar;
                        valB = b.parImpar;
                        break;
                    case 'docCol':
                        valA = a.docCol;
                        valB = b.docCol;
                        break;
                    case 'safety':
                        valA = a.safety;
                        valB = b.safety;
                        break;
                    case 'power':
                        valA = a.power;
                        valB = b.power;
                        break;
                    case 'ev':
                        valA = a.ev;
                        valB = b.ev;
                        break;
                    default:
                        return 0;
                }

                // Compare based on type
                if (typeof valA === 'number' && typeof valB === 'number') {
                    // Primary Sort
                    if (valA !== valB) {
                        return sortDirection === 'asc' ? valA - valB : valB - valA;
                    }
                    // Secondary Sort (Tie-Breakers)
                    if (sortColumn === 'safety') {
                        // If Safety represents coverage, tie-break with Power (Net Win Potential)
                        return b.power - a.power;
                    }
                    if (sortColumn === 'power') {
                        // If Power matches, tie-break with Safety (Risk reduction)
                        return b.safety - a.safety;
                    }
                    return 0;
                } else {
                    const strA = String(valA);
                    const strB = String(valB);
                    return sortDirection === 'asc'
                        ? strA.localeCompare(strB)
                        : strB.localeCompare(strA);
                }
            });
        }

        return data;
    }, [sortColumn, sortDirection]);

    // Clear all filters and sort
    const clearFilters = () => {
        setFilterMetodo('');
        setFilterBajoAlto('');
        setFilterColor('');
        setFilterParImpar('');
        setFilterDocCol('');
        setFilterFavorable('');
        setFilterDecimal('');
        setFilterRating('');
        setSortColumn(null);
        setSortDirection(null);
    };

    // --- VIBRANT FULL-CELL STYLING ---
    const getFullCellStyle = (type, value) => {
        const base = {
            // TD specific reset
            height: '100%',
            textAlign: 'center',
            verticalAlign: 'middle', // Standard table alignment
            fontWeight: '900', // Maximum boldness
            fontSize: '1.1rem', // Bigger font
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
        };

        switch (type) {
            case 'bajoAlto':
                return value === 'BAJO'
                    ? { ...base, background: '#1976d2', color: '#fff' } // Vibrant Blue
                    : { ...base, background: '#ffab00', color: '#000' }; // Vibrant Amber
            case 'color':
                return value === 'NEGRO'
                    // Using a dark slate instead of pure black to avoid "abuso del negro" complaints
                    ? { ...base, background: '#37474f', color: '#fff' }
                    : { ...base, background: '#d50000', color: '#fff' }; // Vibrant Red
            case 'parImpar':
                return value === 'PAR'
                    ? { ...base, background: '#7b1fa2', color: '#fff' } // Purple
                    : { ...base, background: '#ffd600', color: '#000' }; // Yellow
            case 'docCol':
                const isDoc = value.includes('DOC');
                return {
                    ...base,
                    background: isDoc ? '#00695c' : '#2e7d32', // Teal vs Green
                    color: '#fff',
                    fontSize: '0.85rem' // Slightly smaller for longer text
                };
            default:
                return base;
        }
    };

    // Method Number Avatar Style
    const getMethodIdStyle = (isTop) => ({
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '40px', height: '40px', borderRadius: '50%',
        background: isTop ? '#ffd700' : '#424242',
        color: isTop ? '#000' : '#fff',
        fontWeight: 'bold', fontSize: '1.2rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        margin: '0 auto',
        border: '2px solid rgba(255,255,255,0.1)'
    });

    const maxFavorable = Math.max(...METHODS_DATA.map(d => d.favorable));

    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div style={{
                background: '#212121', // Lighter dark background
                border: '1px solid #444',
                borderRadius: '8px',
                width: '95%', maxWidth: '1400px', height: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 0 60px rgba(0,0,0,0.5)',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* HEADER */}
                <div style={{
                    padding: '15px 25px', background: '#263238', borderBottom: '1px solid #37474f',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))' }}>💠</div>
                        <div>
                            <h2 style={{ margin: 0, color: '#eceff1', fontSize: '1.8rem', letterSpacing: '2px', fontWeight: '900' }}>TABLA DE MÉTODOS</h2>
                            <span style={{ color: '#b0bec5', fontSize: '1rem', fontWeight: 'bold' }}>VISTA DE ALTO CONTRASTE</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={clearFilters} style={{
                            padding: '10px 20px', background: '#37474f', border: '1px solid #546e7a', color: '#fff',
                            borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem',
                            textTransform: 'uppercase'
                        }}>LIMPIAR</button>
                        <button onClick={onClose} style={{
                            background: 'transparent', border: 'none', color: '#fff', fontSize: '2.5rem',
                            cursor: 'pointer', lineHeight: 0.5, fontWeight: 'bold'
                        }}>&times;</button>
                    </div>
                </div>

                {/* TABLE CONTAINER */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#000' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#eceff1', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                            <tr>
                                {[
                                    { id: 'metodo', label: '#', width: '60px', title: 'Identificador único del método' },
                                    { id: 'bajoAlto', label: 'BAJO/ALTO', width: '120px', title: 'Filtro de Mitad: 1-18 vs 19-36' },
                                    { id: 'color', label: 'COLOR', width: '120px', title: 'Filtro de Color: Rojo vs Negro' },
                                    { id: 'parImpar', label: 'PAR/IMPAR', width: '120px', title: 'Filtro de Paridad: Par vs Impar' },
                                    { id: 'docCol', label: 'ZONA', width: '140px', title: 'Filtro de Zona: Docenas o Columnas' },
                                    { id: 'safety', label: '🛡️ ESCUDO', width: '130px', isRich: true },
                                    { id: 'power', label: '⚡ POTENCIA', width: '130px', isRich: true },
                                    { id: 'ev', label: '💲 VALOR', width: '120px', isRich: true }
                                ].map(col => (
                                    <th key={col.id} style={{
                                        padding: '15px 5px', textAlign: 'center', borderBottom: '3px solid #b0bec5',
                                        cursor: 'pointer', userSelect: 'none', minWidth: col.width,
                                        background: '#cfd8dc', color: '#263238', fontSize: '1rem', fontWeight: '900',
                                        // Specific z-index for tooltips to float above
                                        zIndex: 20
                                    }} onClick={() => handleSort(col.id)} title={!col.isRich ? col.title : undefined}>
                                        {col.isRich ? (
                                            <RichHeaderTooltip
                                                title={TOOLTIP_CONTENT[col.id].title}
                                                concept={TOOLTIP_CONTENT[col.id].concept}
                                                analogy={TOOLTIP_CONTENT[col.id].analogy}
                                                example={TOOLTIP_CONTENT[col.id].example}
                                                recommendation={TOOLTIP_CONTENT[col.id].recommendation}
                                            >
                                                {col.label} {getSortIndicator(col.id)}
                                            </RichHeaderTooltip>
                                        ) : (
                                            <>{col.label} {getSortIndicator(col.id)}</>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedData.map((row, idx) => {
                                // Determine "Top Pick" status based on Sort Order
                                const isWinner = idx === 0;
                                const isRunnerUp = idx === 1;

                                // Dynamic Row Style for Leaders
                                const rowStyle = {
                                    height: '55px',
                                    borderBottom: '1px solid #455a64',
                                    // Highlight background for Top 2
                                    background: isWinner ? 'rgba(255, 215, 0, 0.15)' : (isRunnerUp ? 'rgba(192, 192, 192, 0.1)' : 'transparent'),
                                    boxShadow: isWinner ? 'inset 3px 0 0 gold' : (isRunnerUp ? 'inset 3px 0 0 silver' : 'none')
                                };

                                return (
                                    <tr key={row.metodo} style={rowStyle}>
                                        {/* ID with Rank Badge */}
                                        <td
                                            style={{ padding: '0', background: isWinner ? '#3e2723' : '#263238', textAlign: 'center', cursor: 'pointer', position: 'relative' }}
                                            onClick={() => onBet && onBet(row.betIds)}
                                            title={`Apostar 4 Fichas: ${row.betIds.join(' + ')}`}
                                        >
                                            {isWinner && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', fontSize: '0.8rem', background: '#ffd700', color: '#000', fontWeight: 'bold' }}>MEJOR OPCIÓN</div>}
                                            {isRunnerUp && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', fontSize: '0.8rem', background: '#c0c0c0', color: '#000', fontWeight: 'bold' }}>2DA OPCIÓN</div>}

                                            <div style={getMethodIdStyle(row.favorable === maxFavorable)}>
                                                {isWinner ? '👑' : (isRunnerUp ? '🥈' : row.metodo)}
                                            </div>
                                        </td>

                                        {/* ATTRIBUTES - FULL CELL (Applied to TD) */}
                                        <td style={{ padding: '0', borderRight: '1px solid rgba(0,0,0,0.1)', ...getFullCellStyle('bajoAlto', row.bajoAlto) }}>
                                            {row.bajoAlto}
                                        </td>
                                        <td style={{ padding: '0', borderRight: '1px solid rgba(0,0,0,0.1)', ...getFullCellStyle('color', row.color) }}>
                                            {row.color}
                                        </td>
                                        <td style={{ padding: '0', borderRight: '1px solid rgba(0,0,0,0.1)', ...getFullCellStyle('parImpar', row.parImpar) }}>
                                            {row.parImpar}
                                        </td>
                                        <td style={{ padding: '0', borderRight: '1px solid rgba(0,0,0,0.1)', ...getFullCellStyle('docCol', row.docCol) }}>
                                            {row.docCol}
                                        </td>

                                        <td style={{ padding: '0', textAlign: 'center', background: '#2e7d32', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {row.safety.toFixed(1)}%
                                        </td>
                                        <td style={{ padding: '0', textAlign: 'center', background: '#ff8f00', color: '#000', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                            {row.power.toFixed(1)}%
                                        </td>
                                        <td style={{
                                            padding: '0', textAlign: 'center',
                                            background: row.ev >= -0.2 ? '#00c853' : (row.ev >= -0.5 ? '#fdd835' : '#d50000'),
                                            color: row.ev >= -0.5 ? '#000' : '#fff',
                                            fontSize: '1.2rem', fontWeight: 'bold'
                                        }}>
                                            {row.ev.toFixed(3)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {/* FOOTER */}
                <div style={{ padding: '15px', background: '#111', borderTop: '1px solid #333', textAlign: 'center', color: '#666' }}>
                    Mostrando {filteredAndSortedData.length} configuraciones de {METHODS_DATA.length} posibles
                </div>
            </div>
        </div>,
        document.body
    );
};

export default MethodsTable;
