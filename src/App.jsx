import React, { useEffect } from 'react'
import { CasinoTable } from './components/CasinoTable'
import { ToastContainer } from './components/ToastContainer'
import { audioPreloader } from './utils/AudioPreloader'
import './index.css'

function App() {
  useEffect(() => {
    audioPreloader.preloadAll()
  }, [])

  const isChrome = (/Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)) || /Electron/.test(navigator.userAgent)

  if (!isChrome) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: '#000', color: '#ff4444', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 99999,
        textAlign: 'center', padding: '20px'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>ACCESO DENEGADO</h1>
        <h2 style={{ fontSize: '1.5rem', color: '#fff' }}>ESTA APLICACION SOLO FUNCIONA EN GOOGLE CHROME</h2>
        <p style={{ marginTop: '20px', color: '#888' }}>Por favor abre el enlace en Chrome para continuar.</p>
        <div style={{ marginTop: '30px', padding: '10px', background: '#222', borderRadius: '5px' }}>
          Reference: GHR_ROYALE_CHROME_ONLY
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <ToastContainer />
      <CasinoTable />
    </div>
  )
}

export default App
