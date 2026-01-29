// app/agent/_components/TicketsDashboard/TicketsList.jsx

import React from 'react'
import AgentRequestItem from '../AgentRequestItem'

/**
 * LoadingSpinner Component
 */
function LoadingSpinner() {
    return (
        <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
        </div>
    )
}

/**
 * EmptyState Component
 */
function EmptyState({ message = 'No tickets found with selected filters' }) {
    return (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
            <p className='text-gray-500 text-lg'>{message}</p>
        </div>
    )
}

/**
 * TicketsList Component
 * Displays list of tickets with loading and empty states
 */
export default function TicketsList({ loading, tickets, onTicketClick }) {
    if (loading) {
        return <LoadingSpinner />
    }

    if (tickets.length === 0) {
        return <EmptyState />
    }

    return (
        <div className='space-y-4'>
            {tickets.map((ticket) => (
                <AgentRequestItem
                    key={ticket.ticketId}
                    request={ticket}
                    onClick={onTicketClick}
                />
            ))}
        </div>
    )
}
