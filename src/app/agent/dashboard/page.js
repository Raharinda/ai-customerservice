'use client'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import SearchBar from '../_components/SearchBar'
import AuthButton from '@/components/auth/AuthButton'
import Link from 'next/link'

import { useRouter } from 'next/navigation'
import { useTicketsData } from '@/hooks/agent/useTicketsData'
import { useTicketFilters } from '@/hooks/agent/useTicketFilters'

import {
    TicketsList,
    StatsCards,
    AIStatusInfo,
    TicketFilters,
} from '../_components/TicketDashboard'

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
    const { user, loading } = useAuth()
    const router = useRouter()

    // Fetch tickets data with real-time updates
    const { tickets, error } = useTicketsData()

    // Handle filtering
    const {
        filter,
        setFilter,
        urgencyFilter,
        setUrgencyFilter,
        urgencyCounts,
        filteredTickets,
    } = useTicketFilters(tickets)

    // Handle ticket click
    const handleViewTicket = (ticket) => {
        router.push(`/agent/tickets/${ticket.ticketId}`)
    }

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <p className='text-gray-600'>Memverifikasi akses...</p>
            </div>
        )
    }

    // Show error state if there's an error
    if (error) {
        return (
            <div className='text-center py-12 bg-red-50 rounded-lg'>
                <p className='text-red-600 text-lg'>
                    Error loading tickets: {error}
                </p>
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
                                <Link
                                    href='/'
                                    className='text-3xl font-bold text-gray-900'
                                >
                                    Support AI
                                </Link>
                                <p className='mt-1 text-sm text-gray-500'>
                                    Welcome, {user?.displayName || user?.email}{' '}
                                    | Support Agent
                                </p>
                            </div>

                            <AuthButton />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='p-4 mb-6'>
                        <SearchBar />
                    </div>

                    {/* Tickets Dashboard with AI Analysis */}
                    <div className='space-y-6'>
                        {/* Stats Cards */}
                        <StatsCards tickets={tickets} />

                        {/* AI Status Info */}
                        <AIStatusInfo tickets={tickets} />

                        {/* Filters */}
                        <TicketFilters
                            filter={filter}
                            setFilter={setFilter}
                            urgencyFilter={urgencyFilter}
                            setUrgencyFilter={setUrgencyFilter}
                            urgencyCounts={urgencyCounts}
                        />

                        {/* Tickets List */}
                        <TicketsList
                            loading={loading}
                            tickets={filteredTickets}
                            onTicketClick={handleViewTicket}
                        />
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    )
}
