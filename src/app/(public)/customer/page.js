'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerPage() {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Customer Dashboard</h1>
                            <button
                                onClick={logout}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                        
                        <div className="border-t pt-6">
                            <h2 className="text-xl font-semibold mb-4">Informasi User</h2>
                            <div className="space-y-2">
                                <p><span className="font-medium">Nama:</span> {user?.displayName}</p>
                                <p><span className="font-medium">Email:</span> {user?.email}</p>
                                <p><span className="font-medium">User ID:</span> {user?.uid}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

