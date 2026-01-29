// app/agent/_components/AgentRequestItem/index.jsx

import React from 'react'
import StatusBadge from './StatusBadge'
import TicketHeader from './TicketHeader'
import TicketFooter from './TicketFooter'
import AIAnalysisSection from './AIAnalysisSection'
import { URGENCY_CONFIGS, AI_STATUS_CONFIGS } from '@/utils/messageHelpers'

/**
 * Get strip color based on AI analysis status
 */
const getStripColor = (aiAnalysis) => {
    if (aiAnalysis?.status === 'done') {
        return URGENCY_CONFIGS[aiAnalysis.urgency]?.stripColor || 'bg-gray-400'
    }
    if (aiAnalysis?.status === 'processing') {
        return AI_STATUS_CONFIGS.processing.stripColor
    }
    if (aiAnalysis?.status === 'pending') {
        return AI_STATUS_CONFIGS.pending.stripColor
    }
    return 'bg-gray-400' // Default
}

/**
 * AgentRequestItem Component
 * Displays a ticket card with AI analysis in agent dashboard
 */
export default function AgentRequestItem({ request, onClick }) {
    const stripColor = getStripColor(request.aiAnalysis)

    return (
        <div
            onClick={() => onClick(request)}
            className='flex bg-white rounded-xl shadow border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-gray-300 transition-shadow'
        >
            {/* Strip Color - Based on AI Urgency */}
            <div className={`w-2 ${stripColor} shrink-0`} />

            {/* Content */}
            <div className='flex-1 p-4 space-y-3'>
                {/* Header with Status Badge */}
                <div className='flex justify-between items-start gap-3'>
                    <TicketHeader
                        subject={request.subject}
                        category={request.category}
                        createdAt={request.createdAt}
                        ticketId={request.ticketId}
                        customerName={request.customerName}
                    />
                    <StatusBadge
                        aiAnalysis={request.aiAnalysis}
                        ticketStatus={request.status}
                    />
                </div>

                {/* AI Analysis Results */}
                <AIAnalysisSection
                    ticketId={request.ticketId}
                    aiAnalysis={request.aiAnalysis}
                />

                {/* Footer */}
                <TicketFooter
                    category={request.category}
                    createdAt={request.createdAt}
                    status={request.status}
                />
            </div>
        </div>
    )
}
