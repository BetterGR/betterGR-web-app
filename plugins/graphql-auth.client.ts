import { defineNuxtPlugin } from 'nuxt/app'

// Simple plugin to add auth token to GraphQL requests
export default defineNuxtPlugin((nuxtApp) => {
  // Skip on server-side
  if (process.server) {
    return
  }
  
  // Get GraphQL client
  const { $gql } = nuxtApp
  
  if ($gql) {
    // Use type assertion to bypass TypeScript errors
    const gql = $gql as any
    
    // Add a middleware function to attach the token
    gql.clientsMiddlewareFn = [
      async (operation: any, context: any) => {
        try {
          // Get token from Keycloak
          const kc = nuxtApp.$keycloak as any
          
          // Only add token if keycloak exists and is authenticated
          if (kc?.authenticated && kc?.token) {
            if (!context.headers) {
              context.headers = {}
            }
            // Use the token type from Keycloak if available, fallback to Bearer
            const tokenType = kc.tokenParsed?.typ || 'Bearer'
            context.headers['Authorization'] = `${tokenType} ${kc.token}`
            // Only log in development mode
            if (process.env.NODE_ENV === 'development') {
              console.log('Added auth token to GraphQL request')
            }
          } else if (process.env.NODE_ENV === 'development') {
            console.log('No auth token available for GraphQL request')
          }
        } catch (error) {
          console.error('Error adding auth token to GraphQL request:', error)
        }
        
        return { operation, context }
      }
    ]
  }
}) 