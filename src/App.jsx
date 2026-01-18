import React, { useEffect } from 'react'
import { CasinoTable } from './components/CasinoTable'
import { ToastContainer } from './components/ToastContainer'
import { audioPreloader } from './utils/AudioPreloader'
import './index.css'

function App() {
  // Initialize audio preloader on mount
  useEffect(() => {
    audioPreloader.preloadAll()
  }, [])

  return (
    <div className="app-container">
      <ToastContainer />
      <CasinoTable />
    </div>
  )
}

export default App
