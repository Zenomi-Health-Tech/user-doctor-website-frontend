import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Lazy load Firebase after app initialization for faster initial load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    import('./lib/firebase').catch(() => {});
  });
} else {
  import('./lib/firebase').catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
