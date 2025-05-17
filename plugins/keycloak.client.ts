import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
// @ts-ignore - Ignore TypeScript error for plugin return type
import Keycloak from 'keycloak-js'

// Create a unified interface that both the Keycloak instance and our mock can satisfy
interface KeycloakInstance {
  authenticated?: boolean;
  token?: string;
  tokenParsed?: any;
  idTokenParsed?: any;
  login(options?: any): Promise<void> | void;
  logout(options?: any): Promise<void> | void;
  updateToken(minValidity?: number): Promise<boolean>;
  onTokenExpired?: null | (() => void);
  onAuthSuccess?: null | (() => void);
  onAuthLogout?: null | (() => void);
}

// Define token storage keys
const TOKEN_KEY = 'kc_token';
const REFRESH_TOKEN_KEY = 'kc_refresh_token';
const ID_TOKEN_KEY = 'kc_id_token';

/**
 * Keycloak client plugin for Nuxt 3
 * A simplified authentication plugin that initializes Keycloak and provides it to the application
 */
export default defineNuxtPlugin(async (nuxtApp) => {
  // Only initialize on client side
  if (process.server) {
    // Return an empty object on server side
    return {
      provide: {
        keycloak: {} as KeycloakInstance
      }
    }
  }

  // Get configuration from runtime config
  const config = useRuntimeConfig();
  const isDev = process.env.NODE_ENV === 'development';
  
  // Debug the Keycloak configuration in development mode
  if (isDev) {
    console.log('Keycloak config:', {
      url: config.public.NUXT_PUBLIC_KEYCLOAK_URL,
      realm: config.public.NUXT_PUBLIC_KEYCLOAK_REALM,
      clientId: config.public.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID
    });
  }
  
  // Helper functions for token storage
  const tokenStorage = {
    saveTokens: (token: string, refreshToken: string, idToken: string) => {
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(ID_TOKEN_KEY, idToken);
      } catch (e) {
        console.warn('Could not save to localStorage', e);
        // Fallback to sessionStorage
        try {
          sessionStorage.setItem(TOKEN_KEY, token);
          sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
          sessionStorage.setItem(ID_TOKEN_KEY, idToken);
        } catch (e) {
          console.error('Could not save tokens anywhere', e);
        }
      }
    },
    getTokens: () => {
      try {
        let token = localStorage.getItem(TOKEN_KEY);
        let refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        let idToken = localStorage.getItem(ID_TOKEN_KEY);
        
        // If not in localStorage, try sessionStorage
        if (!token || !refreshToken || !idToken) {
          token = sessionStorage.getItem(TOKEN_KEY) || null;
          refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || null;
          idToken = sessionStorage.getItem(ID_TOKEN_KEY) || null;
        }
        
        return { token, refreshToken, idToken };
      } catch (e) {
        console.error('Error retrieving tokens', e);
        return { token: null, refreshToken: null, idToken: null };
      }
    },
    clearTokens: () => {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(ID_TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(ID_TOKEN_KEY);
      } catch (e) {
        console.error('Error clearing tokens', e);
      }
    }
  };
  
  // Verify that all required Keycloak config values are present
  if (!config.public.NUXT_PUBLIC_KEYCLOAK_URL || !config.public.NUXT_PUBLIC_KEYCLOAK_REALM || !config.public.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID) {
    console.error('Missing Keycloak configuration. Please check your environment variables and Nuxt config.');
    
    // Provide a mock Keycloak instance that won't break the app
    const mockKc: KeycloakInstance = {
      authenticated: false,
      token: '',
      tokenParsed: {},
      idTokenParsed: { sub: '', preferred_username: '' },
      login: (options) => { 
        console.error('Keycloak not configured properly');
        alert('Keycloak configuration missing. Please check environment variables.');
      },
      logout: () => { 
        console.error('Keycloak not configured properly') 
      },
      updateToken: () => Promise.reject(new Error('Keycloak not configured properly')),
      onTokenExpired: null,
      onAuthSuccess: null,
      onAuthLogout: null
    };
    
    return {
      provide: {
        keycloak: mockKc
      }
    }
  }

  const keycloakConfig = {
    url: config.public.NUXT_PUBLIC_KEYCLOAK_URL as string,
    realm: config.public.NUXT_PUBLIC_KEYCLOAK_REALM as string,
    clientId: config.public.NUXT_PUBLIC_KEYCLOAK_CLIENT_ID as string
  };

  try {
    // Create Keycloak instance
    const kc = new Keycloak(keycloakConfig);

    // Configure token expiration handler
    kc.onTokenExpired = () => {
      if (isDev) {
        console.log('Token expired, attempting to refresh');
      }
      kc.updateToken(0).then(refreshed => {
        if (refreshed && kc.token && kc.refreshToken && kc.idToken) {
          // Store the refreshed tokens
          tokenStorage.saveTokens(kc.token, kc.refreshToken, kc.idToken);
        }
      }).catch(() => {
        if (isDev) {
          console.log('Failed to refresh token, logging out');
        }
        tokenStorage.clearTokens();
        kc.logout();
      });
    };
    
    // Add custom event handlers to save tokens when they change
    const originalOnAuthSuccess = kc.onAuthSuccess || (() => {});
    kc.onAuthSuccess = () => {
      if (kc.token && kc.refreshToken && kc.idToken) {
        tokenStorage.saveTokens(kc.token, kc.refreshToken, kc.idToken);
      }
      originalOnAuthSuccess();
    };
    
    const originalOnAuthLogout = kc.onAuthLogout || (() => {});
    kc.onAuthLogout = () => {
      tokenStorage.clearTokens();
      originalOnAuthLogout();
    };

    // Check for stored tokens first
    const { token, refreshToken, idToken } = tokenStorage.getTokens();
    const hasStoredTokens = !!token && !!refreshToken && !!idToken;
    
    if (isDev && hasStoredTokens) {
      console.log('Found stored tokens, will try to use them');
    }

    // Initialize Keycloak and wait for it to finish
    try {
      await kc.init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false, // Disable iframe checks to avoid issues
        responseMode: 'fragment',  // Use fragment response mode for better compatibility
        enableLogging: isDev, // Enable Keycloak's internal logging in dev mode
        token: token || undefined,
        refreshToken: refreshToken || undefined,
        idToken: idToken || undefined
      });
      
      // After successful init, save the tokens
      if (kc.authenticated && kc.token && kc.refreshToken && kc.idToken) {
        tokenStorage.saveTokens(kc.token, kc.refreshToken, kc.idToken);
      }
      
      // Add an interval to check token validity and refresh if needed
      const tokenCheckInterval = setInterval(() => {
        if (kc.authenticated) {
          kc.updateToken(60).then(refreshed => {
            if (refreshed && kc.token && kc.refreshToken && kc.idToken) {
              tokenStorage.saveTokens(kc.token, kc.refreshToken, kc.idToken);
              if (isDev) {
                console.log('Token refreshed and saved in background check');
              }
            }
          }).catch(() => {
            console.warn('Background token refresh failed');
          });
        }
      }, 30000); // Check every 30 seconds
      
      // Clear interval on page unload
      window.addEventListener('beforeunload', () => {
        clearInterval(tokenCheckInterval);
      });
      
      if (isDev) {
        console.log('Keycloak initialized, authenticated:', kc.authenticated);
      }
      
      // Very important - make sure Vue can find the keycloak instance
      nuxtApp.vueApp.provide('keycloak', kc);
      
      return {
        provide: {
          keycloak: kc as KeycloakInstance
        }
      };
    } catch (initError) {
      console.error('Failed to initialize Keycloak:', initError);
      // Clear tokens if initialization fails
      tokenStorage.clearTokens();
      throw initError;
    }
  } catch (error) {
    console.error('Error creating Keycloak instance:', error);
    
    // Provide a mock instance if creation fails
    const errorMock: KeycloakInstance = {
      authenticated: false,
      token: '',
      tokenParsed: {},
      idTokenParsed: { sub: '', preferred_username: '' },
      login: () => {
        console.error('Keycloak instantiation failed');
        alert('Failed to create Keycloak instance. See console for details.');
      },
      logout: () => { console.error('Keycloak instantiation failed') },
      updateToken: () => Promise.reject(new Error('Keycloak instantiation failed')),
    };
    
    return {
      provide: {
        keycloak: errorMock
      }
    };
  }
}); 