<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100">
    <div class="rounded-lg bg-white p-8 shadow-md text-center">
      <h1 class="mb-4 text-2xl font-bold">{{ statusMessage }}</h1>
      <p v-if="!errorMessage" class="text-gray-600">Please wait while we complete your authentication...</p>
      <p v-else class="text-red-600">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const { updateAuthState, isAuthenticated } = useAuth()
const statusMessage = ref('Authenticating...')
const errorMessage = ref('')

// Check for OAuth2 error parameters
const checkForErrors = () => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const errorDescription = urlParams.get('error_description')
    
    if (error) {
      errorMessage.value = errorDescription || `Authentication error: ${error}`
      statusMessage.value = 'Authentication Failed'
      console.error('OAuth error:', error, errorDescription)
      return true
    }
  }
  return false
}

onMounted(() => {
  // Check for errors first
  if (checkForErrors()) {
    // If there's an error, redirect to home after a delay
    setTimeout(() => {
      router.replace('/')
    }, 3000)
    return
  }
  
  // Force update auth state immediately
  updateAuthState()
  
  // Determine if authentication was successful
  if (!isAuthenticated.value) {
    // Handle case where we're on callback page but not authenticated
    statusMessage.value = 'Authentication incomplete'
    
    // Give a short delay to see if authentication completes
    setTimeout(() => {
      updateAuthState() // Try again
      
      if (!isAuthenticated.value) {
        errorMessage.value = 'Authentication did not complete successfully'
        
        // Redirect to home after showing error
        setTimeout(() => {
          router.replace('/')
        }, 2000)
      } else {
        // Authentication completed during wait - proceed with redirect
        completeAuthAndRedirect()
      }
    }, 1000)
  } else {
    // Authentication already successful, proceed with redirect
    completeAuthAndRedirect()
  }
})

// Helper function to complete auth flow and redirect
const completeAuthAndRedirect = () => {
  // Update status message
  statusMessage.value = 'Redirecting...'
  
  // Get redirect path from storage using RFC-compliant approach
  // See: https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2
  const redirectPath = sessionStorage.getItem('login_redirect_path') || '/'
  sessionStorage.removeItem('login_redirect_path')
  
  // Use immediate redirect with replace to avoid browser history issues
  setTimeout(() => {
    router.replace(redirectPath)
  }, 300)
}
</script> 