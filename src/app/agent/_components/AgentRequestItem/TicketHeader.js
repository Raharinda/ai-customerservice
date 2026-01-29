// app/agent/_components/AgentRequestItem/TicketHeader.jsx
import React from 'react'
import { generateTicketNumber } from '@/utils/messageHelpers'

/**
 * TicketHeader Component
 * Displays ticket subject, number, and customer name
 */
export default function TicketHeader({
    subject,
    category,
    createdAt,
    ticketId,
    customerName,
}) {
    const ticketNumber = generateTicketNumber(category, createdAt, ticketId)

    return (
        <div className='space-y-1'>
            <h3 className='font-semibold text-gray-900 text-base line-clamp-1'>
                {subject}
            </h3>
            <div className='flex items-center gap-2 flex-wrap'>
                <span className='text-xs text-gray-500'>
                    Ticket #{ticketNumber}
                </span>
                <span className='text-xs text-gray-500'>•</span>
                <span className='text-xs text-gray-600'>
                    Customer: {customerName}
                </span>
            </div>
        </div>
    )
}
