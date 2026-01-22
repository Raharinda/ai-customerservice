'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CustomerMessagesInbox from '@/components/agent/CustomerMessagesInbox'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Agent Dashboard - SEAMLESS Experience
 * 
 * ✅ Automatic authentication
 * ✅ No manual token handling needed
 * ✅ Auto-refresh messages
 * ✅ Protected route (only agents can access)
 * 
 * HOW IT WORKS:
 * 1. User login sebagai agent
 * 2. Token automatically managed by Firebase SDK & AuthContext
 * 3. Components automatically fetch data using hooks
 * 4. No manual token input needed - completely seamless!
 */
export default function AgentDashboard() {
    const { user, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Redirect jika bukan agent
        if (user && user.role !== 'agent') {
            router.push('/customer')
        }
        // Redirect ke login agent jika tidak login
        if (!user) {
            router.push('/agent')
        }
    }, [user, router])

    if (!user || user.role !== 'agent') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Memverifikasi akses...</p>
                </div>
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Agent Dashboard
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Welcome, {user?.displayName || user?.email} | Role: Support Agent
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content - SEAMLESS Customer Messages */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h2 className="text-lg font-semibold text-blue-900 mb-2">
                            🎯 Seamless Message Management
                        </h2>
                        <p className="text-blue-700">
                            Messages are automatically loaded and refreshed. No manual token handling needed!
                            Just login and everything works automatically. ✨
                        </p>
                    </div>

                    {/* Customer Messages Component - Automatically fetches with token */}
                    <CustomerMessagesInbox />
                </main>
            </div>
        </ProtectedRoute>
    )
}
