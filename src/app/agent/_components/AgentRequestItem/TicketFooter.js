// app/agent/_components/AgentRequestItem/TicketFooter.jsx

import React from 'react'
import TimeDisplay from '../shared/TimeDisplay'

/**
 * TicketFooter Component
 * Displays ticket category and creation time
 */
export default function TicketFooter({ category, createdAt }) {
    return (
        <div className='flex items-center gap-2 text-xs text-gray-500'>
            <span className='bg-gray-100 px-2 py-1 rounded'>{category}</span>
            <span>•</span>
            <TimeDisplay timestamp={createdAt} />
        </div>
    )
}
