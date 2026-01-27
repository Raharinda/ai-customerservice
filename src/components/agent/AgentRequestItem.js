// components/agent/AgentRequestItem.jsx
import React from 'react'
import { FaCheck, FaRobot } from 'react-icons/fa6'
import { GrInProgress } from 'react-icons/gr'
import { IoMdClose } from 'react-icons/io'
import { IoTimeOutline } from 'react-icons/io5'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { MdPriorityHigh } from 'react-icons/md'

export default function AgentRequestItem({ request, onClick }) {
    const formatTimeAgo = (isoString) => {
        const date = new Date(isoString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins} menit yang lalu`
        if (diffHours < 24) return `${diffHours} jam yang lalu`
        if (diffDays < 7) return `${diffDays} hari yang lalu`

        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                bg: 'bg-yellow-50',
                text: 'text-yellow-700',
                label: 'pending',
                icon: <IoTimeOutline />,
            },
            'in-progress': {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                label: 'in-progress',
                icon: <GrInProgress />,
            },
            resolved: {
                bg: 'bg-green-50',
                text: 'text-green-700',
                label: 'resolved',
                icon: <FaCheck />,
            },
            closed: {
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                label: 'closed',
                icon: <IoMdClose />,
            },
        }
        return configs[status] || configs.pending
    }

    // ✅ AI Analysis Status Config - UNIFIED BADGE
    const getUnifiedStatusBadge = () => {
        const aiAnalysis = request.aiAnalysis
        
        // Priority 1: If AI is done, show urgency-based status
        if (aiAnalysis?.status === 'done') {
            const urgencyConfig = {
                critical: {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    border: 'border-red-300',
                    label: `🚨 CRITICAL (${aiAnalysis.urgencyScore})`,
                    icon: <MdPriorityHigh className="text-red-600" />,
                },
                high: {
                    bg: 'bg-orange-100',
                    text: 'text-orange-800',
                    border: 'border-orange-300',
                    label: `⚠️ HIGH (${aiAnalysis.urgencyScore})`,
                    icon: <MdPriorityHigh className="text-orange-600" />,
                },
                medium: {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    border: 'border-yellow-300',
                    label: `⚡ MEDIUM (${aiAnalysis.urgencyScore})`,
                    icon: <IoTimeOutline className="text-yellow-600" />,
                },
                low: {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    border: 'border-green-300',
                    label: `✓ LOW (${aiAnalysis.urgencyScore})`,
                    icon: <FaCheck className="text-green-600" />,
                },
            }
            return urgencyConfig[aiAnalysis.urgency] || urgencyConfig.medium
        }
        
        // Priority 2: AI is processing
        if (aiAnalysis?.status === 'processing') {
            return {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                border: 'border-blue-300',
                label: 'AI Analyzing...',
                icon: <AiOutlineLoading3Quarters className="animate-spin text-blue-600" />,
            }
        }
        
        // Priority 3: AI pending
        if (aiAnalysis?.status === 'pending') {
            return {
                bg: 'bg-purple-100',
                text: 'text-purple-800',
                border: 'border-purple-300',
                label: 'AI Pending',
                icon: <FaRobot className="text-purple-600" />,
            }
        }
        
        // Priority 4: AI error
        if (aiAnalysis?.status === 'error') {
            return {
                bg: 'bg-red-100',
                text: 'text-red-800',
                border: 'border-red-300',
                label: 'AI Error',
                icon: <IoMdClose className="text-red-600" />,
            }
        }
        
        // Default: Show ticket status
        return getStatusConfig(request.status)
    }

    const getUrgencyBadge = (urgency, score) => {
        const urgencyColors = {
            critical: 'bg-red-100 text-red-800 border-red-300',
            high: 'bg-orange-100 text-orange-800 border-orange-300',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            low: 'bg-green-100 text-green-800 border-green-300',
        }

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${urgencyColors[urgency] || urgencyColors.medium} flex items-center gap-1`}>
                <MdPriorityHigh />
                {urgency?.toUpperCase()} ({score})
            </span>
        )
    }

    const generateTicketNumber = (category, createdAt) => {
        const categoryPrefix = {
            'Technical Issue': 'T',
            'Billing & Payment': 'B',
            'Other': 'G',
            'Account Access': 'S',
            'Feature Request': 'F',
        }

        const date = new Date(createdAt)
        const year = date.getFullYear().toString().slice(-2)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const random = (request.ticketId || request.id).slice(0, 2).toUpperCase()

        const prefix = categoryPrefix[category] || 'R'
        return `${prefix}-${year}${month}${random}`
    }

    const statusConfig = getStatusConfig(request.status)
    const unifiedBadge = getUnifiedStatusBadge()

    // Tentukan warna strip berdasarkan urgency AI
    const getStripColor = () => {
        const aiAnalysis = request.aiAnalysis
        if (aiAnalysis?.status === 'done') {
            if (aiAnalysis.urgency === 'critical') return 'bg-red-500'
            if (aiAnalysis.urgency === 'high') return 'bg-orange-500'
            if (aiAnalysis.urgency === 'medium') return 'bg-yellow-500'
            if (aiAnalysis.urgency === 'low') return 'bg-green-500'
        }
        if (aiAnalysis?.status === 'processing') return 'bg-blue-500'
        if (aiAnalysis?.status === 'pending') return 'bg-purple-500'
        return 'bg-gray-400' // Default
    }

    return (
        <div
            onClick={() => onClick(request)}
            className='flex bg-white rounded-xl shadow border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-gray-300 transition-shadow'
        >
            {/* Strip Color - Based on AI Urgency */}
            <div className={`w-1.5 ${getStripColor()}`}></div>

            {/* Content */}
            <div className='flex flex-col p-4 flex-1 space-y-3'>
                {/* Header */}
                <div className='flex justify-between items-start gap-3'>
                    <div className='flex-1'>
                        <h3 className='font-semibold text-lg text-gray-900 mb-1'>
                            {request.subject}
                        </h3>
                        <p className='text-sm text-gray-500'>
                            Ticket #
                            {generateTicketNumber(
                                request.category,
                                request.createdAt,
                            )}
                        </p>
                        <p className='text-xs text-gray-400 mt-1'>
                            Customer: {request.customerName}
                        </p>
                    </div>
                    
                    {/* ✅ UNIFIED BADGE - Shows AI urgency or processing status */}
                    <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold ${unifiedBadge.bg} ${unifiedBadge.text} border-2 ${unifiedBadge.border} flex items-center gap-1.5 whitespace-nowrap shadow-sm`}
                    >
                        <span>{unifiedBadge.icon}</span>
                        {unifiedBadge.label}
                    </span>
                </div>

                {/* ✅ AI Analysis Results (ONLY SHOW IF DONE) */}
                {request.aiAnalysis?.status === 'done' && (
                    <div className='bg-linear-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 space-y-2'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <FaRobot className="text-purple-600 text-lg" />
                                <span className='text-sm font-semibold text-purple-900'>AI Analysis Results</span>
                                {request.aiAnalysis.reprocessCount > 0 && (
                                    <span className='text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                                        Re-analyzed {request.aiAnalysis.reprocessCount}x
                                    </span>
                                )}
                            </div>
                            {/* ✅ Re-analyze button (Tugas 2) */}
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation(); // Prevent ticket card click
                                    
                                    if (!confirm('Re-analyze this ticket with AI? This will update the analysis based on the full conversation.')) {
                                        return;
                                    }
                                    
                                    try {
                                        console.log('🔄 Re-analyzing ticket:', request.ticketId);
                                        
                                        const response = await fetch(`/api/agent/tickets/${request.ticketId}/reanalyze`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                        });
                                        
                                        const data = await response.json();
                                        
                                        if (response.ok) {
                                            console.log('✅ Re-analysis triggered successfully');
                                            alert('Re-analysis started! The ticket will be updated shortly.');
                                        } else {
                                            console.error('❌ Re-analysis failed:', data.error);
                                            alert(`Failed to start re-analysis: ${data.error}`);
                                        }
                                    } catch (error) {
                                        console.error('❌ Error triggering re-analysis:', error);
                                        alert('Error triggering re-analysis. Please try again.');
                                    }
                                }}
                                className='text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg transition-colors flex items-center gap-1'
                                title='Re-analyze with full conversation context'
                            >
                                <FaRobot className="text-sm" />
                                Re-analyze
                            </button>
                        </div>
                        
                        {/* Mood & Sentiment Row */}
                        <div className='flex flex-wrap gap-3 items-center text-xs'>
                            {request.aiAnalysis.mood && (
                                <div className='flex items-center gap-1'>
                                    <span className='text-gray-600'>Mood:</span>
                                    <span className='font-medium text-gray-800 capitalize bg-white px-2 py-0.5 rounded-full border'>
                                        {request.aiAnalysis.mood}
                                    </span>
                                </div>
                            )}
                            
                            {request.aiAnalysis.sentiment && (
                                <div className='flex items-center gap-1'>
                                    <span className='text-gray-600'>Sentiment:</span>
                                    <span className={`font-medium capitalize px-2 py-0.5 rounded-full border ${
                                        request.aiAnalysis.sentiment === 'negative' ? 'bg-red-50 text-red-700 border-red-200' :
                                        request.aiAnalysis.sentiment === 'positive' ? 'bg-green-50 text-green-700 border-green-200' :
                                        'bg-gray-50 text-gray-700 border-gray-200'
                                    }`}>
                                        {request.aiAnalysis.sentiment}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {/* Summary */}
                        {request.aiAnalysis.summary && (
                            <div className='bg-white/70 p-2 rounded border border-purple-100'>
                                <p className='text-xs text-gray-700 italic'>
                                    📝 <strong>Summary:</strong> {request.aiAnalysis.summary}
                                </p>
                            </div>
                        )}
                        
                        {/* Suggested Reply */}
                        {request.aiAnalysis.suggestedResponse && (
                            <div className='bg-blue-50/50 p-2 rounded border border-blue-100'>
                                <p className='text-xs text-gray-700'>
                                    💬 <strong>Suggested Reply:</strong> {request.aiAnalysis.suggestedResponse}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className='flex justify-between items-center text-xs'>
                    <span className='inline-block py-1 px-3 border border-gray-300 rounded-lg bg-gray-50'>
                        <span className='capitalize'>{request.category}</span>
                    </span>
                    <span className='flex items-center gap-1 text-gray-500'>
                        <IoTimeOutline />
                        {formatTimeAgo(request.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    )
}
