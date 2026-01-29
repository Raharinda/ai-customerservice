// app/agent/_components/AgentRequestItem/StatusBadge.jsx
import React from 'react'
import { FaCheck, FaRobot } from 'react-icons/fa6'
import { GrInProgress } from 'react-icons/gr'
import { IoMdClose } from 'react-icons/io'
import { IoTimeOutline } from 'react-icons/io5'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { MdPriorityHigh } from 'react-icons/md'
import {
    STATUS_CONFIGS,
    URGENCY_CONFIGS,
    AI_STATUS_CONFIGS,
} from '@/utils/messageHelpers'

/**
 * Get status icon based on ticket status
 */
const getStatusIcon = (status) => {
    const icons = {
        pending: <IoTimeOutline className='w-4 h-4' />,
        open: <IoTimeOutline className='w-4 h-4' />,
        'in-progress': <GrInProgress className='w-4 h-4' />,
        resolved: <FaCheck className='w-4 h-4' />,
        closed: <IoMdClose className='w-4 h-4' />,
    }
    return icons[status] || icons.pending
}

/**
 * Get unified badge configuration based on AI analysis and ticket status
 */
const getUnifiedBadgeConfig = (aiAnalysis, ticketStatus) => {
    // Priority 1: If AI is done, show urgency-based status
    if (aiAnalysis?.status === 'done') {
        const urgency = aiAnalysis.urgency
        const config = URGENCY_CONFIGS[urgency] || URGENCY_CONFIGS.medium
        return {
            ...config,
            label: `${config.emoji} ${config.label} (${aiAnalysis.urgencyScore})`,
            icon: <MdPriorityHigh className='w-4 h-4' />,
        }
    }

    // Priority 2: AI is processing
    if (aiAnalysis?.status === 'processing') {
        return {
            ...AI_STATUS_CONFIGS.processing,
            icon: (
                <AiOutlineLoading3Quarters className='w-4 h-4 animate-spin' />
            ),
        }
    }

    // Priority 3: AI pending
    if (aiAnalysis?.status === 'pending') {
        return {
            ...AI_STATUS_CONFIGS.pending,
            icon: <FaRobot className='w-4 h-4' />,
        }
    }

    // Priority 4: AI error
    if (aiAnalysis?.status === 'error') {
        return {
            ...AI_STATUS_CONFIGS.error,
            icon: <IoMdClose className='w-4 h-4' />,
        }
    }

    // Default: Show ticket status
    const statusConfig = STATUS_CONFIGS[ticketStatus] || STATUS_CONFIGS.pending
    return {
        ...statusConfig,
        label: statusConfig.label,
        icon: getStatusIcon(ticketStatus),
    }
}

/**
 * StatusBadge Component
 * Displays unified status badge showing AI urgency or processing status
 */
export default function StatusBadge({ aiAnalysis, ticketStatus }) {
    const badge = getUnifiedBadgeConfig(aiAnalysis, ticketStatus)
    return (
        <span
            className={`${badge.bg} ${badge.text} border ${badge.border} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}
        >
            {badge.icon}
            {badge.label}
        </span>
    )
}
