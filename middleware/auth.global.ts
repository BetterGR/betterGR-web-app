// Import from Nuxt app
import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import type { RouteLocationNormalized } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

/**
 * List of paths that don't require authentication
 */
const PUBLIC_PATHS = new Set([
  '/',             // Home page is public but will show auth required banner
  '/callback',     // Auth callback page
  '/assets',       // Static assets
  '/_nuxt',        // Nuxt system files
  '/silent-check-sso.html', // Silent SSO check
  '/favicon.ico',  // Favicon
  '/robots.txt'    // Robots file
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

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Skip middleware on server side
  if (process.server) {
    return
  }
  
  // Skip for public paths
  if (isPublicPath(to.path)) {
    return
  }
  
  // Get auth state using our simplified useAuth composable
  const auth = useAuth()
  
  try {
    // Try to refresh the token (silently)
    try {
      await auth.updateToken(10)
    } catch (err) {
      console.warn('Token update failed in middleware:', err)
    }
    
    // If user is still not authenticated after refresh attempt, redirect to login
    if (!auth.isAuthenticated.value) {
      // Store current path for redirect after login
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('login_redirect_path', to.fullPath)
      }
      
      // Redirect to home page which will show login button
      return navigateTo('/')
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    
    // On error, redirect to home where login button will be shown
    return navigateTo('/')
  }
}) 