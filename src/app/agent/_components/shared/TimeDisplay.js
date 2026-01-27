// app/agent/_components/shared/TimeDisplay.jsx

/**
 * Format ISO date string to relative time display in Indonesian
 */
export const formatTimeAgo = (isoString) => {
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

/**
 * TimeDisplay Component - Display relative time
 */
export default function TimeDisplay({ timestamp, className = '' }) {
    return (
        <span className={`text-xs text-gray-500 ${className}`}>
            {formatTimeAgo(timestamp)}
        </span>
    )
}
