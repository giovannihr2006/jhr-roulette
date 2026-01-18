import React from 'react'
import { LayoutHelpModal } from '../LayoutHelpModal'
import { HistoryModal } from '../HistoryModal'
import { HelpModal } from '../HelpModal'
import { ReloadModal } from '../ReloadModal'
import { StrategiesModal } from '../StrategiesModal'
import { RubricModal } from '../RubricModal'
import { ProjectionsModal } from '../ProjectionsModal'
import { StrategyManualModal } from '../StrategyManualModal'
import { AudioSettingsModal } from '../AudioSettingsModal'
import { DetailedHistoryModal } from '../DetailedHistoryModal'

export const GameOverlayManager = ({
    showLayoutHelp, setShowLayoutHelp,
    showHistoryModal, setShowHistoryModal,
    showHelp, setShowHelp,
    showReloadModal, setShowReloadModal,
    showStrategiesModal, setShowStrategiesModal,
    showRubric, setShowRubric,
    showProjectionsModal, setShowProjectionsModal,
    showManualModal, setShowManualModal,
    showAudioSettings, setShowAudioSettings,
    showDetailedHistory, setShowDetailedHistory,

    // Data Props
    roundHistory,
    balance,
    initialCapital,
    startTime,
    onReload,
    viewCurrency,
    rates
}) => {
    return (
        <>
            {showLayoutHelp && <LayoutHelpModal onClose={() => setShowLayoutHelp(false)} />}
            {showHistoryModal && <HistoryModal history={roundHistory} onClose={() => setShowHistoryModal(false)} />}
            {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

            {showReloadModal && (
                <ReloadModal
                    isOpen={showReloadModal}
                    onClose={() => setShowReloadModal(false)}
                    onReload={onReload}
                    viewCurrency={viewCurrency}
                    rates={rates}
                />
            )}

            {showStrategiesModal && (
                <StrategiesModal
                    onClose={() => setShowStrategiesModal(false)}
                    onOpenManual={() => {
                        setShowStrategiesModal(false)
                        setShowManualModal(true)
                    }}
                />
            )}

            {showManualModal && <StrategyManualModal onClose={() => setShowManualModal(false)} />}

            {showRubric && <RubricModal onClose={() => setShowRubric(false)} />}

            {showAudioSettings && <AudioSettingsModal onClose={() => setShowAudioSettings(false)} />}

            <ProjectionsModal
                isOpen={showProjectionsModal}
                onClose={() => setShowProjectionsModal(false)}
                balance={balance}
                startBalance={initialCapital}
                startTime={startTime}
                history={roundHistory}
            />

            {/* Detailed History is handled via widget usually, but if modal exists? */}
            {/* The button in CasinoTable opens it? */}
        </>
    )
}
