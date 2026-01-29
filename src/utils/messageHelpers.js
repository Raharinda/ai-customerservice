/**
 * ================================================
 * MESSAGE HELPER - Comprehensive Utility Functions
 * ================================================
 *
 * All formatting and configuration utilities in one place
 * Used across: Agent Dashboard, Customer Portal, Tickets
 */

// ============================================
// DATE & TIME FORMATTING
// ============================================

/**
 * Format waktu relatif (Indonesia)
 * Used by: RequestItem, MessageCard, TimeDisplay
 *
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted relative time
 */
export const formatDate = (isoString) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit yang lalu`
    if (diffHours < 24) return `${diffHours} jam yang lalu`
    if (diffDays < 7) return `${diffDays} hari yang lalu`

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

/**
 * Format ISO date string to relative time display in Indonesian
 * Alias for formatDate (backward compatibility)
 *
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted relative time
 */
export const formatTimeAgo = formatDate

/**
 * Format date for message timestamp
 * Used by: MessageDetail, ConversationView
 *
 * @param {string} isoString - ISO date string
 * @returns {string} Formatted time (HH:mm, DD MMM)
 */
export const formatMessageTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
    })
}

// ============================================
// TICKET NUMBER GENERATION
// ============================================

/**
 * Category prefixes for ticket numbers
 */
export const CATEGORY_PREFIXES = {
    'Technical Issue': 'T',
    Technical: 'T',
    'Billing & Payment': 'B',
    Billing: 'B',
    'Feature Request': 'F',
    Feature: 'F',
    'Account Access': 'A',
    General: 'G',
    Support: 'S',
    Bug: 'BG',
    Other: 'O',
}

/**
 * Generate ticket number dari category dan createdAt
 * Used by: RequestItem, MessageCard, TicketNumber component
 *
 * @param {string} category - Ticket category
 * @param {string} createdAt - ISO date string
 * @param {string} id - Ticket ID
 * @returns {string} Formatted ticket number (e.g., "T-2501AB")
 */
export const generateTicketNumber = (category, createdAt, id) => {
    const date = new Date(createdAt)
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = id ? id.slice(0, 2).toUpperCase() : 'XX'

    const prefix = CATEGORY_PREFIXES[category] || 'R'
    return `${prefix}-${year}${month}${random}`
}

// ============================================
// STATUS CONFIGURATIONS
// ============================================

/**
 * Status configurations for tickets
 * Used by: RequestItem, StatusBadge, TicketList
 */
export const STATUS_CONFIGS = {
    pending: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        label: 'pending',
        badge: 'bg-yellow-100 text-yellow-800',
    },
    open: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        label: 'open',
        badge: 'bg-blue-100 text-blue-800',
    },
    'in-progress': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        label: 'in-progress',
        badge: 'bg-purple-100 text-purple-800',
    },
    resolved: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        label: 'resolved',
        badge: 'bg-green-100 text-green-800',
    },
    closed: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        label: 'closed',
        badge: 'bg-gray-100 text-gray-800',
    },
}

/**
 * Get status configuration (bg, text, label, icon)
 * Used by: RequestItem
 *
 * @param {string} status - Ticket status
 * @param {object} icons - Optional icons object
 * @returns {object} Status configuration
 */
export const getStatusConfig = (status, icons = {}) => {
    const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.pending
    return {
        ...config,
        icon: icons[status] || icons.pending,
    }
}

/**
 * Get status color classes (simple version)
 * Used by: MessageCard, StatusBadge
 *
 * @param {string} status - Ticket status
 * @returns {string} Tailwind color classes
 */
export const getStatusColor = (status) => {
    const config = STATUS_CONFIGS[status] || STATUS_CONFIGS.pending
    return config.badge
}

// ============================================
// CATEGORY CONFIGURATIONS
// ============================================

/**
 * Get category color classes
 * Used by: MessageCard, CategoryBadge
 *
 * @param {string} category - Ticket category
 * @returns {string} Tailwind color classes
 */
export const getCategoryColor = (category) => {
    const colors = {
        'Technical Issue': 'bg-purple-100 text-purple-800',
        'Billing & Payment': 'bg-green-100 text-green-800',
        'Feature Request': 'bg-pink-100 text-pink-800',
        'Account Access': 'bg-yellow-100 text-yellow-800',
        Technical: 'bg-purple-100 text-purple-800',
        Billing: 'bg-green-100 text-green-800',
        Feature: 'bg-pink-100 text-pink-800',
        General: 'bg-blue-100 text-blue-800',
        Support: 'bg-indigo-100 text-indigo-800',
        Bug: 'bg-red-100 text-red-800',
        Other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || colors['Other']
}

// ============================================
// URGENCY CONFIGURATIONS (AI Analysis)
// ============================================

/**
 * Urgency configurations for AI analysis
 * Used by: AI Analysis Cards, Priority Indicators
 */
export const URGENCY_CONFIGS = {
    critical: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        stripColor: 'bg-red-500',
        label: 'CRITICAL',
    },
    high: {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
        stripColor: 'bg-orange-500',
        label: 'HIGH',
    },
    medium: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        stripColor: 'bg-yellow-500',
        label: 'MEDIUM',
    },
    low: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        stripColor: 'bg-green-500',
        label: 'LOW',
    },
}

/**
 * Get urgency configuration
 *
 * @param {string} urgency - Urgency level
 * @returns {object} Urgency configuration
 */
export const getUrgencyConfig = (urgency) => {
    return URGENCY_CONFIGS[urgency] || URGENCY_CONFIGS.medium
}

// ============================================
// AI ANALYSIS CONFIGURATIONS
// ============================================

/**
 * AI analysis status configurations
 * Used by: AI Analysis Components
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
    done: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        stripColor: 'bg-green-500',
        label: 'AI Complete',
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
 * Get AI status configuration
 *
 * @param {string} status - AI analysis status
 * @returns {object} AI status configuration
 */
export const getAIStatusConfig = (status) => {
    return AI_STATUS_CONFIGS[status] || AI_STATUS_CONFIGS.pending
}

// ============================================
// MESSAGE UTILITIES
// ============================================

/**
 * Get email from message object
 * Handle case "N/A" dari backend
 *
 * @param {object} msg - Message object
 * @returns {string} Email address or fallback
 */
export const getEmail = (msg) => {
    if (msg.customerEmail && msg.customerEmail !== 'N/A') {
        return msg.customerEmail
    }
    if (msg.senderEmail && msg.senderEmail !== 'N/A') {
        return msg.senderEmail
    }
    return 'Email tidak tersedia'
}

/**
 * Get display name from message object
 *
 * @param {object} msg - Message object
 * @returns {string} Display name or fallback
 */
export const getDisplayName = (msg) => {
    return msg.customerName || msg.senderName || 'Unknown User'
}

/**
 * Check if message is from system
 *
 * @param {object} message - Message object
 * @returns {boolean} True if system message
 */
export const isSystemMessage = (message) => {
    return (
        message.senderRole === 'system' ||
        message.type === 'status_change' ||
        message.senderId === 'system'
    )
}

/**
 * Check if message is from customer
 *
 * @param {object} message - Message object
 * @param {string} currentUserId - Current user ID (optional)
 * @returns {boolean} True if customer message
 */
export const isCustomerMessage = (message, currentUserId = null) => {
    return (
        message.sender === 'user' ||
        message.senderRole === 'customer' ||
        (currentUserId && message.senderId === currentUserId)
    )
}

/**
 * Check if message is from agent
 *
 * @param {object} message - Message object
 * @returns {boolean} True if agent message
 */
export const isAgentMessage = (message) => {
    return message.senderRole === 'agent' || message.sender === 'agent'
}

// ============================================
// FILTER OPTIONS
// ============================================

/**
 * Filter options for ticket status
 */
export const STATUS_FILTERS = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
]

/**
 * Filter options for urgency
 */
export const URGENCY_FILTERS = [
    { value: 'all', label: 'All Priority' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
]

// ============================================
// TICKET STATUS CHECKS
// ============================================

/**
 * Check if ticket is locked (resolved or closed)
 * Used by: Customer chat, Message input
 *
 * @param {string} status - Ticket status
 * @returns {boolean} True if ticket is locked
 */
export const isTicketLocked = (status) => {
    return status === 'resolved' || status === 'closed'
}

/**
 * Check if ticket is active (open or in-progress)
 *
 * @param {string} status - Ticket status
 * @returns {boolean} True if ticket is active
 */
export const isTicketActive = (status) => {
    return status === 'open' || status === 'in-progress'
}

/**
 * Check if ticket is resolvable (can be marked as resolved)
 *
 * @param {string} status - Ticket status
 * @returns {boolean} True if ticket can be resolved
 */
export const canResolveTicket = (status) => {
    return status === 'open' || status === 'in-progress'
}

/**
 * Check if ticket can be reopened
 *
 * @param {string} status - Ticket status
 * @returns {boolean} True if ticket can be reopened
 */
export const canReopenTicket = (status) => {
    return status === 'resolved'
}

/**
 * Check if ticket can be closed
 *
 * @param {string} status - Ticket status
 * @returns {boolean} True if ticket can be closed
 */
export const canCloseTicket = (status) => {
    return status === 'resolved'
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate status transition
 *
 * @param {string} currentStatus - Current ticket status
 * @param {string} newStatus - New ticket status
 * @returns {boolean} True if transition is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        open: ['in-progress', 'resolved'],
        'in-progress': ['open', 'resolved'],
        resolved: ['in-progress', 'closed'],
        closed: [], // Cannot transition from closed
    }

    return validTransitions[currentStatus]?.includes(newStatus) || false
}

// ============================================
// EXPORTS SUMMARY
// ============================================

/**
 * Available exports:
 *
 * Date & Time:
 * - formatDate(isoString)
 * - formatTimeAgo(isoString)
 * - formatMessageTime(isoString)
 *
 * Ticket Numbers:
 * - generateTicketNumber(category, createdAt, id)
 * - CATEGORY_PREFIXES
 *
 * Status:
 * - getStatusConfig(status, icons)
 * - getStatusColor(status)
 * - STATUS_CONFIGS
 * - STATUS_FILTERS
 *
 * Categories:
 * - getCategoryColor(category)
 *
 * Urgency/Priority:
 * - getUrgencyConfig(urgency)
 * - URGENCY_CONFIGS
 * - URGENCY_FILTERS
 *
 * AI Analysis:
 * - getAIStatusConfig(status)
 * - AI_STATUS_CONFIGS
 *
 * Messages:
 * - getEmail(msg)
 * - getDisplayName(msg)
 * - isSystemMessage(message)
 * - isCustomerMessage(message, currentUserId)
 * - isAgentMessage(message)
 *
 * Ticket Checks:
 * - isTicketLocked(status)
 * - isTicketActive(status)
 * - canResolveTicket(status)
 * - canReopenTicket(status)
 * - canCloseTicket(status)
 *
 * Validation:
 * - isValidStatusTransition(currentStatus, newStatus)
 */
