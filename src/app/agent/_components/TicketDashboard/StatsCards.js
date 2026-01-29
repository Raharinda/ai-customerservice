// app/agent/_components/TicketsDashboard/StatsCards.jsx

import React from 'react'

/**
 * StatsCards Component
 * Displays overview statistics cards
 */
export default function StatsCards({ tickets }) {
    const urgencyCounts = {
        critical: tickets.filter((t) => t.aiAnalysis?.urgency === 'critical')
            .length,
        high: tickets.filter((t) => t.aiAnalysis?.urgency === 'high').length,
        medium: tickets.filter((t) => t.aiAnalysis?.urgency === 'medium')
            .length,
        low: tickets.filter((t) => t.aiAnalysis?.urgency === 'low').length,
    }

    const aiStatusCounts = {
        pending: tickets.filter((t) => t.aiAnalysis?.status === 'pending')
            .length,
        processing: tickets.filter((t) => t.aiAnalysis?.status === 'processing')
            .length,
        done: tickets.filter((t) => t.aiAnalysis?.status === 'done').length,
        error: tickets.filter((t) => t.aiAnalysis?.status === 'error').length,
    }

    return (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {/* Total Tickets */}
            <div className='bg-white p-4 rounded-lg shadow border border-gray-200'>
                <h3 className='text-sm font-medium text-gray-600'>
                    Total Tickets
                </h3>
                <p className='text-3xl font-bold text-gray-900 mt-2'>
                    {tickets.length}
                </p>
            </div>

            {/* Critical Urgency */}
            <div className='bg-red-50 p-4 rounded-lg shadow border border-red-200'>
                <h3 className='text-sm font-medium text-red-700'>Critical</h3>
                <p className='text-3xl font-bold text-red-900 mt-2'>
                    {urgencyCounts.critical}
                </p>
            </div>

            {/* High Urgency */}
            <div className='bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200'>
                <h3 className='text-sm font-medium text-orange-700'>High</h3>
                <p className='text-3xl font-bold text-orange-900 mt-2'>
                    {urgencyCounts.high}
                </p>
            </div>

            {/* AI Processing */}
            <div className='bg-blue-50 p-4 rounded-lg shadow border border-blue-200'>
                <h3 className='text-sm font-medium text-purple-700'>
                    AI Analyzed
                </h3>
                <p className='text-3xl font-bold text-purple-900 mt-2'>
                    {aiStatusCounts.done}
                </p>
            </div>
        </div>
    )
}
