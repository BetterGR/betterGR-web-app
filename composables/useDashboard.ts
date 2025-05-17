import { computed, ref, onMounted, onBeforeUnmount, ComputedRef, Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './useAuth.js'

// Define interfaces for our data structures
export interface Course {
  id: string;
  title: string;
  code: string;
  slug: string;
  semesterId: string;
  [key: string]: any;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  course: string;
  courseId: string;
  dueDate: string;
  status: string;
  semesterId: string;
  [key: string]: any;
}

export interface Semester {
  id: string;
  name: string;
  [key: string]: any;
}

// Temporary data stubs (these should be imported from actual data sources)
const courses: Course[] = []
const assignments: Assignment[] = []

export function useDashboard() {
  const router = useRouter()
  const route = useRoute()
  
  // Current semester (simplified mock implementation)
  const currentSemester = ref<Semester>({
    id: '1',
    name: 'Current Semester'
  })
  
  // Filter by semester function (simplified implementation)
  const filterBySemester = <T extends { semesterId: string }>(items: T[]): T[] => {
    return items.filter(item => item.semesterId === currentSemester.value.id)
  }
  
  const auth = useAuth()

  // Authentication state
  const checking = ref(true)
  const isAuthenticated = computed(() => auth.isAuthenticated.value)
  const username = computed(() => auth.userName.value)
  const userId = computed(() => auth.userId.value)
  let tokenRefreshInterval: NodeJS.Timeout | null = null

  // Filter courses by semester
  const filteredCourses = computed(() => filterBySemester(courses))

  // Filter assignments by semester and only pending or overdue
  const filteredAssignments = computed(() => {
    return assignments.filter(assignment => 
      assignment.semesterId === currentSemester.value.id && 
      (assignment.status === 'pending' || assignment.status === 'overdue')
    )
  })

  // Sort assignments by due date and limit to 5
  const upcomingAssignments = computed(() => {
    return filteredAssignments.value
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  })

  // Statistics for dashboard metrics
  const pending = computed(() => 
    assignments.filter(a => 
      a.semesterId === currentSemester.value.id && 
      a.status === 'pending'
    ).length
  )

  const upcoming = computed(() => {
    const now = new Date()
    const oneWeekLater = new Date()
    oneWeekLater.setDate(now.getDate() + 7)
    
    return assignments.filter(a => {
      const dueDate = new Date(a.dueDate)
      return a.semesterId === currentSemester.value.id && 
            a.status === 'pending' && 
            dueDate >= now && 
            dueDate <= oneWeekLater
    }).length
  })

  async function login(): Promise<void> {
    auth.login()
  }

  function logout(): void {
    // Set intentional logout flag to differentiate from session timeouts
    sessionStorage.setItem('intentional_logout', 'true')
    auth.logout()
  }

  // Handle redirects after successful authentication
  function handlePostLoginRedirect(): void {
    // Check if we have a stored redirect path
    const redirectPath = sessionStorage.getItem('login_redirect_path')
    if (redirectPath && isAuthenticated.value) {
      // Remove the stored path
      sessionStorage.removeItem('login_redirect_path')
      
      // Only redirect if not already on that path
      if (route.fullPath !== redirectPath) {
        console.log('Redirecting to stored path after login:', redirectPath)
        router.push(redirectPath)
      }
    }
  }

  // Check authentication status in the background
  async function checkAuth(): Promise<void> {
    try {
      // Clean URL of error parameters
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('error')) {
        const errorMsg = urlParams.get('error_description') || urlParams.get('error')
        console.error('Auth error from URL:', errorMsg)
        // Clean error parameters from URL
        router.replace(window.location.pathname)
      }
      
      // Force re-check of authentication status
      auth.updateAuthState()
      
      // Try to update token if needed
      try {
        await auth.updateToken(60)
      } catch (err) {
        console.warn('Token update failed:', err)
      }
      
      console.log('Auth check complete:', {
        isAuthenticated: isAuthenticated.value,
        username: username.value,
        hasToken: !!auth.token.value
      })
      
      // Handle any redirect after successful login
      if (isAuthenticated.value) {
        handlePostLoginRedirect()
      }
      
      // Add minimal delay after auth check completes
      setTimeout(() => {
        checking.value = false
      }, 100)
    } catch (error) {
      console.error('Error during auth check:', error)
      checking.value = false
    }
  }

  // Check if URL has logout parameter
  function checkLogoutState(): boolean {
    const urlParams = new URLSearchParams(window.location.search)
    const intentionalLogout = sessionStorage.getItem('intentional_logout') === 'true'
    
    // Clean up URL if it has logout or error parameters
    if (urlParams.has('logout') || urlParams.has('error')) {
      router.replace(window.location.pathname)
    }
    
    // Don't treat auth errors as logouts
    if (urlParams.has('error')) {
      console.error('Authentication error:', urlParams.get('error'))
      return false
    }
    
    // Intentional logout or logout parameter
    if (urlParams.has('logout') || intentionalLogout) {
      console.log('User was logged out:', intentionalLogout ? 'intentionally' : 'session expired')
      sessionStorage.removeItem('intentional_logout')
      return true
    }
    
    return false
  }

  // Set up periodic token refresh
  function setupTokenRefresh(): void {
    // Clear any existing interval
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval)
    }
    
    // Set up new interval (every 5 minutes)
    tokenRefreshInterval = setInterval(() => {
      if (auth.isAuthenticated.value) {
        auth.updateToken(60).catch((err: Error) => {
          console.warn('Background token refresh failed:', err)
        })
      }
    }, 5 * 60 * 1000) // 5 minutes
  }

  // Register auth event listeners
  let unsubscribeSuccess = () => {}
  let unsubscribeLogout = () => {}

  function setupAuthListeners(): void {
    unsubscribeSuccess = auth.onAuthEvent('auth:success', () => {
      checkAuth() // Re-check auth state to get user details
    })

    unsubscribeLogout = auth.onAuthEvent('auth:logout', () => {
      checking.value = false
    })
  }

  // Initial setup
  function initialize(): void {
    // Allow partial UI rendering while checking in background
    const isLogoutFlow = checkLogoutState()
    
    if (!isLogoutFlow) {
      // Use a short timeout to let the UI render first, then do auth check
      setTimeout(async () => {
        await checkAuth()
      }, 10)
    } else {
      // If in logout flow, immediately set checking to false
      checking.value = false
    }
    
    // Set up token refresh
    setupTokenRefresh()
    
    // Set up auth listeners
    setupAuthListeners()
  }

  // Set up initialization and cleanup
  onMounted(() => {
    initialize()
  })

  onBeforeUnmount(() => {
    // Clean up token refresh interval
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval)
    }
    
    // Unsubscribe from auth events
    unsubscribeSuccess()
    unsubscribeLogout()
  })

  return {
    // Auth state
    checking,
    isAuthenticated,
    username,
    userId,
    login,
    logout,
    
    // Semester data
    currentSemester,
    
    // Course and assignment data
    filteredCourses,
    upcomingAssignments,
    
    // Metrics
    pending,
    upcoming,
    
    // Extra helpers
    handlePostLoginRedirect
  }
} 