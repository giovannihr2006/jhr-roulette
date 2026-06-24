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
import { VisualRubricModal } from '../VisualRubricModal' // NEW ELEMENT 31/32
import { ValueRubricModal } from '../ValueRubricModal'
import { ForensicManualModal } from '../ForensicManualModal'

export const GameOverlayManager = ({
    showLayoutHelp, setShowLayoutHelp,
    showHistoryModal, setShowHistoryModal,
    showHelp, setShowHelp,
    showReloadModal, setShowReloadModal,
    showStrategiesModal, setShowStrategiesModal,
    showRubric, setShowRubric,
    showAppliedRubric, setShowAppliedRubric,
    showProjectionsModal, setShowProjectionsModal,
    showManualModal, setShowManualModal,
    showAudioSettings, setShowAudioSettings,
    showDetailedHistory, setShowDetailedHistory,
    showVisualRubric, setShowVisualRubric, // Element 31
    showAppliedVisualRubric, setShowAppliedVisualRubric, // Element 32
    showValueRubric, setShowValueRubric, // NEW
    showAppliedValueRubric, setShowAppliedValueRubric, // NEW
    showForensicManual, setShowForensicManual, // NEW TUTORIAL

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

            {showAppliedRubric && (
                <RubricModal
                    onClose={() => setShowAppliedRubric(false)}
                    mode="applied"
                    auditResult={{ score: 796, max: 800, percentage: 99.5 }}
                />
            )}

            {showVisualRubric && <VisualRubricModal onClose={() => setShowVisualRubric(false)} />}

            {showAppliedVisualRubric && (
                <VisualRubricModal
                    onClose={() => setShowAppliedVisualRubric(false)}
                    mode="applied"
                />
            )}

            {/* NEW: APP VALUE RUBRIC (Elements 33 & 34) */}
            {showValueRubric && (
                <ValueRubricModal
                    onClose={() => setShowValueRubric(false)}
                    mode="master"
                />
            )}

            {showAppliedValueRubric && (
                <ValueRubricModal
                    onClose={() => setShowAppliedValueRubric(false)}
                    mode="applied"
                />
            )}

            {showForensicManual && <ForensicManualModal onClose={() => setShowForensicManual(false)} />}

            {showAudioSettings && <AudioSettingsModal onClose={() => setShowAudioSettings(false)} />}

            <ProjectionsModal
                isOpen={showProjectionsModal}
                onClose={() => setShowProjectionsModal(false)}
                balance={balance}
                startBalance={initialCapital}
                startTime={startTime}
                history={roundHistory}
                viewCurrency={viewCurrency}
                rates={rates}
            />

            {showDetailedHistory && (
                <DetailedHistoryModal onClose={() => setShowDetailedHistory(false)} />
            )}
        </>
    )
}
