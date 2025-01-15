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
      console.log('Attempting login...');
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password
        })
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Raw login response:', data);

      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.error || 'Authentication failed');
      }

      console.log('Login successful');
      
      try {
        console.log('Storing auth data...');
        await storeAuthData(data);
        console.log('Auth data stored successfully');
        
        console.log('Redirecting to home page...');
        router.push('/');  // Root route is our dashboard
        console.log('Redirection initiated');
      } catch (navError) {
        console.error('Navigation or storage error:', navError);
        throw navError;
      }

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
          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}>
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
              type="submit"
              className="w-full h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}