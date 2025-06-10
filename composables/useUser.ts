import { ref, readonly, computed, watch } from 'vue'
import { useAuth } from './useAuth.js'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'student' | 'staff'
  phoneNumber?: string
  title?: string // For staff
  office?: string // For staff
}

export function useUser() {
  const user = ref<User | null>(null)
  const { isAuthenticated, userId, userName } = useAuth()

  // Initialize user from authentication - get real user data
  const initializeUser = async () => {
    try {
      if (!isAuthenticated.value || !userId.value) {
        user.value = null
        return
      }

      const { hasRole } = useAuth()
      
      // Determine user role from Keycloak roles
      const userRole: 'student' | 'staff' = hasRole('staff') || hasRole('admin') ? 'staff' : 'student'
      
      // Create user data from Keycloak token
      const userData: User = {
        id: userId.value,
        firstName: userName.value.split(' ')[0] || 'User',
        lastName: userName.value.split(' ').slice(1).join(' ') || '',
        email: userName.value.includes('@') ? userName.value : userName.value + '@technion.ac.il',
        role: userRole
      }
      
      console.log('Initialized user for chat:', userData)
      user.value = userData
    } catch (error) {
      console.error('Failed to initialize user:', error)
    }
  }

  // Login function - delegates to Keycloak
  const login = async () => {
    const { login: keycloakLogin } = useAuth()
    try {
      await keycloakLogin()
      await initializeUser()
      return user.value
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  // Logout function - delegates to Keycloak
  const logout = async () => {
    const { logout: keycloakLogout } = useAuth()
    try {
      await keycloakLogout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      user.value = null
    }
  }

  // Set user manually (for integration with existing auth)
  const setUser = (userData: User) => {
    user.value = userData
    localStorage.setItem('betterGR_user', JSON.stringify(userData))
  }

  // Watch for authentication changes
  if (process.client) {
    watch(isAuthenticated, (authenticated: boolean) => {
      if (authenticated) {
        initializeUser()
      } else {
        user.value = null
      }
    }, { immediate: true })
  }

  return {
    user: readonly(user),
    login,
    logout,
    setUser,
    isAuthenticated: computed(() => !!user.value),
    isStudent: computed(() => user.value?.role === 'student'),
    isStaff: computed(() => user.value?.role === 'staff'),
  }
} 