'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Jika user belum login, redirect ke login
      if (!user) {
        router.push('/login');
        return;
      }

      // Jika requiredRole ditentukan, cek apakah user memiliki role yang sesuai
      if (requiredRole && user.role !== requiredRole) {
        console.log('❌ User role mismatch. Required:', requiredRole, 'Got:', user.role);
        
        // Redirect berdasarkan role user
        if (user.role === 'agent') {
          router.push('/agent/dashboard');
        } else {
          router.push('/customer');
        }
      }
    }
  }, [user, loading, router, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Jika requiredRole ditentukan dan user tidak memiliki role yang sesuai, jangan render children
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
