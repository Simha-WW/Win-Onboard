/**
 * MSAL Configuration for Microsoft Authentication
 * Configures Azure AD B2C and authentication flows
 */

import { Configuration, LogLevel } from '@azure/msal-browser';

// Debug environment variables
console.log('Azure Config Debug:', {
  VITE_AZURE_CLIENT_ID: import.meta.env.VITE_AZURE_CLIENT_ID,
  REACT_APP_AZURE_CLIENT_ID: import.meta.env.REACT_APP_AZURE_CLIENT_ID,
  VITE_AZURE_TENANT_ID: import.meta.env.VITE_AZURE_TENANT_ID,
  REACT_APP_AZURE_TENANT_ID: import.meta.env.REACT_APP_AZURE_TENANT_ID
});

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.REACT_APP_AZURE_CLIENT_ID!,
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
    clientCapabilities: ['CP1'] // Claims capability
  },
  cache: {
    cacheLocation: 'sessionStorage', // Session storage for security
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        
        switch (level) {
          case LogLevel.Error:
            console.error('MSAL Error:', message);
            break;
          case LogLevel.Warning:
            console.warn('MSAL Warning:', message);
            break;
          case LogLevel.Info:
            console.info('MSAL Info:', message);
            break;
          default:
            break;
        }
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Warning,
    },
  },
};

// Login request scopes
export const loginRequest = {
  scopes: ['User.Read', 'email', 'profile', 'openid'],
  prompt: 'select_account', // Always show account selector
};

// Organizational login request (WinWire and other organizations)
export const organizationalLoginRequest = {
  scopes: ['User.Read', 'email', 'profile', 'openid'],
  authority: 'https://login.microsoftonline.com/organizations',
  prompt: 'select_account',
  extraQueryParameters: {
    domain_hint: 'winwire.com' // Hint for WinWire domain
  }
};

// Personal Microsoft account login request  
export const personalLoginRequest = {
  scopes: ['User.Read', 'email', 'profile', 'openid'],
  authority: 'https://login.microsoftonline.com/common',
  prompt: 'select_account',
  extraQueryParameters: {
    'domain_hint': 'consumers'
  }
};

// Alternative configuration for organizations (work/school accounts)
export const msalConfigOrganizations: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || import.meta.env.REACT_APP_AZURE_CLIENT_ID!,
    authority: 'https://login.microsoftonline.com/organizations',
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use session storage for better security
    storeAuthStateInCookie: true, // Store in cookie for IE compatibility
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        
        switch (level) {
          case LogLevel.Error:
            console.error('MSAL Organizations Error:', message);
            break;
          case LogLevel.Warning:
            console.warn('MSAL Organizations Warning:', message);
            break;
          default:
            console.log('MSAL Organizations:', message);
        }
      },
      piiLoggingEnabled: false,
      logLevel: LogLevel.Warning,
    },
  },
};

// Graph API scopes
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};