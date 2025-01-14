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
      expires_at: Date.now() + (data.expires_in * 1000),
      user_role: data.role,
      user_id: data.user_id,
      username: data.username
    };

    // Store in localStorage
    localStorage.setItem('auth_data', JSON.stringify(authData));
    
    // Also store in cookie for server-side auth
    document.cookie = `auth_data=${JSON.stringify(authData)}; path=/; max-age=${data.expires_in}`;
    
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

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return !!token;
};

// Clear auth data (for logout)
export const clearAuthData = (): void => {
  // Clear localStorage
  localStorage.removeItem('auth_data');
  
  // Clear the cookie by setting it to expire immediately
  document.cookie = 'auth_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// Example of how to use the token in API calls
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const authData = getAuthData();
  
  if (!authData || !authData.access_token) {
    throw new Error('No authentication token available');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${authData.access_token}`
  };

  return fetch(url, {
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