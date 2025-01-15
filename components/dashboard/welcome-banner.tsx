"use client";

import { useState, useEffect } from 'react';
import { getUsername } from '@/lib/auth';

export function WelcomeBanner() {
  const [userName, setUserName] = useState<string>("Student");

  useEffect(() => {
    const username = getUsername();
    if (username) {
      setUserName(username);
    }
  }, []);

  return (
    <div className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3">
      <div>
        <h2 className="text-lg font-semibold">Welcome back, {userName}</h2>
        <p className="text-sm text-muted-foreground">
          Here's what's happening with your courses today.
        </p>
      </div>
    </div>
  );
}