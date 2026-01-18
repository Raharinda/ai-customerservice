'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Support Agent Dashboard
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Welcome, {user?.displayName || user?.email}
                                </p>
                            </div>
                            <button
                                onClick={logout}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>

                        <div className="border-t pt-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h2 className="text-lg font-semibold text-blue-900 mb-2">
                                    🎯 Agent Tools
                                </h2>
                                <p className="text-blue-700">
                                    Access AI-powered tools to analyze
                                    conversations, classify issues, understand
                                    customer sentiment, and get intelligent
                                    response suggestions.
                                </p>
                            </div>

                            <h2 className="text-xl font-semibold mb-4">
                                Account Information
                            </h2>
                            <div className="space-y-2">
                                <p>
                                    <span className="font-medium">Name:</span>{' '}
                                    {user?.displayName || user?.email}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span>{' '}
                                    {user?.email}
                                </p>
                                <p>
                                    <span className="font-medium">Role:</span>{' '}
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Support Agent
                                    </span>
                                </p>
                                <p>
                                    <span className="font-medium">
                                        User ID:
                                    </span>{' '}
                                    {user?.uid}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
