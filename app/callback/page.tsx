"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { storeAuthData, isAuthenticated } from '@/lib/auth';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL;
  const REDIRECT_URI = `http://localhost:3000/callback`;
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const keycloakError = searchParams.get('error');
    const state = searchParams.get('state');

    console.log('Callback page loaded with:', { code, state, error: keycloakError });

    // Prevent processing if already in progress
    if (isProcessing) {
      console.log('Token exchange already in progress');
      return;
    }

    if (keycloakError) {
      console.error('Keycloak error:', keycloakError);
      setError(`Authentication error: ${keycloakError}`);
      return;
    }

    // Check if we already have auth data and a valid token
    const authData = localStorage.getItem('auth_data');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.access_token) {
          console.log('Valid auth data found, redirecting to home');
          window.location.href = '/';
          return;
        }
      } catch (e) {
        console.error('Error parsing auth data:', e);
        localStorage.removeItem('auth_data');
      }
    }

    if (!code) {
      console.log('No code found, initiating login flow');
      const state = Math.random().toString(36).substring(7);
      const nonce = Math.random().toString(36).substring(7);
      
      // Store state for CSRF protection
      sessionStorage.setItem('oauth_state', state);

      const loginURL = `${KEYCLOAK_URL}/realms/betterGR/protocol/openid-connect/auth?` + 
        `client_id=account` +
        `&response_type=code` +
        `&scope=openid profile email` +
        `&state=${state}` + 
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

      window.location.href = loginURL;
      return;
    }

    // Check if this code has already been processed
    const processedCode = sessionStorage.getItem('processed_code');
    if (processedCode === code) {
      console.log('Code already processed, redirecting to home');
      window.location.href = '/';
      return;
    }

    // Verify state to prevent CSRF
    const savedState = sessionStorage.getItem('oauth_state');
    if (savedState && state !== savedState) {
      console.error('State mismatch:', { saved: savedState, received: state });
      setError('Invalid state parameter');
      sessionStorage.removeItem('oauth_state');
      return;
    }

    const handleCallback = async () => {
      try {
        setIsProcessing(true);
        console.log('Starting token exchange with code');
        
        const response = await fetch(`${API_URL}/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ code, redirect_uri: REDIRECT_URI })
        });
        
        console.log('Token exchange response:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Gateway error:', response.status, '-', errorText);
          setError(`Authentication failed: ${errorText}`);
          return;
        }

        const data = await response.json();
        console.log('Token received, storing auth data');
        await storeAuthData(data);
        
        // Mark this code as processed
        sessionStorage.setItem('processed_code', code);
        
        // Clear state after successful authentication
        sessionStorage.removeItem('oauth_state');
        
        // Remove code from URL before redirecting
        window.history.replaceState({}, document.title, '/callback');
        
        console.log('Redirecting to home page');
        window.location.href = '/';
      } catch (error) {
        console.error('Error in callback:', error);
        setError(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, isProcessing]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-red-600 text-xl mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => {
              // Clear all auth-related state
              sessionStorage.removeItem('oauth_state');
              sessionStorage.removeItem('processed_code');
              localStorage.removeItem('auth_data');
              window.location.href = '/callback';
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>{isProcessing ? 'Exchanging token...' : 'Processing authentication...'}</div>
    </div>
  );
} 