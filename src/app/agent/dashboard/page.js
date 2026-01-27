'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import SearchBar from '../_components/SearchBar'
import TicketsDashboard from '@/app/agent/_components/TicketDashboard'

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
    const { user, logout, loading } = useAuth()

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-gray-600'>Memverifikasi akses...</p>
            </div>
        )
    }

    return (
        <ProtectedRoute requiredRole='agent' unauthRedirect='/agent'>
            <div className='min-h-screen bg-gray-50'>
                {/* Header */}
                <header className='bg-white border-b border-gray-200 shadow-sm'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <div className='flex justify-between items-center py-6'>
                            <div>
                                <h1 className='text-3xl font-bold text-gray-900'>
                                    🤖 AI-Powered Agent Dashboard
                                </h1>
                                <p className='mt-1 text-sm text-gray-500'>
                                    Welcome, {user?.displayName || user?.email}{' '}
                                    | Support Agent
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

                {/* Main Content */}
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    {/* Info Banner */}
                    <div className='p-4 mb-6'>
                        <SearchBar />
                    </div>

                    {/* Tickets Dashboard with AI Analysis */}
                    <TicketsDashboard />
                </main>
            </div>
        </ProtectedRoute>
    )
}
