import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { MiniPlayerApp } from './MiniPlayerApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MiniPlayerApp />
  </StrictMode>,
);
