/**
 * Format waktu relatif (Indonesia)
 * Digunakan oleh: RequestItem, MessageCard
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
 * Generate ticket number dari category dan createdAt
 * Digunakan oleh: RequestItem, MessageCard
 */
export const generateTicketNumber = (category, createdAt, id) => {
    const categoryPrefix = {
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

    const date = new Date(createdAt)
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = id ? id.slice(0, 2).toUpperCase() : 'XX'

    const prefix = categoryPrefix[category] || 'R'
    return `${prefix}-${year}${month}${random}`
}

/**
 * Mendapatkan konfigurasi status (bg, text, label, icon)
 * Digunakan oleh: RequestItem
 */
export const getStatusConfig = (status, icons = {}) => {
    const configs = {
        pending: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            label: 'pending',
            icon: icons.pending,
        },
        'in-progress': {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            label: 'in-progress',
            icon: icons.inProgress,
        },
        resolved: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            label: 'resolved',
            icon: icons.resolved,
        },
        closed: {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            label: 'closed',
            icon: icons.closed,
        },
        open: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            label: 'open',
            icon: icons.open,
        },
    }
    return configs[status] || configs.pending
}

/**
 * Mendapatkan konfigurasi warna untuk kategori ticket
 * Digunakan oleh: MessageCard
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

/**
 * Mendapatkan konfigurasi warna untuk status ticket (simple version)
 * Digunakan oleh: MessageCard
 */
export const getStatusColor = (status) => {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        open: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-purple-100 text-purple-800',
        resolved: 'bg-green-100 text-green-800',
        closed: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || colors.pending
}

/**
 * Mendapatkan email dari message object
 * Handle case "N/A" dari backend
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
 * Mendapatkan nama dari message object
 */
export const getDisplayName = (msg) => {
    return msg.customerName || msg.senderName || 'Unknown User'
}
