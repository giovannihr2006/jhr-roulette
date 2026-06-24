// ELEMENTO 1. TITULO - GHR RULETA ROYALE
// Copia de seguridad: 18/01/2026 14:58
// Ubicación original: CasinoTable.jsx líneas 236-267

{/* 1. HEADER */ }
<Draggable index={1} totalCount={TOTAL_DRAGGABLES} id="title" isEnabled={isEditMode} initialPos={positions.title} onDragEnd={onUpdatePos} style={{ zIndex: 4001 }}>
    <div style={{
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.98) 100%)',
        padding: '15px 40px',
        borderRadius: '12px',
        border: '2px solid #d4af37',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.2)'
    }}>
        <div style={{
            color: '#d4af37',
            fontSize: '2.2rem',
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold',
            letterSpacing: '3px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.3)',
            textTransform: 'uppercase'
        }}>
            GHR Ruleta Royale
        </div>
        <div style={{
            color: '#888',
            fontSize: '16px',
            fontFamily: 'Roboto Mono, monospace',
            marginTop: '5px',
            letterSpacing: '1px'
        }}>
            v1.0.0 | 180120261454
        </div>
    </div>
</Draggable>
