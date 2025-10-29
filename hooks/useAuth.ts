'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          // Only redirect if we're on a protected page
          if (window.location.pathname.startsWith('/dashboard')) {
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.clear();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      router.push('/login');
    }
  };

  return { user, loading, logout };
}