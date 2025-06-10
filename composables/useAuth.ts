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
  const userRoles = ref<string[]>([])
  
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
  }
  
  // Extract roles from Keycloak token
  function extractRoles(): string[] {
    const roles: string[] = []
    
    // Debug logging to see what tokens we have
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Debugging role extraction...')
      console.log('Keycloak instance exists:', !!kc)
      console.log('Authenticated:', kc?.authenticated)
      console.log('ID Token exists:', !!kc?.idToken)
      console.log('Access Token exists:', !!kc?.token)
      console.log('ID Token Parsed:', kc?.idTokenParsed)
      console.log('Access Token Parsed:', kc?.tokenParsed)
      
      // Log the full token structure to see what's available
      if (kc?.idTokenParsed) {
        console.log('ID Token structure:', {
          realm_access: kc.idTokenParsed.realm_access,
          resource_access: kc.idTokenParsed.resource_access,
          roles: kc.idTokenParsed.roles,
          groups: kc.idTokenParsed.groups
        })
      }
      
      if (kc?.tokenParsed) {
        console.log('Access Token structure:', {
          realm_access: kc.tokenParsed.realm_access,
          resource_access: kc.tokenParsed.resource_access,
          roles: kc.tokenParsed.roles,
          groups: kc.tokenParsed.groups
        })
      }
    }
    
    // Early return only if we have no tokens at all
    if (!kc?.idTokenParsed && !kc?.tokenParsed) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ No parsed tokens available for role extraction')
      }
      return []
    }
    
    // 1. Check idTokenParsed (ID token)
    if (kc?.idTokenParsed) {
      // Extract realm roles from ID token
      if (kc.idTokenParsed.realm_access?.roles) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Found realm roles in ID token:', kc.idTokenParsed.realm_access.roles)
        }
        roles.push(...kc.idTokenParsed.realm_access.roles)
      }
      
      // Extract resource roles (client-specific roles) from ID token
      if (kc.idTokenParsed.resource_access) {
        Object.keys(kc.idTokenParsed.resource_access).forEach(clientId => {
          const clientAccess = kc.idTokenParsed?.resource_access?.[clientId]
          if (clientAccess?.roles) {
            if (process.env.NODE_ENV === 'development') {
              console.log(`✅ Found client roles for ${clientId} in ID token:`, clientAccess.roles)
            }
            roles.push(...clientAccess.roles)
          }
        })
      }
      
      // Check for roles directly in token (some configurations put them here)
      if (kc.idTokenParsed.roles && Array.isArray(kc.idTokenParsed.roles)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ Found direct roles in ID token:', kc.idTokenParsed.roles)
        }
        roles.push(...kc.idTokenParsed.roles)
      }
    }
    
    // 2. Check tokenParsed (Access token) - often contains roles too
    if (kc?.tokenParsed) {
      // Extract realm roles from access token
      if (kc.tokenParsed.realm_access?.roles) {
        const accessTokenRoles = kc.tokenParsed.realm_access.roles.filter(role => !roles.includes(role))
        if (accessTokenRoles.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Found additional realm roles in access token:', accessTokenRoles)
          }
          roles.push(...accessTokenRoles)
        }
      }
      
      // Extract resource roles from access token
      if (kc.tokenParsed.resource_access) {
        Object.keys(kc.tokenParsed.resource_access).forEach(clientId => {
          const clientAccess = kc.tokenParsed?.resource_access?.[clientId]
          if (clientAccess?.roles) {
            const newRoles = clientAccess.roles.filter(role => !roles.includes(role))
            if (newRoles.length > 0) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Found additional client roles for ${clientId} in access token:`, newRoles)
              }
              roles.push(...newRoles)
            }
          }
        })
      }
      
      // Check for roles directly in access token
      if (kc.tokenParsed.roles && Array.isArray(kc.tokenParsed.roles)) {
        const directRoles = kc.tokenParsed.roles.filter(role => !roles.includes(role))
        if (directRoles.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Found additional direct roles in access token:', directRoles)
          }
          roles.push(...directRoles)
        }
      }
    }
    
    // Debug final result
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 Final extracted roles:', roles)
      if (roles.length === 0) {
        console.warn('⚠️ No roles found! Troubleshooting checklist:')
        console.warn('1. ✓ User has roles assigned in Keycloak admin console')
        console.warn('2. ✓ Roles are included in token scope/claims')
        console.warn('3. ✓ Client configuration includes roles in tokens')
        console.warn('4. ✓ Client mappers are configured for roles')
        console.warn('5. ✓ User has logged in after role assignment')
      }
    }
    
    return roles
  }

  // Update all the reactive state from the Keycloak instance
  function updateReactiveState() {
    if (!kc) return
    
    authenticated.value = !!kc.authenticated
    keycloakToken.value = kc.token || ''
    keycloakUserId.value = kc.idTokenParsed?.sub || ''
    keycloakUserName.value = kc.idTokenParsed?.preferred_username || 
                             kc.idTokenParsed?.name || ''
    userRoles.value = extractRoles()
    
    // Enhanced debug logging (always runs in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Auth state updated:')
      console.log('  - Authenticated:', authenticated.value)
      console.log('  - User ID:', keycloakUserId.value)
      console.log('  - Username:', keycloakUserName.value)
      console.log('  - Roles found:', userRoles.value)
      console.log('  - Is Staff:', userRoles.value.some(role => 
        role === 'staff' ||
        role === 'admin' ||
        role === 'realm-admin' ||
        role === 'realm staff' ||
        role.includes('staff') ||
        role.includes('admin')
      ))
      
      // Additional debugging info
      if (userRoles.value.length === 0) {
        console.warn('❌ No roles detected! This might be due to:')
        console.warn('   - Roles not assigned to user')
        console.warn('   - Token doesn\'t include role claims')
        console.warn('   - Client mapper configuration issue')
      }
    }
  }

  // Reactive authentication state
  const isAuthenticated = computed(() => authenticated.value)
  
  // User information from token
  const userId = computed(() => keycloakUserId.value)
  const userName = computed(() => keycloakUserName.value)
  
  // Token access
  const token = computed(() => keycloakToken.value)

  // Role-based access control
  const roles = computed(() => userRoles.value)
  const isStaff = computed(() => {
    // Check for various staff/admin role patterns
    return userRoles.value.some(role => 
      role === 'staff' ||
      role === 'admin' ||
      role === 'realm-admin' ||
      role === 'realm staff' ||
      role.includes('staff') ||
      role.includes('admin')
    )
  })
  const isStudent = computed(() => userRoles.value.includes('student') || !isStaff.value)
  const hasRole = (role: string) => userRoles.value.includes(role)
  
  // Add a flag to prevent infinite authentication loops
  let isCheckingAuthentication = false
  let lastAuthCheckTime = 0
  const AUTH_CHECK_COOLDOWN = 5000 // 5 seconds cooldown between checks

  const checkAuthentication = () => {
    // Prevent rapid successive authentication checks
    const now = Date.now()
    if (isCheckingAuthentication || (now - lastAuthCheckTime) < AUTH_CHECK_COOLDOWN) {
      console.log('🔄 Authentication check already in progress or in cooldown, skipping...')
      return Promise.resolve(false)
    }

    if (!kc) {
      console.log('❌ Keycloak not initialized, cannot check authentication')
      return Promise.resolve(false)
    }

    if (kc.authenticated) {
      console.log('✅ Already authenticated, skipping authentication check')
      return Promise.resolve(true)
    }

    isCheckingAuthentication = true
    lastAuthCheckTime = now
    
    console.log('🔄 Starting authentication check...')
      
    // Try to update the token (will use saved tokens automatically)
    return kc.updateToken(10)
      .then(() => {
        console.log('✅ Authentication restored successfully')
        updateReactiveState()
        
        // After successful authentication restore, check for staff redirection
        if (process.client && userRoles.value.some(role => 
          role === 'staff' ||
          role === 'admin' ||
          role.includes('staff') ||
          role.includes('admin')
        )) {
          console.log('🔄 Staff user authenticated, checking for redirection...')
          const currentPath = window.location.pathname
          
          // Redirect staff users to admin if they're not already there
          if (!currentPath.startsWith('/admin') && currentPath !== '/admin') {
            console.log('🚀 Redirecting staff user to admin panel from checkAuthentication')
            console.log('📊 Current path:', currentPath)
            console.log('📋 User roles:', userRoles.value)
            
            // Use window.location instead of navigateTo since we're not in a route context
            window.location.href = '/admin'
          }
        }
        
        return true
      })
      .catch(error => {
        console.warn('Failed to restore authentication after refresh:', error)
        return false
      })
      .finally(() => {
        isCheckingAuthentication = false
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
   * Updates the token if necessary
   * @param minValidity Minimum validity time in seconds
   * @returns Promise that resolves to true if the token was refreshed
   */
  const updateToken = async (minValidity = 10) => {
    if (!kc) {
      return Promise.reject(new Error('Keycloak not initialized'))
    }
    
    if (!kc.authenticated) {
      return false
    }

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Token update timeout')), 10000)
      })
      
      const updatePromise = kc.updateToken(minValidity)
      
      const updated = await Promise.race([updatePromise, timeoutPromise]) as boolean
      
      if (updated) {
        updateReactiveState()
      }
      
      return updated
    } catch (error) {
      // If token update fails, the user might need to re-authenticate
      if (error instanceof Error && (error.message?.includes('timeout') || error.message?.includes('expired'))) {
        console.warn('Token expired or update timed out - user may need to re-authenticate')
      }
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

  /**
   * Force clear all cached tokens and re-authenticate
   * This helps resolve token synchronization issues
   */
  const forceReAuthentication = async () => {
    try {
      // Clear browser storage
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('kc_') || key.includes('keycloak'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
        })
      }
      
      if (typeof sessionStorage !== 'undefined') {
        const keysToRemove = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('kc_') || key.includes('keycloak'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => {
          sessionStorage.removeItem(key)
        })
      }
      
      // Clear Keycloak state
      if (kc) {
        kc.clearToken()
        
        // Reset reactive state
        authenticated.value = false
        keycloakToken.value = ''
        keycloakUserId.value = ''
        keycloakUserName.value = ''
        
        // Force fresh login
        return login()
      }
    } catch (error) {
      console.error('Error during force re-authentication:', error)
      throw error
    }
  }
  console.log("roles", roles.value)

  // Return the auth API
  return {
    // State
    isInitialized,
    isAuthenticated,
    userId,
    userName,
    token,
    
    // Role-based access control
    roles,
    isStaff,
    isStudent,
    hasRole,
    
    // Methods
    login,
    logout,
    updateToken,
    updateAuthState,
    checkAuthentication,
    onAuthEvent,
    forceReAuthentication
  }
}