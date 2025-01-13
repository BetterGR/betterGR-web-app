"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { storeAuthData } from '@/lib/auth';
import { getAuthData } from '@/lib/auth';
import { AuthResponse } from '@/lib/auth';



export default function LoginPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data: AuthResponse = await response.json();
      
      // Store auth data in localStorage
      storeAuthData(data);
      
      // Set the Authorization header for future requests
      const token = data.access_token;
      if (typeof window !== 'undefined') {
        // Add Authorization header to all future fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
          if (init?.headers) {
            init.headers = {
              ...init.headers,
              'Authorization': `Bearer ${token}`
            };
          } else {
            init = {
              ...init,
              headers: {
                'Authorization': `Bearer ${token}`
              }
            };
          }
          return originalFetch(input, init);
        };
      }
      
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <Card className="w-[500px] -mt-20">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">Welcome to Technion Portal</CardTitle>
          <CardDescription className="text-lg">
            Sign in with your Technion credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleInputChange}
              className="h-12 text-lg"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleInputChange}
              className="h-12 text-lg"
            />
          </div>
          <Button 
            onClick={handleLogin}
            className="w-full h-12 text-lg"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}