// app/agent/_components/shared/TicketNumber.jsx

import { CATEGORY_PREFIXES } from './constants'

/**
 * Generate a unique ticket number based on category and creation date
 */
export const generateTicketNumber = (category, createdAt, ticketId) => {
    const date = new Date(createdAt)
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const random = (ticketId || '').slice(0, 2).toUpperCase()
    const prefix = CATEGORY_PREFIXES[category] || 'R'

    return `${prefix}-${year}${month}${random}`
}

/**
 * TicketNumber Component - Display formatted ticket number
 */
export default function TicketNumber({
    category,
    createdAt,
    ticketId,
    className = '',
}) {
    const ticketNumber = generateTicketNumber(category, createdAt, ticketId)

    return (
        <span className={`text-xs text-gray-500 ${className}`}>
            Ticket #{ticketNumber}
        </span>
    )
}
