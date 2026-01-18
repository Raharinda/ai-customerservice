// Contoh penggunaan Auth dengan Role-based Access Control

'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function ExamplePage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1>Protected Page Example</h1>
        <p>Welcome, {user?.displayName}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </ProtectedRoute>
  );
}
