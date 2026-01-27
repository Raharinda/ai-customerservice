// app/agent/_components/shared/constants.js

/**
 * Status configurations for tickets
 */
export const STATUS_CONFIGS = {
    pending: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        label: 'pending',
    },
    'in-progress': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        label: 'in-progress',
    },
    resolved: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        label: 'resolved',
    },
    closed: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        label: 'closed',
    },
}

/**
 * Urgency configurations for AI analysis
 */
export const URGENCY_CONFIGS = {
    critical: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        stripColor: 'bg-red-500',
        label: 'CRITICAL',
        emoji: '🚨',
    },
    high: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
        stripColor: 'bg-orange-500',
        label: 'HIGH',
        emoji: '⚠️',
    },
    medium: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        stripColor: 'bg-yellow-500',
        label: 'MEDIUM',
        emoji: '⚡',
    },
    low: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        stripColor: 'bg-green-500',
        label: 'LOW',
        emoji: '✓',
    },
}

/**
 * AI analysis status configurations
 */
export const AI_STATUS_CONFIGS = {
    processing: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        stripColor: 'bg-blue-500',
        label: 'AI Analyzing...',
    },
    pending: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-300',
        stripColor: 'bg-purple-500',
        label: 'AI Pending',
    },
    error: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        stripColor: 'bg-red-500',
        label: 'AI Error',
    },
}

/**
 * Category prefixes for ticket numbers
 */
export const CATEGORY_PREFIXES = {
    'Technical Issue': 'T',
    'Billing & Payment': 'B',
    Other: 'G',
    'Account Access': 'S',
    'Feature Request': 'F',
}

/**
 * Filter options for ticket status
 */
export const STATUS_FILTERS = [
    'all',
    'pending',
    'in-progress',
    'resolved',
    'closed',
]

/**
 * Filter options for urgency
 */
export const URGENCY_FILTERS = ['all', 'critical', 'high', 'medium', 'low']
