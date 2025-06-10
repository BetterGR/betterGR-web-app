import { defineEventHandler, readBody, getRequestHeaders, createError } from 'h3'

/**
 * Simple GraphQL API Proxy
 * 
 * This endpoint forwards GraphQL requests to the actual GraphQL server,
 * passing along authentication headers from the client.
 */
export default defineEventHandler(async (event) => {
  // Get request data and headers
  const body = await readBody(event)
  const headers = getRequestHeaders(event)
  
  // Extract authentication header
  const authHeader = headers.authorization || ''
  
  // Log in development mode only (without exposing sensitive data)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[GraphQL Proxy] Forwarding request with auth: ${authHeader ? 'Bearer token present' : 'No auth token'}`)
  }
  
  // Get GraphQL endpoint from environment variable
  const graphqlUrl = process.env.GRAPHQL_ENDPOINT 
  
  if (!graphqlUrl) {
    console.error('GraphQL host URL not configured in environment variables')
    return {
      errors: [{ message: 'GraphQL server URL not configured' }]
    }
  }
  
  try {
    // Forward the request to the GraphQL server
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(body)
    })
    
    // Handle non-OK responses (e.g., 401, 404) with appropriate error format
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = await response.text()
      }
      
      // Log the error for debugging
      console.error(`GraphQL server returned ${response.status}: `, errorData)
      
      // Create an appropriate error response
      return {
        errors: [{
          message: `GraphQL server returned ${response.status} ${response.statusText}`,
          extensions: {
            code: response.status === 401 ? 'UNAUTHENTICATED' : 'SERVER_ERROR',
            statusCode: response.status,
            details: errorData
          }
        }]
      }
    }
    
    // Return the server's successful response
    return response.json()
  } catch (error) {
    // Log the error
    console.error('GraphQL proxy error:', error)
    
    // Return a client-friendly error
    return {
      errors: [{ 
        message: error instanceof Error ? error.message : 'GraphQL server connection error',
        extensions: {
          code: 'SERVER_ERROR'
        }
      }]
    }
  }
}) 