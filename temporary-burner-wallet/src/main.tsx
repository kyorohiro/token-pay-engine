import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WalletStorageProvider } from './libs/useWalletStorage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletStorageProvider>
    <App />
    </WalletStorageProvider>
  </StrictMode>,
)
