import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import './styles/globals.css'
import { router } from './routes'
import { AuthProvider } from './contexts/AuthContext'
import { msalConfig } from './config/msalConfig'

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MsalProvider>
  </StrictMode>,
)
