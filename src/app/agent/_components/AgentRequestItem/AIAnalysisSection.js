// app/agent/_components/AgentRequestItem/AIAnalysisSection.jsx
import React from 'react'
import { FaRobot } from 'react-icons/fa6'
import { useTicketAnalysis } from '@/hooks/agent/useTicketAnalysis'

/**
 * AIAnalysisSection Component
 * Displays AI analysis results with ticket subject
 */
export default function AIAnalysisSection({ ticketId, subject, aiAnalysis }) {
    const { reanalyzeTicket, isAnalyzing } = useTicketAnalysis()

    // Only show if analysis is done
    if (!aiAnalysis || aiAnalysis.status !== 'done') {
        return null
    }

    const handleReanalyze = (e) => {
        e.stopPropagation() // Prevent ticket card click
        reanalyzeTicket(ticketId)
    }

    return (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <h4 className='text-sm font-semibold text-blue-900 flex items-center gap-2'>
                    <FaRobot className='w-4 h-4' />
                    AI Analysis Results
                    {aiAnalysis.reprocessCount > 0 && (
                        <span className='text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded'>
                            Re-analyzed {aiAnalysis.reprocessCount}x
                        </span>
                    )}
                </h4>

                {/* Re-analyze Button */}
                <button
                    onClick={handleReanalyze}
                    disabled={isAnalyzing}
                    className='text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed'
                    title='Re-analyze with full conversation context'
                >
                    <FaRobot className='w-3 h-3' />
                    {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
                </button>
            </div>

            {/* Mood & Sentiment */}
            {(aiAnalysis.mood || aiAnalysis.sentiment) && (
                <div className='flex gap-3 text-sm'>
                    {aiAnalysis.mood && (
                        <div className='flex items-center gap-1'>
                            <span className='text-gray-600'>Mood:</span>
                            <span className='text-blue-700 font-medium capitalize'>
                                {aiAnalysis.mood}
                            </span>
                        </div>
                    )}
                    {aiAnalysis.sentiment && (
                        <div className='flex items-center gap-1'>
                            <span className='text-gray-600'>Sentiment:</span>
                            <span className='text-blue-700 font-medium capitalize'>
                                {aiAnalysis.sentiment}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Summary */}
            {aiAnalysis.summary && (
                <div className='text-sm'>
                    <span className='text-gray-600 font-medium'>Summary:</span>
                    <p className='text-gray-800 mt-1'>{aiAnalysis.summary}</p>
                </div>
            )}
        </div>
    )
}
