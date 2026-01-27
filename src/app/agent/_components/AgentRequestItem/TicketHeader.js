// app/agent/_components/AgentRequestItem/TicketHeader.jsx

import React from 'react'
import TicketNumber from '../shared/TicketNumber'

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
    return (
        <div className='space-y-1'>
            <h3 className='font-semibold text-gray-900 text-base line-clamp-1'>
                {subject}
            </h3>
            <div className='flex items-center gap-2 flex-wrap'>
                <TicketNumber
                    category={category}
                    createdAt={createdAt}
                    ticketId={ticketId}
                />
                <span className='text-xs text-gray-500'>•</span>
                <span className='text-xs text-gray-600'>
                    Customer: {customerName}
                </span>
            </div>
        </div>
    )
}
