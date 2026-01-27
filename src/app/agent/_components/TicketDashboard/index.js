'use client'

import { useRouter } from 'next/navigation'
import { useTicketsData } from '@/hooks/agent/useTicketsData'
import { useTicketFilters } from '@/hooks/agent/useTicketFilters'
import StatsCards from './StatsCards'
import AIStatusInfo from './AIStatusInfo'
import TicketFilters from './TicketFilters'
import TicketsList from './TicketsList'

import AgentRequestItem from '@/app/agent/_components/AgentRequestItem'

/**
 * Agent Tickets Dashboard
 * Shows all tickets with AI analysis results
 */
export default function AgentTicketsDashboard() {
    const router = useRouter()

    // Fetch tickets data with real-time updates
    const { tickets, loading, error } = useTicketsData()

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
    )
}
