import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WalletStorageProvider } from './libs/useWalletStorage.tsx'
import { DialogProvider } from './libs/DialogContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletStorageProvider>
      <DialogProvider>
        <App />
      </DialogProvider>
    </WalletStorageProvider>
  </StrictMode>,
)
