'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CustomerMessagesInbox from '@/app/agent/_components/CustomerMessagesInbox'
import { useAuth } from '@/contexts/AuthContext'

export default function AgentDashboard() {
    const { user, logout, loading } = useAuth()

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-gray-600'>Memverifikasi akses...</p>
            </div>
        )
    }

    return (
        <ProtectedRoute requiredRole='agent'>
            <div className='min-h-screen bg-gray-50'>
                <header className='bg-white border-b border-gray-200'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <div className='flex justify-between items-center py-6'>
                            <div>
                                <h1 className='text-3xl font-bold text-gray-900'>
                                    Agent Dashboard
                                </h1>
                                <p className='mt-1 text-sm text-gray-500'>
                                    Welcome, {user?.displayName || user?.email}{' '}
                                    | Role: Support Agent
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors'
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <CustomerMessagesInbox />
                </main>
            </div>
        </ProtectedRoute>
    )
}
