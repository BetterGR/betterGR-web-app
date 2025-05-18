import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from './useAuth.js'
import { useCourses } from './useCourses.js'
import { useAssignments } from './useAssignments.js'
import { useSemesters } from './useSemesters.js'

/**
 * Main dashboard composable that orchestrates the dashboard functionality
 */
export function useDashboard() {
  const router = useRouter()
  const route = useRoute()
  const auth = useAuth()
  
  //-------------------------------------------------------
  // STATE MANAGEMENT
  //-------------------------------------------------------
  
  // Get required state from auth
  const checking = ref(true)
  const isAuthenticated = computed(() => auth.isAuthenticated.value)
  const username = computed(() => auth.userName.value)
  const userId = computed(() => auth.userId.value)
  
  // Get semester management
  const { currentSemester, semesters, updateSemesters } = useSemesters()
  
  // Get course management
  const { 
    courses, 
    loading: loadingCourses, 
    error: coursesError,
    fetchCourses 
  } = useCourses()
  
  // Get assignment management
  const { 
    upcomingAssignments,
    pending,
    upcoming,
    updateAssignments
  } = useAssignments(computed(() => currentSemester.value.id))
  
  //-------------------------------------------------------
  // DATA FILTERING & COMPUTED PROPERTIES
  //-------------------------------------------------------
  
  // Filter by semester helper function
  const filterBySemester = <T extends { semesterId: string }>(items: T[]): T[] => {
    return items.filter(item => item.semesterId === currentSemester.value.id)
  }
  
  // Filtered courses for current semester
  const filteredCourses = computed(() => filterBySemester(courses.value))

  //-------------------------------------------------------
  // AUTHENTICATION FUNCTIONS
  //-------------------------------------------------------
  
  // Login function
  function login(): void {
    auth.login()
  }

  // Logout function
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

  //-------------------------------------------------------
  // INITIALIZATION & LIFECYCLE
  //-------------------------------------------------------
  
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
  }
  
  // Watch for changes to update derived data
  function setupWatchers() {
    // Update semester list when courses change
    watch(courses, () => {
      updateSemesters()
      updateAssignments()
    })
    
    // Watch for auth changes and fetch courses when user signs in
    watch(isAuthenticated, (newValue: boolean) => {
      if (newValue && userId.value) {
        console.log('User authenticated, fetching courses...')
        fetchCourses()
      } else {
        // Clear courses when user logs out
        courses.value = []
      }
    }, { immediate: true })
  }

  // Set up initialization and cleanup
  onMounted(() => {
    initialize()
    setupWatchers()
    
    // Auto-fetch courses when authenticated
    if (isAuthenticated.value && userId.value) {
      fetchCourses()
    }
  })

  //-------------------------------------------------------
  // RETURN COMPOSABLE API
  //-------------------------------------------------------
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
    semesters,
    
    // Course and assignment data
    filteredCourses,
    upcomingAssignments,
    courses, 
    
    // Loading states
    loadingCourses,
    coursesError,
    
    // Metrics
    pending,
    upcoming,
    
    // Helpers
    handlePostLoginRedirect,
    fetchCourses
  }
} 