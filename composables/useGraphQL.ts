import { ref, Ref } from 'vue'
import { useAuth } from './useAuth.js'
import { useNuxtApp } from 'nuxt/app'
import type Keycloak from 'keycloak-js'

/**
 * Simple GraphQL client with Keycloak authentication
 */
export function useGraphQL() {
  const { token, isAuthenticated, updateToken } = useAuth()
  const nuxtApp = useNuxtApp()
  
  // State
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  /**
   * Get the current authentication token
   */
  function getAuthToken(): string {
    // First try to get token from useAuth composable
    if (token.value) {
      return token.value
    }
    
    // Fallback to Keycloak instance if available
    const keycloak = nuxtApp.$keycloak as Keycloak | undefined
    if (keycloak?.authenticated && keycloak?.token) {
      return keycloak.token
    }
    
    return ''
  }
  
  /**
   * Refresh the auth token if needed
   */
  async function refreshTokenIfNeeded(): Promise<boolean> {
    try {
      // Try to refresh the token
      const refreshed = await updateToken(60) // Refresh if less than 60 seconds left
      return !!refreshed
    } catch (error) {
      console.warn('Token refresh failed:', error)
      return false
    }
  }
  
  /**
   * Execute a GraphQL query with authentication
   */
  async function query(gqlQuery: string, variables: any = {}, retryCount = 0) {
    // Don't even try if we're not authenticated
    if (!isAuthenticated.value) {
      error.value = new Error('User not authenticated')
      return null
    }
    
    loading.value = true
    error.value = null
    
    // Try to refresh token before first attempt
    if (retryCount === 0) {
      await refreshTokenIfNeeded()
    }
    
    try {
      // Get auth token
      const authToken = getAuthToken()
      
      if (!authToken) {
        throw new Error('No authentication token available')
      }
      
      // Make the request
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          query: gqlQuery,
          variables
        })
      })
      
      // Parse response
      const result = await response.json()
      
      // Check for GraphQL errors
      if (result.errors && result.errors.length > 0) {
        const firstError = result.errors[0]
        const errorCode = firstError.extensions?.code
        
        // If authentication error and we haven't tried refreshing yet
        if (errorCode === 'UNAUTHENTICATED' && retryCount < 1) {
          // Try refreshing the token
          const refreshed = await refreshTokenIfNeeded()
          
          if (refreshed) {
            // Retry the query with the new token
            return query(gqlQuery, variables, retryCount + 1)
          }
        }
        
        throw new Error(firstError.message || 'GraphQL error')
      }
      
      return result.data
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * Fetch student courses
   */
  async function getCourses(studentId: string) {
    // Use a try/catch block to provide more specific error info
    try {
      // Check authentication
      if (!isAuthenticated.value) {
        console.warn('User not authenticated, cannot fetch courses')
        return []
      }
      
      const data = await query(`
        query GetStudentCourses($studentId: ID!) {
          studentCourses(studentId: $studentId) {
            id
            name
            semester
            description
          }
        }
      `, { studentId })
      
      return data?.studentCourses || []
    } catch (err) {
      // Log with more context
      console.error('Error fetching courses:', err)
      
      // In development, return mock data to help with UI development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock course data in development')
        const mockData = [
          {
            id: 'mock1',
            name: 'Introduction to Programming',
            semester: 'Fall 2023',
            description: 'Learn the basics of programming with Python'
          },
          {
            id: 'mock2',
            name: 'Data Structures and Algorithms',
            semester: 'Spring 2024',
            description: 'Advanced data structures and algorithmic thinking'
          },
          {
            id: 'mock3',
            name: 'Deep Learning',
            semester: 'Fall 2024',
            description: 'Neural networks and deep learning fundamentals'
          }
        ]
        return mockData
      }
      
      return []
    }
  }
  
  return {
    isAuthenticated,
    loading,
    error,
    query,
    getCourses
  }
} 