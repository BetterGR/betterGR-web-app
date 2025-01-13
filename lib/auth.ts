export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface StoredAuthData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_at: number;
  user_role?: string;
}

// Store the auth data in localStorage
export const storeAuthData = (data: AuthResponse) => {
  try {
    // Parse the JWT to get user role
    const tokenData = JSON.parse(atob(data.access_token.split('.')[1]));
    const userRole = tokenData.realm_access?.roles?.[0];

    // Store auth data with expiry
    const authData: StoredAuthData = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_at: Date.now() + (data.expires_in * 1000),
      user_role: userRole
    };

    localStorage.setItem('auth_data', JSON.stringify(authData));
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
  localStorage.removeItem('auth_data');
};

// Example of how to use the token in API calls
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  return fetch(url, {
    ...options,
    headers
  });
}; 