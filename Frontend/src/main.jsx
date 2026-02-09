import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react'
import { PublicClientApplication } from '@azure/msal-browser'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles/globals.css'
import { router } from './routes'
import { AuthProvider } from './contexts/AuthContext'
import { msalConfig } from './config/msalConfig'

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig)

// Get Google Client ID from environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </MsalProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
