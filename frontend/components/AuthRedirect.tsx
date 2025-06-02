'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../app/context/AuthContext';

interface AuthRedirectProps {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  redirectIfNotAuthenticated?: boolean;
}

export default function AuthRedirect({
  redirectTo = '/dashboard',
  redirectIfAuthenticated = false,
  redirectIfNotAuthenticated = false
}: AuthRedirectProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;

    // Add a small delay to prevent immediate redirects that interfere with navigation
    const timer = setTimeout(() => {
      console.log('🔄 AuthRedirect - isAuthenticated:', isAuthenticated);
      console.log('🔄 AuthRedirect - redirectIfAuthenticated:', redirectIfAuthenticated);
      console.log('🔄 AuthRedirect - redirectIfNotAuthenticated:', redirectIfNotAuthenticated);

      if (redirectIfAuthenticated && isAuthenticated) {
        console.log('✅ Redirecting authenticated user to:', redirectTo);
        router.replace(redirectTo);
      }

      if (redirectIfNotAuthenticated && !isAuthenticated) {
        console.log('❌ Redirecting unauthenticated user to:', redirectTo);
        router.replace(redirectTo);
      }
    }, 100); // Small delay to allow navigation to complete

    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, router, redirectTo, redirectIfAuthenticated, redirectIfNotAuthenticated]);

  return null; // This component doesn't render anything
}
