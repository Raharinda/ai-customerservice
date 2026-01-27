// app/agent/_components/TicketsDashboard/AIStatusInfo.jsx

import React from 'react'

/**
 * AIStatusInfo Component
 * Displays AI analysis status breakdown
 */
export default function AIStatusInfo({ tickets }) {
    const aiStatusCounts = {
        pending: tickets.filter((t) => t.aiAnalysis?.status === 'pending')
            .length,
        processing: tickets.filter((t) => t.aiAnalysis?.status === 'processing')
            .length,
        done: tickets.filter((t) => t.aiAnalysis?.status === 'done').length,
        error: tickets.filter((t) => t.aiAnalysis?.status === 'error').length,
    }

    return (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h3 className='text-sm font-semibold text-blue-900 mb-2'>
                🤖 AI Analysis Status
            </h3>
            <div className='flex gap-4 text-sm'>
                <span className='text-purple-700'>
                    ⏳ Pending: {aiStatusCounts.pending}
                </span>
                <span className='text-blue-700'>
                    🔄 Processing: {aiStatusCounts.processing}
                </span>
                <span className='text-green-700'>
                    ✅ Done: {aiStatusCounts.done}
                </span>
                {aiStatusCounts.error > 0 && (
                    <span className='text-red-700'>
                        ❌ Error: {aiStatusCounts.error}
                    </span>
                )}
            </div>
        </div>
    )
}
