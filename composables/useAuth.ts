import { computed, ref, inject, getCurrentInstance } from 'vue'
import { useNuxtApp } from 'nuxt/app'
import type Keycloak from 'keycloak-js'

/**
 * Auth composable for managing Keycloak authentication
 * 
 * Provides simple reactive access to auth state and methods to login, logout, and refresh tokens
 */
export function useAuth() {
  const nuxtApp = useNuxtApp()
  
  // Reactive states
  const isInitialized = ref(false)
  const authenticated = ref(false)
  const keycloakToken = ref('')
  const keycloakUserId = ref('')
  const keycloakUserName = ref('')
  
  // Access Keycloak instance
  let kc: Keycloak | undefined
  
  // Initialize immediately if we're on client-side
  if (process.client) {
    // Get Keycloak instance from the Nuxt app provided by the plugin
    kc = nuxtApp.$keycloak as Keycloak | undefined
    
    // Fallback to Vue injection if not found in nuxtApp (for compatibility)
    if (!kc) {
      kc = inject('keycloak') as Keycloak | undefined
    }
    
    // Add debug for injection issues (only in development)
    if (!kc && process.env.NODE_ENV === 'development') {
      console.warn('Keycloak injection not found in useAuth(). Check plugin configuration.')
    } else if (kc) {
      // Update reactive state based on Keycloak instance
      updateReactiveState()
      isInitialized.value = true
    }
  
    // If we're in a browser context, try to restore auth
    setTimeout(() => {
      checkAuthentication()
    }, 500)
  }
  
  // Update all the reactive state from the Keycloak instance
  function updateReactiveState() {
    if (!kc) return
    
    authenticated.value = !!kc.authenticated
    keycloakToken.value = kc.token || ''
    keycloakUserId.value = kc.idTokenParsed?.sub || ''
    keycloakUserName.value = kc.idTokenParsed?.preferred_username || 
                             kc.idTokenParsed?.name || ''
  }

  // Reactive authentication state
  const isAuthenticated = computed(() => authenticated.value)
  
  // User information from token
  const userId = computed(() => keycloakUserId.value)
  const userName = computed(() => keycloakUserName.value)
  
  // Token access
  const token = computed(() => keycloakToken.value)

  // Helper to check if we need to restore authentication after a refresh
  const checkAuthentication = () => {
    if (!kc || kc.authenticated) {
      return; // Already authenticated or no keycloak instance
    }
      
    // Try to update the token (will use saved tokens automatically)
    return kc.updateToken(10)
      .then(() => {
        updateReactiveState()
        return true
      })
      .catch(error => {
        console.warn('Failed to restore authentication after refresh:', error)
        return false
      })
  }
  
  /**
   * Trigger login flow
   */
  const login = () => {
    if (!kc) {
      console.error('Keycloak not initialized')
      alert('Login is unavailable. Keycloak is not properly initialized. Please check your configuration.')
      return Promise.reject(new Error('Keycloak not initialized'))
    }
    
    // Construct redirect URI (default to origin if not specified)
    const redirectUri = window.location.origin
    
    try {
      return kc.login({
        redirectUri,
        prompt: 'login', // Force login prompt even if already authenticated
      })
    } catch (error) {
      console.error('Login error:', error)
      return Promise.reject(error)
    }
  }

  /**
   * Trigger logout flow
   */
  const logout = () => {
    if (!kc) {
      console.error('Keycloak not initialized')
      return Promise.reject(new Error('Keycloak not initialized'))
    }
    
    // Store a flag to indicate intentional logout (vs. session timeout)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('intentional_logout', 'true')
    }
    
    const redirectUri = `${window.location.origin}?logout=true`
    
    try {
      return kc.logout({
        redirectUri
      })
    } catch (error) {
      console.error('Logout error:', error)
      return Promise.reject(error)
    }
  }

  /**
   * Update token if it's about to expire
   * @param minValidity Minimum validity in seconds
   */
  const updateToken = async (minValidity = 10) => {
    if (!kc) {
      console.error('Keycloak not initialized')
      return Promise.reject(new Error('Keycloak not initialized'))
    }
    
    if (!kc.authenticated) {
      console.warn('Cannot update token - not authenticated')
      return false
    }
    
    try {
      const updated = await kc.updateToken(minValidity)
      if (updated) {
        updateReactiveState()
      }
      return updated
    } catch (error) {
      console.error('Failed to update token:', error)
      throw error
    }
  }

  /**
   * Force update of authentication state from Keycloak
   */
  const updateAuthState = () => {
    if (!kc) {
      return {
        isAuthenticated: false,
        token: '',
        userId: '',
        userName: ''
      }
    }
    
    updateReactiveState()
    
    // Return the current state
    return {
      isAuthenticated: authenticated.value,
      token: keycloakToken.value,
      userId: keycloakUserId.value,
      userName: keycloakUserName.value
    }
  }

  /**
   * Register a callback for a Keycloak event
   * @param event Event name (auth:success, auth:logout, etc.)
   * @param callback Function to call when event is fired
   */
  const onAuthEvent = (event: string, callback: Function) => {
    if (!kc) {
      console.warn(`Cannot register event ${event} - Keycloak not initialized`)
      return () => {} // Return empty unsubscribe function
    }
    
    // Map our simplified event names to Keycloak event handlers
    if (event === 'auth:success') {
      const originalOnAuthSuccess = kc.onAuthSuccess || (() => {})
      kc.onAuthSuccess = (...args) => {
        updateReactiveState()
        originalOnAuthSuccess.apply(kc, args)
        callback(...args)
      }
    } else if (event === 'auth:logout') {
      const originalOnAuthLogout = kc.onAuthLogout || (() => {})
      kc.onAuthLogout = (...args) => {
        updateReactiveState()
        originalOnAuthLogout.apply(kc, args)
        callback(...args)
      }
    }
    
    // Return function to unsubscribe (unimplemented but kept for API consistency)
    return () => {
      // In a real implementation, we would restore the original handler
    }
  }

  // Return the auth API
  return {
    // State
    isInitialized,
    isAuthenticated,
    userId,
    userName,
    token,
    
    // Methods
    login,
    logout,
    updateToken,
    updateAuthState,
    checkAuthentication,
    onAuthEvent,
    
    // Debug helper method
    debug: () => {
      const isDev = process.env.NODE_ENV === 'development'
      if (!isDev) {
        console.warn('Auth debugging is only available in development mode')
        return null
      }
      
      try {
        console.group('🔑 Auth Debug Information')
        console.log('Keycloak instance exists:', !!kc)
        console.log('Initialized:', isInitialized.value)
        console.log('Authenticated:', authenticated.value)
        
        if (kc) {
          console.log('KC Authenticated:', kc.authenticated)
          console.log('KC Token exists:', !!kc.token)
          
          if (kc.token) {
            const tokenPreview = kc.token.substring(0, 20) + '...'
            console.log('Token preview:', tokenPreview)
            
            try {
              // Decode the JWT token parts without validation
              const parts = kc.token.split('.')
              if (parts.length === 3) {
                const header = JSON.parse(atob(parts[0]))
                const payload = JSON.parse(atob(parts[1]))
                
                console.log('Token header:', header)
                console.log('Token payload:', {
                  sub: payload.sub,
                  exp: new Date(payload.exp * 1000).toLocaleString(),
                  iat: new Date(payload.iat * 1000).toLocaleString(),
                  expiresIn: Math.floor((payload.exp * 1000 - Date.now()) / 1000) + ' seconds'
                })
              }
            } catch (e) {
              console.warn('Error decoding token', e)
            }
          }
        }
        
        // Check storage
        const localStorageToken = localStorage.getItem('kc_token')
        const sessionStorageToken = sessionStorage.getItem('kc_token')
        console.log('Token in localStorage:', !!localStorageToken)
        console.log('Token in sessionStorage:', !!sessionStorageToken)
        
        console.groupEnd()
        
        // Return diagnostic info that could be useful for debugging
        return {
          hasKeycloak: !!kc,
          initialized: isInitialized.value,
          authenticated: authenticated.value,
          kcAuthenticated: kc?.authenticated,
          hasToken: !!kc?.token,
          tokenInLocalStorage: !!localStorageToken,
          tokenInSessionStorage: !!sessionStorageToken
        }
      } catch (error) {
        console.error('Error in auth debug:', error)
        console.groupEnd()
        return null
      }
    }
  }
}