/**
 * LayoutControls.jsx
 * Componente extraído de CasinoTable.jsx para controles de layout y navegación
 * Con soporte de accesibilidad ARIA
 */
import React from 'react'
import PropTypes from 'prop-types'
import { ForensicBadge } from './ForensicBadge'

export const LayoutControls = ({
    isEditMode,
    setIsEditMode,
    handleSaveLayout,
    handleLoadLayout,
    resetLayout,
    setShowLayoutHelp,
    setShowStrategiesModal,
    setShowRubricModal,
    setShowAudioSettingsModal,
    showActiveBets,
    setShowActiveBets,
    viewMode3D,
    setViewMode3D,
    setShowHistoryModal,
    fileInputRef,
    showGrid,
    toggleGrid,
    onShowTutorial // NEW
}) => {
    return (
        <div
            style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
            role="toolbar"
            aria-label="Controles de diseño y navegación"
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ForensicBadge id="layoutControls" />
                <div style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '0.8rem', padding: '0 2px' }}>diseño</div>
                <button
                    onClick={(e) => { e.stopPropagation(); onShowTutorial(); }}
                    aria-label="Ver Justificación Forense de diseño (E22)"
                    style={{
                        background: 'transparent', border: '1px solid #d4af37', color: '#d4af37',
                        width: '20px', height: '20px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', cursor: 'pointer'
                    }}
                    title="Manual Forense E22"
                >
                    ⚖
                </button>
            </div>
            {isEditMode && (
                <>
                    <button
                        onClick={handleSaveLayout}
                        aria-label="Guardar diseño actual"
                        style={{
                            background: '#28a745', color: 'white', border: '1px solid #fff',
                            padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                        }}
                    >
                        💾 GUARDAR
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLoadLayout}
                        style={{ display: 'none' }}
                        accept=".json"
                        aria-hidden="true"
                    />
                    {/* HELP BUTTON */}
                    <button
                        onClick={() => setShowLayoutHelp(true)}
                        aria-label="Ayuda de diseño"
                        style={{
                            background: '#6c757d', color: 'white', border: '1px solid #fff',
                            width: '40px', height: '40px', borderRadius: '50%',
                            cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title="Ayuda de diseño"
                    >
                        ?
                    </button>

                </>
            )}

            {/* STRATEGIES BUTTON */}
            <button
                onClick={() => setShowStrategiesModal(true)}
                aria-label="Abrir estrategias maestras"
                style={{
                    background: '#222', color: '#ff00ff', border: '1px solid #ff00ff',
                    width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #ff00ff'
                }}
                title="Estrategias Maestras"
            >
                🧠
            </button>

            {/* RULETA RUBRIC BUTTON */}
            <button
                onClick={() => setShowRubricModal(true)}
                aria-label="Ver rúbrica de calidad"
                style={{
                    background: '#222', color: '#4f4', border: '1px solid #4f4',
                    width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #4f4'
                }}
                title="Ver Calidad / rúbrica"
            >
                📊
            </button>

            {/* AUDIO SETTINGS BUTTON */}
            <button
                onClick={() => setShowAudioSettingsModal(true)}
                aria-label="Configuración de audio"
                style={{
                    background: '#222', color: '#ffd700', border: '1px solid #ffd700',
                    width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #ffd700'
                }}
                title="Configuración de Audio"
            >
                🔊
            </button>

            {/* ACTIVE BETS TOGGLE BUTTON */}
            <button
                onClick={() => setShowActiveBets(!showActiveBets)}
                aria-label={showActiveBets ? 'Ocultar panel de apuestas activas' : 'Mostrar panel de apuestas activas'}
                aria-pressed={showActiveBets}
                style={{
                    background: showActiveBets ? '#ff9800' : '#222', color: showActiveBets ? '#000' : '#ff9800',
                    border: '1px solid #ff9800',
                    width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #ff9800'
                }}
                title="Ver/Ocultar Panel de Apuestas"
            >
                📝
            </button>

            {/* 3D TOGGLE BUTTON */}
            <button
                onClick={() => setViewMode3D(!viewMode3D)}
                aria-label={viewMode3D ? 'Cambiar a vista 2D' : 'Cambiar a vista 3D'}
                aria-pressed={viewMode3D}
                style={{
                    background: viewMode3D ? '#00CED1' : '#222',
                    color: viewMode3D ? '#000' : '#00CED1',
                    border: '1px solid #00CED1',
                    width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #00CED1'
                }}
                title="Alternar Vista 2D / 3D"
            >
                🎲
            </button>

            {/* HISTORY BUTTON */}
            <button
                onClick={() => setShowHistoryModal(true)}
                aria-label="Abrir 📖 HISTORIAL detallado"
                style={{
                    background: '#6610f2', color: 'white', border: '1px solid #fff',
                    padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold',
                    boxShadow: '0 0 10px rgba(102, 16, 242, 0.5)'
                }}
            >
                📜 📖 HISTORIAL
            </button>

                        {/* LOCK/UNLOCK BUTTON */}
            <button
                onClick={() => {
                    const nextMode = !isEditMode;
                    setIsEditMode(nextMode);
                    if (!nextMode) {
                        console.log("Locking Design - Triggering Auto Backup...");
                        handleSaveLayout(true);
                    }
                }}
                aria-label={isEditMode ? '🔒 BLOQUEAR DISEÑO y guardar backup' : '✏️ MOVER ELEMENTOS'}
                aria-pressed={isEditMode}
                style={{
                    background: isEditMode ? '#ff4444' : '#222',
                    color: 'white', border: '1px solid #ff4444',
                    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                    transition: 'all 0.2s'
                }}
            >
                {isEditMode ? '🔒 BLOQUEAR DISEÑO' : '✏️ MOVER ELEMENTOS'}
            </button>

            {/* RESTORE LAYOUT (ALWAYS VISIBLE!) */}
            <button
                onClick={resetLayout}
                aria-label="Restaurar diseño por defecto"
                style={{
                    background: '#333', color: '#d4af37', border: '1px solid #d4af37',
                    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                    transition: 'all 0.2s',
                    marginLeft: '5px'
                }}
            >
                🔄 RESTAURAR
            </button>

            {/* GRID TOGGLE BUTTON */}
            <button
                onClick={toggleGrid}
                aria-label={showGrid ? 'Ocultar Grilla' : 'Mostrar Grilla'}
                aria-pressed={showGrid}
                style={{
                    background: showGrid ? '#00FFFF' : '#222',
                    color: showGrid ? '#000' : '#00FFFF',
                    border: '1px solid #00FFFF',
                    width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 0 5px #00FFFF',
                    marginLeft: '10px'
                }}
                title="Mostrar/Ocultar Grilla de Ingeniería"
            >
                📐
            </button>

        </div>
    )
}

// PropTypes for type safety and documentation
LayoutControls.propTypes = {
    /** Whether edit mode is active */
    isEditMode: PropTypes.bool.isRequired,
    /** Toggle edit mode */
    setIsEditMode: PropTypes.func.isRequired,
    /** Save layout handler */
    handleSaveLayout: PropTypes.func.isRequired,
    /** Load layout handler */
    handleLoadLayout: PropTypes.func.isRequired,
    /** Reset layout handler */
    resetLayout: PropTypes.func.isRequired,
    /** Show layout help modal */
    setShowLayoutHelp: PropTypes.func.isRequired,
    /** Show strategies modal */
    setShowStrategiesModal: PropTypes.func.isRequired,
    /** Show rubric modal */
    setShowRubricModal: PropTypes.func.isRequired,
    /** Show audio settings modal */
    setShowAudioSettingsModal: PropTypes.func.isRequired,
    /** Whether active bets panel is visible */
    showActiveBets: PropTypes.bool,
    /** Toggle active bets panel */
    setShowActiveBets: PropTypes.func.isRequired,
    /** Whether 3D view mode is active */
    viewMode3D: PropTypes.bool,
    /** Toggle 3D view mode */
    setViewMode3D: PropTypes.func.isRequired,
    /** Show history modal */
    setShowHistoryModal: PropTypes.func.isRequired,
    /** File input ref for layout loading */
    fileInputRef: PropTypes.object
}

LayoutControls.defaultProps = {
    showActiveBets: false,
    viewMode3D: false,
    fileInputRef: null
}
