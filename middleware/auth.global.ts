// Import from Nuxt app
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import type { RouteLocationNormalized } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

/**
 * List of paths that don't require authentication
 */
const PUBLIC_PATHS = new Set([
  '/callback',     // Auth callback page
  '/assets',       // Static assets
  '/_nuxt',        // Nuxt system files
  '/silent-check-sso.html', // Silent SSO check
  '/favicon.ico',  // Favicon
  '/robots.txt'    // Robots file
  // Note: Removed '/' so that home page goes through auth middleware for staff redirection
])

/**
 * Check if a path should be publicly accessible
 */
const isPublicPath = (path: string): boolean => {
  // Direct match for public paths
  if (PUBLIC_PATHS.has(path)) {
    return true
  }
  
  // Check for path prefixes
  return Array.from(PUBLIC_PATHS).some(publicPath => 
    path.startsWith(publicPath + '/'))
}

// Add middleware execution tracking to prevent loops
let lastMiddlewareRun = 0
let consecutiveRuns = 0
const MIDDLEWARE_COOLDOWN = 1000 // 1 second cooldown
const MAX_CONSECUTIVE_RUNS = 3

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Skip middleware on server side
  if (process.server) {
    return
  }
  
  // Prevent middleware loops
  const now = Date.now()
  if (now - lastMiddlewareRun < MIDDLEWARE_COOLDOWN) {
    consecutiveRuns++
  } else {
    consecutiveRuns = 1
  }
  lastMiddlewareRun = now

  if (consecutiveRuns > MAX_CONSECUTIVE_RUNS) {
    console.warn('🛑 Auth middleware loop detected, stopping execution')
    return
  }
  
  // Skip for public paths
  if (isPublicPath(to.path)) {
    console.log('🔓 Public path, skipping auth:', to.path)
    return
  }
  
  console.log('🔒 Auth middleware running for path:', to.path)
  
  // Get auth state using our simplified useAuth composable
  const auth = useAuth()
  
  // Debug auth state
  console.log('🔍 Auth state in middleware:')
  console.log('  - isAuthenticated:', auth.isAuthenticated.value)
  console.log('  - roles:', auth.roles.value)
  console.log('  - isStaff:', auth.isStaff.value)
  console.log('  - isStudent:', auth.isStudent.value)
  
  try {
    // Try to refresh the token (silently) - but only if not already authenticated
    if (!auth.isAuthenticated.value) {
      try {
        console.log('🔄 User not authenticated, attempting token refresh...')
        await auth.updateToken(10)
        console.log('✅ Token refresh completed')
        
        // Debug auth state after token refresh
        console.log('🔍 Auth state after token refresh:')
        console.log('  - isAuthenticated:', auth.isAuthenticated.value)
        console.log('  - roles:', auth.roles.value)
        console.log('  - isStaff:', auth.isStaff.value)
        console.log('  - isStudent:', auth.isStudent.value)
      } catch (err) {
        console.warn('⚠️ Token update failed in middleware:', err)
      }
    }
    
    // If user is still not authenticated after refresh attempt, redirect to login
    if (!auth.isAuthenticated.value) {
      console.log('❌ User not authenticated, redirecting to home')
      
      // Store current path for redirect after login
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('login_redirect_path', to.fullPath)
      }
      
      // Redirect to home page which will show login button
      return navigateTo('/')
    }

    // Simplified staff redirection logic - only redirect from home page
    if (auth.isStaff.value && to.path === '/') {
      console.log('🏠 Staff user on home page, redirecting to admin')
      console.log('📊 User roles:', auth.roles.value)
      console.log('➡️ Redirecting to /admin')
      return navigateTo('/admin')
    }

    // If we get here, let the user proceed to their requested page
    console.log('✅ Auth middleware completed, allowing access to:', to.path)
    console.log('👤 User type:', auth.isStaff.value ? 'Staff' : 'Student')

  } catch (error) {
    console.error('❌ Auth middleware error:', error)
    
    // On error, only redirect if we're not already on a safe page
    if (to.path !== '/' && !to.path.startsWith('/admin')) {
      return navigateTo('/')
    }
  }
}) 