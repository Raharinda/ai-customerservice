'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AgentTicketsDashboard from '@/components/agent/AgentTicketsDashboard'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Agent Dashboard - AI-Powered Ticket Management
 * 
 * ✅ Real-time ticket updates
 * ✅ AI Analysis results for each ticket
 * ✅ Filter by urgency (critical/high/medium/low)
 * ✅ Filter by status (pending/in-progress/resolved)
 * ✅ Protected route (only agents can access)
 * 
 * HOW IT WORKS:
 * 1. Agent login
 * 2. Dashboard shows all tickets with AI analysis
 * 3. Real-time updates via Firestore listener
 * 4. AI analysis status: pending → processing → done
 * 5. Urgency-based prioritization for agents
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
        <ProtectedRoute requiredRole="agent">
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    🤖 AI-Powered Agent Dashboard
                                </h1>
                                <p className="mt-1 text-sm text-gray-500">
                                    Welcome, {user?.displayName || user?.email} | Support Agent
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

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Info Banner */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                        <h2 className="text-lg font-semibold text-purple-900 mb-2 flex items-center gap-2">
                            <span className="text-2xl">🎯</span>
                            AI-Assisted Ticket Management
                        </h2>
                        <p className="text-purple-700 text-sm">
                            Every ticket is automatically analyzed by AI to provide:
                            <span className="font-semibold"> Urgency Score, Customer Mood, Sentiment Analysis, Summary</span>, and 
                            <span className="font-semibold"> Suggested Reply</span>. 
                            Real-time updates keep you informed as tickets come in!
                        </p>
                    </div>

                    {/* Tickets Dashboard with AI Analysis */}
                    <AgentTicketsDashboard />
                </main>
            </div>
        </ProtectedRoute>
    )
}
