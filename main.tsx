import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

declare global {
  interface Window {
    set_splash?: (t: string) => void
  }
}

window.set_splash?.('loading')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
