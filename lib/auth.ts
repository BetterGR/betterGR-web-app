export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  role: string;
  user_id: string;
  username: string;
}

interface StoredAuthData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: number;
  user_role: string;
  user_id: string;
  username: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

// Store the auth data in localStorage
export const storeAuthData = (data: AuthResponse) => {
  try {
    if (!data.access_token) {
      throw new Error('No access token received');
    }

    if (!data.role || !data.user_id) {
      throw new Error('Missing required user role or ID from response');
    }

    console.log('Received user ID from Keycloak:', data.user_id);

    const authData: StoredAuthData = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_at: Date.now() + (3600 * 1000),
      user_role: data.role,
      user_id: data.user_id,
      username: data.username
    };

    // Store in localStorage
    localStorage.setItem('auth_data', JSON.stringify(authData));
    
    // Also store in cookie for server-side auth with 1 hour expiration
    document.cookie = `auth_data=${JSON.stringify(authData)}; path=/; max-age=3600`;
    
    console.log('Auth data stored successfully');
  } catch (error) {
    console.error('Error storing auth data:', error);
    throw error;
  }
};

// Get the stored auth data
export const getAuthData = (): StoredAuthData | null => {
  try {
    const data = localStorage.getItem('auth_data');
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

// Get the access token
export const getAccessToken = (): string | null => {
  const authData = getAuthData();
  if (!authData) return null;
  
  // Check if token is expired
  if (authData.expires_at < Date.now()) {
    clearAuthData();
    return null;
  }
  
  return authData.access_token;
};

// Get user role
export const getUserRole = (): string | null => {
  const authData = getAuthData();
  return authData?.user_role || null;
};

// Verify token with API Gateway
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.active === true;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  // Verify token with API Gateway
  const isValid = await verifyToken(token);
  if (!isValid) {
    // Clear invalid auth data
    clearAuthData();
    return false;
  }

  return true;
};

// Clear auth data (for logout)
export const clearAuthData = async (): Promise<void> => {
  try {
    // Get the stored auth data before clearing it
    const authData = getAuthData();
    
    // Clear localStorage
    localStorage.removeItem('auth_data');
    
    // Clear all cookies
    document.cookie = 'auth_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Clear session storage (including OAuth state and code)
    sessionStorage.removeItem('oauth_state');
    sessionStorage.removeItem('code');
    sessionStorage.clear();

    if (authData?.access_token) {
      // Construct Keycloak logout URL
      const keycloakURL = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
      const logoutURL = `${keycloakURL}/realms/betterGR/protocol/openid-connect/logout`;
      const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);
      
      // Redirect to Keycloak logout endpoint
      window.location.href = `${logoutURL}?` +
        `client_id=api-gateway` +
        `&post_logout_redirect_uri=${redirectUri}`;
    } else {
      // If no token, just redirect to callback
      window.location.href = '/callback';
    }
    
    // Clear any URL parameters that might contain auth data
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  } catch (error) {
    console.error('Error during auth data cleanup:', error);
    // If there's an error, redirect to callback
    window.location.href = '/callback';
    throw error;
  }
};

// Example of how to use the token in API calls
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const authData = getAuthData();
  
  if (!authData || !authData.access_token) {
    throw new Error('No authentication token available');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${authData.access_token}`
  };

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
};

// Add a helper function to get user ID
export const getUserId = (): string | null => {
  const authData = getAuthData();
  return authData?.user_id || null;
};

// Add a helper function to get username
export const getUsername = (): string | null => {
  const authData = getAuthData();
  return authData?.username || null;
}; 