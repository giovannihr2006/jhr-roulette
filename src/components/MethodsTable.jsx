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

// Calculate F/N efficiency for a method combination
const calculateEfficiency = (bajoAlto, color, parImpar, docCol) => {
    // Get the numbers that match ALL criteria
    let matchingNumbers = ALL_NUMBERS.filter(n => n !== 0); // Exclude 0

    // Filter by bajo/alto
    if (bajoAlto === 'BAJO') {
        matchingNumbers = matchingNumbers.filter(isLow);
    } else {
        matchingNumbers = matchingNumbers.filter(isHigh);
    }

    // Filter by color
    if (color === 'NEGRO') {
        matchingNumbers = matchingNumbers.filter(isBlack);
    } else {
        matchingNumbers = matchingNumbers.filter(isRed);
    }

    // Filter by par/impar
    if (parImpar === 'PAR') {
        matchingNumbers = matchingNumbers.filter(isEven);
    } else {
        matchingNumbers = matchingNumbers.filter(isOdd);
    }

    // Filter by docena or columna
    if (docCol.includes('DOC')) {
        if (docCol.includes('1RA')) {
            matchingNumbers = matchingNumbers.filter(isDoc1);
        } else if (docCol.includes('2DA')) {
            matchingNumbers = matchingNumbers.filter(isDoc2);
        } else {
            matchingNumbers = matchingNumbers.filter(isDoc3);
        }
    } else {
        // Columna
        if (docCol.includes('1RA')) {
            matchingNumbers = matchingNumbers.filter(isCol1);
        } else if (docCol.includes('2DA')) {
            matchingNumbers = matchingNumbers.filter(isCol2);
        } else {
            matchingNumbers = matchingNumbers.filter(isCol3);
        }
    }

    const favorableCount = matchingNumbers.length;
    // F/N = Favorable / Total possible (36 numbers, excluding 0)
    const efficiency = favorableCount / 36;

    return {
        favorable: favorableCount,
        total: 36,
        efficiency: efficiency,
        numbers: matchingNumbers
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
        [5, 'BAJO', 'NEGRO', 'PAR', '2DACOL'],
        [6, 'BAJO', 'NEGRO', 'PAR', '3RACOL'],
        [7, 'ALTO', 'NEGRO', 'PAR', '1RA DOC'],
        [8, 'ALTO', 'NEGRO', 'PAR', '2DA DOC'],
        [9, 'ALTO', 'NEGRO', 'PAR', '3RA DOC'],
        [10, 'ALTO', 'NEGRO', 'PAR', '1RA COL'],
        [11, 'ALTO', 'NEGRO', 'PAR', '2DACOL'],
        [12, 'ALTO', 'NEGRO', 'PAR', '3RACOL'],
        [13, 'BAJO', 'NEGRO', 'IMPAR', '1RA DOC'],
        [14, 'BAJO', 'NEGRO', 'IMPAR', '2DA DOC'],
        [15, 'BAJO', 'NEGRO', 'IMPAR', '3RA DOC'],
        [16, 'BAJO', 'NEGRO', 'IMPAR', '1RA COL'],
        [17, 'BAJO', 'NEGRO', 'IMPAR', '2DACOL'],
        [18, 'BAJO', 'NEGRO', 'IMPAR', '3RACOL'],
        [19, 'ALTO', 'NEGRO', 'IMPAR', '1RA DOC'],
        [20, 'ALTO', 'NEGRO', 'IMPAR', '2DA DOC'],
        [21, 'ALTO', 'NEGRO', 'IMPAR', '3RA DOC'],
        [22, 'ALTO', 'NEGRO', 'IMPAR', '1RA COL'],
        [23, 'ALTO', 'NEGRO', 'IMPAR', '2DACOL'],
        [24, 'ALTO', 'NEGRO', 'IMPAR', '3RACOL'],
        [25, 'BAJO', 'ROJO', 'PAR', '1RA DOC'],
        [26, 'BAJO', 'ROJO', 'PAR', '2DA DOC'],
        [27, 'BAJO', 'ROJO', 'PAR', '3RA DOC'],
        [28, 'BAJO', 'ROJO', 'PAR', '1RA COL'],
        [29, 'BAJO', 'ROJO', 'PAR', '2DACOL'],
        [30, 'BAJO', 'ROJO', 'PAR', '3RACOL'],
        [31, 'ALTO', 'ROJO', 'PAR', '1RA DOC'],
        [32, 'ALTO', 'ROJO', 'PAR', '2DA DOC'],
        [33, 'ALTO', 'ROJO', 'PAR', '3RA DOC'],
        [34, 'ALTO', 'ROJO', 'PAR', '1RA COL'],
        [35, 'BAJO', 'ROJO', 'PAR', '2DACOL'],
        [36, 'ALTO', 'ROJO', 'PAR', '3RACOL'],
        [37, 'BAJO', 'ROJO', 'IMPAR', '1RA DOC'],
        [38, 'BAJO', 'ROJO', 'IMPAR', '2DA DOC'],
        [39, 'BAJO', 'ROJO', 'IMPAR', '3RA DOC'],
        [40, 'BAJO', 'ROJO', 'IMPAR', '1RA COL'],
        [41, 'BAJO', 'ROJO', 'IMPAR', '2DACOL'],
        [42, 'BAJO', 'ROJO', 'IMPAR', '3RACOL'],
        [43, 'ALTO', 'ROJO', 'IMPAR', '1RA DOC'],
        [44, 'ALTO', 'ROJO', 'IMPAR', '2DA DOC'],
        [45, 'ALTO', 'ROJO', 'IMPAR', '3RA DOC'],
        [46, 'ALTO', 'ROJO', 'IMPAR', '1RA COL'],
        [47, 'ALTO', 'ROJO', 'IMPAR', '2DACOL'],
        [48, 'ALTO', 'ROJO', 'IMPAR', '3RACOL'],
    ];

    return pattern.map(([metodo, bajoAlto, color, parImpar, docCol]) => {
        const effData = calculateEfficiency(bajoAlto, color, parImpar, docCol);
        return {
            metodo,
            bajoAlto,
            color,
            parImpar,
            docCol,
            favorable: effData.favorable,
            efficiency: effData.efficiency,
            numbers: effData.numbers
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

// --- MAIN COMPONENT ---
const MethodsTable = ({ isOpen, onClose, onBatchBet, selectedChip, currentBets }) => {
    // Filter states
    const [filterMetodo, setFilterMetodo] = useState('');
    const [filterBajoAlto, setFilterBajoAlto] = useState('');
    const [filterColor, setFilterColor] = useState('');
    const [filterParImpar, setFilterParImpar] = useState('');
    const [filterDocCol, setFilterDocCol] = useState('');
    const [filterFavorable, setFilterFavorable] = useState('');
    const [filterDecimal, setFilterDecimal] = useState('');
    const [filterRating, setFilterRating] = useState('');

    // Sort state: column key and direction ('asc' | 'desc' | null)
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState(null);

    // Efficiency rating helper for options
    const getRatingLabel = (favorable) => {
        if (favorable >= 3) return '🔥 EXCELENTE';
        if (favorable >= 2) return '⭐ BUENO';
        if (favorable >= 1) return 'NORMAL';
        return '❌ VACÍO';
    };

    // Rating order for sorting
    const getRatingOrder = (favorable) => {
        if (favorable >= 3) return 4;
        if (favorable >= 2) return 3;
        if (favorable >= 1) return 2;
        return 1;
    };

    // Get unique values for each column
    const metodoOptions = [...new Set(METHODS_DATA.map(d => d.metodo))];
    const bajoAltoOptions = [...new Set(METHODS_DATA.map(d => d.bajoAlto))];
    const colorOptions = [...new Set(METHODS_DATA.map(d => d.color))];
    const parImparOptions = [...new Set(METHODS_DATA.map(d => d.parImpar))];
    const docColOptions = [...new Set(METHODS_DATA.map(d => d.docCol))];
    const favorableOptions = [...new Set(METHODS_DATA.map(d => d.favorable))].sort((a, b) => b - a);
    const decimalOptions = [...new Set(METHODS_DATA.map(d => d.efficiency.toFixed(3)))].sort((a, b) => parseFloat(b) - parseFloat(a));
    const ratingOptions = [...new Set(METHODS_DATA.map(d => getRatingLabel(d.favorable)))];

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
    const filteredAndSortedData = useMemo(() => {
        // First filter
        let data = METHODS_DATA.filter(row => {
            if (filterMetodo && row.metodo !== parseInt(filterMetodo)) return false;
            if (filterBajoAlto && row.bajoAlto !== filterBajoAlto) return false;
            if (filterColor && row.color !== filterColor) return false;
            if (filterParImpar && row.parImpar !== filterParImpar) return false;
            if (filterDocCol && row.docCol !== filterDocCol) return false;
            if (filterFavorable && row.favorable !== parseInt(filterFavorable)) return false;
            if (filterDecimal && row.efficiency.toFixed(3) !== filterDecimal) return false;
            if (filterRating && getRatingLabel(row.favorable) !== filterRating) return false;
            return true;
        });

        // Then sort if a column is selected
        if (sortColumn && sortDirection) {
            data = [...data].sort((a, b) => {
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
                    case 'favorable':
                        valA = a.favorable;
                        valB = b.favorable;
                        break;
                    case 'decimal':
                        valA = a.efficiency;
                        valB = b.efficiency;
                        break;
                    case 'rating':
                        valA = getRatingOrder(a.favorable);
                        valB = getRatingOrder(b.favorable);
                        break;
                    default:
                        return 0;
                }

                // Compare based on type
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortDirection === 'asc' ? valA - valB : valB - valA;
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
    }, [filterMetodo, filterBajoAlto, filterColor, filterParImpar, filterDocCol, filterFavorable, filterDecimal, filterRating, sortColumn, sortDirection]);

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

    // Color mapping
    const getBajoAltoStyle = (value) => {
        if (value === 'BAJO') return { background: '#fff', color: '#000' };
        if (value === 'ALTO') return { background: '#f0c040', color: '#000' }; // Yellow/orange for ALTO
        return {};
    };

    const getColorStyle = (value) => {
        if (value === 'NEGRO') return { background: '#333', color: '#fff' };
        if (value === 'ROJO') return { background: '#c41e3a', color: '#fff' };
        return {};
    };

    const getParImparStyle = (value) => {
        if (value === 'PAR') return { background: '#fff', color: '#000' };
        if (value === 'IMPAR') return { background: '#d4a373', color: '#000' }; // Tan/brown for IMPAR
        return {};
    };

    const getDocColStyle = (value) => {
        if (value.includes('DOC')) return { background: '#fff', color: '#000' };
        if (value.includes('COL')) return { background: '#b5d6a7', color: '#000' }; // Light green for COL
        return {};
    };

    // Efficiency rating and styling
    const getEfficiencyRating = (favorable) => {
        if (favorable >= 3) return { label: '🔥 EXCELENTE', color: '#00c853', bgColor: 'rgba(0, 200, 83, 0.15)' };
        if (favorable >= 2) return { label: '⭐ BUENO', color: '#ffd700', bgColor: 'rgba(255, 215, 0, 0.15)' };
        if (favorable >= 1) return { label: 'NORMAL', color: '#888', bgColor: 'transparent' };
        return { label: '❌ VACÍO', color: '#ff4444', bgColor: 'rgba(255, 68, 68, 0.1)' };
    };

    // Get max efficiency for highlighting
    const maxFavorable = Math.max(...METHODS_DATA.map(d => d.favorable));

    if (!isOpen) return null;

    // Helper to get component bet IDs for a method row
    const getMethodIds = (row) => {
        const ids = [];
        ids.push(row.bajoAlto === 'BAJO' ? 'LOW' : 'HIGH');
        ids.push(row.color === 'NEGRO' ? 'BLACK' : 'RED');
        ids.push(row.parImpar === 'PAR' ? 'EVEN' : 'ODD');
        if (row.docCol.includes('DOC')) {
            ids.push(row.docCol.includes('1RA') ? 'DOZ1' : row.docCol.includes('2DA') ? 'DOZ2' : 'DOZ3');
        } else {
            ids.push(row.docCol.includes('1RA') ? 'COL1' : row.docCol.includes('2DA') ? 'COL2' : 'COL3');
        }
        return ids;
    };

    // Helper to check if a method is active
    const isMethodActive = (row) => {
        if (!currentBets) return false;
        const ids = getMethodIds(row);
        // Active if ALL 4 components have chips
        return ids.every(id => currentBets[id] && currentBets[id] > 0);
    };

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.92)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div style={{
                background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
                border: '1px solid #333',
                borderRadius: '12px',
                boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                width: 'auto',
                maxWidth: '95vw',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#111'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: '#4fc3f7',
                        fontSize: '1.2rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontFamily: 'Roboto Mono, monospace'
                    }}>
                        TABLA DE MÉTODOS
                    </h2>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={clearFilters}
                            style={{
                                background: '#333',
                                border: '1px solid #555',
                                color: '#aaa',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Limpiar Filtros
                        </button>
                        <button onClick={onClose} style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#888',
                            fontSize: '1.8rem',
                            cursor: 'pointer',
                            lineHeight: '1'
                        }}>&times;</button>
                    </div>
                </div>

                {/* Table Container */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    <table style={{
                        borderCollapse: 'collapse',
                        fontFamily: 'Roboto Mono, monospace', // Changed to monospaced for tabular data
                        fontSize: '0.9rem',
                        margin: '0 auto',
                        width: '100%',
                        color: '#ddd'
                    }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr style={{ background: '#222', borderBottom: '2px solid #444' }}>
                                {/* MÉTODO Column */}
                                <th style={{
                                    padding: '8px 10px',
                                    border: '1px solid #444',
                                    background: sortColumn === 'metodo' ? '#333' : '#1a1a1a',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    textAlign: 'left',
                                    minWidth: '80px',
                                    cursor: 'pointer'
                                }} onClick={() => handleSort('metodo')}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FilterDropdown
                                            label="Método"
                                            options={metodoOptions}
                                            value={filterMetodo}
                                            onChange={setFilterMetodo}
                                        />
                                        <span style={{ fontSize: '0.7rem' }}>{getSortIndicator('metodo')}</span>
                                    </div>
                                </th>

                                {/* BAJO/ALTO Column */}
                                <th style={{
                                    padding: '8px 10px',
                                    border: '1px solid #444',
                                    background: sortColumn === 'bajoAlto' ? '#333' : '#1a1a1a',
                                    color: '#fff',
                                    fontWeight: 'normal',
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }} onClick={() => handleSort('bajoAlto')}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FilterDropdown
                                            label="Bajo/Alto"
                                            options={bajoAltoOptions}
                                            value={filterBajoAlto}
                                            onChange={setFilterBajoAlto}
                                        />
                                        <span style={{ fontSize: '0.7rem' }}>{getSortIndicator('bajoAlto')}</span>
                                    </div>
                                </th>

                                {/* COLOR Column */}
                                <th style={{
                                    padding: '8px 10px',
                                    border: '1px solid #444',
                                    background: sortColumn === 'color' ? '#333' : '#1a1a1a',
                                    color: '#fff',
                                    fontWeight: 'normal',
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }} onClick={() => handleSort('color')}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FilterDropdown
                                            label="Color"
                                            options={colorOptions}
                                            value={filterColor}
                                            onChange={setFilterColor}
                                        />
                                        <span style={{ fontSize: '0.7rem' }}>{getSortIndicator('color')}</span>
                                    </div>
                                </th>

                                {/* PAR/IMPAR Column */}
                                <th style={{
                                    padding: '8px 10px',
                                    border: '1px solid #444',
                                    background: sortColumn === 'parImpar' ? '#333' : '#1a1a1a',
                                    color: '#fff',
                                    fontWeight: 'normal',
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }} onClick={() => handleSort('parImpar')}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FilterDropdown
                                            label="Par/Imp"
                                            options={parImparOptions}
                                            value={filterParImpar}
                                            onChange={setFilterParImpar}
                                        />
                                        <span style={{ fontSize: '0.7rem' }}>{getSortIndicator('parImpar')}</span>
                                    </div>
                                </th>

                                {/* DOC/COL Column */}
                                <th style={{
                                    padding: '8px 10px',
                                    border: '1px solid #444',
                                    background: sortColumn === 'docCol' ? '#333' : '#1a1a1a',
                                    color: '#fff',
                                    fontWeight: 'normal',
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }} onClick={() => handleSort('docCol')}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FilterDropdown
                                            label="Doc/Col"
                                            options={docColOptions}
                                            value={filterDocCol}
                                            onChange={setFilterDocCol}
                                        />
                                        <span style={{ fontSize: '0.7rem' }}>{getSortIndicator('docCol')}</span>
                                    </div>
                                </th>

                                {/* F/N EFFICIENCY Column */}
                                <th style={{
                                    padding: '8px 10px',
                                    border: '1px solid #444',
                                    background: sortColumn === 'favorable' ? '#1b5e20' : '#1a1a1a',
                                    color: sortColumn === 'favorable' ? '#fff' : '#4caf50',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }} onClick={() => handleSort('favorable')}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FilterDropdown
                                            label="F/N"
                                            options={favorableOptions}
                                            value={filterFavorable}
                                            onChange={setFilterFavorable}
                                        />
                                        <span style={{ fontSize: '0.7rem' }}>{getSortIndicator('favorable')}</span>
                                    </div>
                                </th>

                                {/* DECIMAL EFFICIENCY Column */}
                                <th style={{
                                    padding: '8px 10px',
                                    border: '1px solid #444',
                                    background: sortColumn === 'decimal' ? '#0277bd' : '#1a1a1a',
                                    color: sortColumn === 'decimal' ? '#fff' : '#4fc3f7',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }} onClick={() => handleSort('decimal')}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FilterDropdown
                                            label="Dec"
                                            options={decimalOptions}
                                            value={filterDecimal}
                                            onChange={setFilterDecimal}
                                        />
                                        <span style={{ fontSize: '0.7rem' }}>{getSortIndicator('decimal')}</span>
                                    </div>
                                </th>

                                {/* RATING Column */}
                                <th style={{
                                    padding: '8px 10px',
                                    border: '1px solid #444',
                                    background: sortColumn === 'rating' ? '#bf360c' : '#1a1a1a',
                                    color: sortColumn === 'rating' ? '#fff' : '#ffab91',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }} onClick={() => handleSort('rating')}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <FilterDropdown
                                            label="Val"
                                            options={ratingOptions}
                                            value={filterRating}
                                            onChange={setFilterRating}
                                        />
                                        <span style={{ fontSize: '0.7rem' }}>{getSortIndicator('rating')}</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedData.map((row, idx) => {
                                const rating = getEfficiencyRating(row.favorable);
                                const isBest = row.favorable >= 2;
                                const isTop = row.favorable === maxFavorable;

                                // Check active state (Highlight)
                                const isActive = isMethodActive(row);

                                // Dark Theme Row Backgrounds
                                const baseBg = isActive ? 'rgba(0, 229, 255, 0.25)' : (idx % 2 === 0 ? '#1e1e1e' : '#252525');
                                const highlightBg = isTop ? 'rgba(0, 200, 83, 0.15)' : (isBest ? 'rgba(255, 215, 0, 0.1)' : baseBg);

                                // If active, override background strongly but keep top/best hints faintly if needed, 
                                // but active denotes user intent so it should pop.
                                const finalBg = isActive ? 'rgba(0, 229, 255, 0.25)' : highlightBg;

                                return (
                                    <tr key={row.metodo} style={{
                                        background: finalBg,
                                        borderLeft: isTop ? '4px solid #00c853' : (isBest ? '3px solid #ffd700' : 'none'),
                                        transition: 'background 0.2s',
                                        boxShadow: isActive ? 'inset 0 0 10px rgba(0,229,255,0.2)' : 'none'
                                    }}>
                                        {/* Método - CLICKABLE FOR BETTING ON ATTRIBUTES */}
                                        <td
                                            onClick={() => {
                                                if (onBatchBet && selectedChip) {
                                                    const betIds = getMethodIds(row);
                                                    onBatchBet(betIds, selectedChip);
                                                }
                                            }}
                                            title={`Apostar a las Simples del Método ${row.metodo} (4 Fichas)`}
                                            style={{
                                                padding: '8px 10px',
                                                border: '1px solid #444',
                                                textAlign: 'right',
                                                color: isActive ? '#00e5ff' : '#fff',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                textDecorationColor: isActive ? '#00e5ff' : '#555',
                                                background: isActive ? 'rgba(0, 229, 255, 0.1)' : 'transparent'
                                            }}>
                                            {isTop && '🏆 '}{row.metodo}
                                        </td>

                                        {/* Bajo/Alto */}
                                        <td style={{
                                            padding: '8px 10px',
                                            border: '1px solid #444',
                                            textAlign: 'center',
                                            ...getBajoAltoStyle(row.bajoAlto)
                                        }}>
                                            {row.bajoAlto}
                                        </td>

                                        {/* Color */}
                                        <td style={{
                                            padding: '8px 10px',
                                            border: '1px solid #444',
                                            textAlign: 'center',
                                            ...getColorStyle(row.color)
                                        }}>
                                            {row.color}
                                        </td>

                                        {/* Par/Impar */}
                                        <td style={{
                                            padding: '8px 10px',
                                            border: '1px solid #444',
                                            textAlign: 'center',
                                            ...getParImparStyle(row.parImpar)
                                        }}>
                                            {row.parImpar}
                                        </td>

                                        {/* Doc/Col */}
                                        <td style={{
                                            padding: '8px 10px',
                                            border: '1px solid #444',
                                            textAlign: 'center',
                                            ...getDocColStyle(row.docCol)
                                        }}>
                                            {row.docCol}
                                        </td>

                                        {/* F/N Efficiency */}
                                        <td style={{
                                            padding: '8px 10px',
                                            border: '1px solid #444',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            color: isBest ? '#69f0ae' : '#aaa',
                                            fontSize: '1rem'
                                        }}>
                                            {row.favorable}/36
                                        </td>

                                        {/* Decimal Efficiency (Enhanced Contrast) */}
                                        <td style={{
                                            padding: '8px 10px',
                                            border: '1px solid #444',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            color: isBest ? '#40c4ff' : '#888', // Light Blue / Cyan for contrast
                                            fontSize: '1.2rem', // Increased Font Size
                                            fontFamily: 'monospace',
                                            textShadow: isBest ? '0 0 5px rgba(64, 196, 255, 0.4)' : 'none'
                                        }}>
                                            {row.efficiency.toFixed(3)}
                                        </td>

                                        {/* Rating */}
                                        <td style={{
                                            padding: '8px 10px',
                                            border: '1px solid #444',
                                            textAlign: 'center',
                                            fontWeight: 'bold',
                                            color: rating.color,
                                            fontSize: '0.85rem'
                                        }}>
                                            {rating.label}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Results count */}
                    <div style={{
                        textAlign: 'center',
                        color: '#666',
                        fontSize: '0.8rem',
                        marginTop: '15px'
                    }}>
                        Mostrando {filteredAndSortedData.length} de {METHODS_DATA.length} métodos
                    </div>
                </div>
            </div>
        </div >,
        document.body
    );
};

export default MethodsTable;
