import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'rpg-awesome/css/rpg-awesome.min.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
