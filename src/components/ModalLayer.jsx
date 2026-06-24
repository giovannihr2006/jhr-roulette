/**
 * ModalLayer - Componente que centraliza TODOS los modales
 *
 * Este componente reemplaza 50+ líneas de imports y renderiza
 * todos los modales en un solo lugar.
 *
 * Props:
 * - modalState: { [modalName]: boolean }
 * - onClose: (modalName) => void
 * - children: (optional) Contenido para algunos modales dinámicos
 */

import React, { lazy, Suspense } from 'react'

// Importar modales que NO van a ser lazy-loaded (críticos)
import { HistoryModal } from './HistoryModal'
import { HelpModal } from './HelpModal'
import { ReloadModal } from './ReloadModal'
import { StrategiesModal } from './StrategiesModal'
import { RubricModal } from './RubricModal'
import { ProjectionsModal } from './ProjectionsModal'
import { StrategyManualModal } from './StrategyManualModal'
import { AudioSettingsModal } from './AudioSettingsModal'
import { ForensicManualModal } from './ForensicManualModal'
import { JustificationModal } from './JustificationModal'
import { ELEMENT_DESCRIPTIONS } from '../config/ElementDescriptions'

// Modales que serán lazy-loaded (no críticos)
const InternalScannerModal = lazy(() => import('./InternalScannerModal'))
const SystemEfficiencyModal = lazy(() => import('./SystemEfficiencyModal'))
const EconomicValueModal = lazy(() => import(/* webpackChunkName: "economic-modal" */ './EconomicValueModal'))
const ChipEconomyModal = lazy(() => import(/* webpackChunkName: "chip-modal" */ './ChipEconomyModal'))
const LayoutHelpModal = lazy(() => import(/* webpackChunkName: "layout-modal" */ './LayoutHelpModal'))
const DetailedHistoryModal = lazy(() => import(/* webpackChunkName: "history-modal" */ './DetailedHistoryModal'))

const ModalLoader = () => (
  <div style={{
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#f39c12'
  }}>
    Cargando...
  </div>
)

export const ModalLayer = ({
  modalState = {},
  onClose = () => {},
  justificationElement = null
}) => {
  const close = (modalName) => onClose(modalName)

  return (
    <>
      {/* === MODALES CRÍTICOS (no lazy-loaded) === */}

      {modalState.reload && (
        <ReloadModal onClose={() => close('reload')} />
      )}

      {modalState.strategies && (
        <StrategiesModal onClose={() => close('strategies')} />
      )}

      {modalState.projections && (
        <ProjectionsModal onClose={() => close('projections')} />
      )}

      {modalState.strategiesManual && (
        <StrategyManualModal onClose={() => close('strategiesManual')} />
      )}

      {modalState.audioSettings && (
        <AudioSettingsModal onClose={() => close('audioSettings')} />
      )}

      {modalState.rubric && (
        <RubricModal onClose={() => close('rubric')} />
      )}

      {modalState.forensicManual && (
        <ForensicManualModal onClose={() => close('forensicManual')} />
      )}

      {modalState.history && (
        <HistoryModal onClose={() => close('history')} />
      )}

      {modalState.help && (
        <HelpModal onClose={() => close('help')} />
      )}

      {/* === GENÉRICO: JustificationModals (REEMPLAZA 27 imports) === */}
      {justificationElement && ELEMENT_DESCRIPTIONS[justificationElement] && (
        <JustificationModal
          {...ELEMENT_DESCRIPTIONS[justificationElement]}
          onClose={() => close('justification')}
        />
      )}

      {/* === MODALES LAZY-LOADED (no críticos) === */}

      {modalState.internalScanner && (
        <Suspense fallback={<ModalLoader />}>
          <InternalScannerModal onClose={() => close('internalScanner')} />
        </Suspense>
      )}

      {modalState.systemEfficiency && (
        <Suspense fallback={<ModalLoader />}>
          <SystemEfficiencyModal onClose={() => close('systemEfficiency')} />
        </Suspense>
      )}

      {modalState.economicValue && (
        <Suspense fallback={<ModalLoader />}>
          <EconomicValueModal onClose={() => close('economicValue')} />
        </Suspense>
      )}

      {modalState.chipEconomy && (
        <Suspense fallback={<ModalLoader />}>
          <ChipEconomyModal onClose={() => close('chipEconomy')} />
        </Suspense>
      )}

      {modalState.layoutHelp && (
        <Suspense fallback={<ModalLoader />}>
          <LayoutHelpModal onClose={() => close('layoutHelp')} />
        </Suspense>
      )}

      {modalState.detailedHistory && (
        <Suspense fallback={<ModalLoader />}>
          <DetailedHistoryModal onClose={() => close('detailedHistory')} />
        </Suspense>
      )}
    </>
  )
}

export default ModalLayer
