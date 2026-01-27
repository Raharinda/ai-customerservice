// app/hooks/useTicketFilters.js

import { useState, useMemo } from 'react'

/**
 * Custom hook for managing ticket filters
 * @param {Array} tickets - Array of all tickets
 * @returns {Object} Filter state and filtered tickets
 */
export function useTicketFilters(tickets) {
    const [filter, setFilter] = useState('all')
    const [urgencyFilter, setUrgencyFilter] = useState('all')

    // Calculate urgency counts
    const urgencyCounts = useMemo(
        () => ({
            critical: tickets.filter(
                (t) => t.aiAnalysis?.urgency === 'critical',
            ).length,
            high: tickets.filter((t) => t.aiAnalysis?.urgency === 'high')
                .length,
            medium: tickets.filter((t) => t.aiAnalysis?.urgency === 'medium')
                .length,
            low: tickets.filter((t) => t.aiAnalysis?.urgency === 'low').length,
        }),
        [tickets],
    )

    // Filter tickets based on selected filters
    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            // Filter by status
            if (filter !== 'all' && ticket.status !== filter) {
                return false
            }

            // Filter by urgency (from AI analysis)
            if (urgencyFilter !== 'all') {
                if (!ticket.aiAnalysis || ticket.aiAnalysis.status !== 'done') {
                    return false
                }
                if (ticket.aiAnalysis.urgency !== urgencyFilter) {
                    return false
                }
            }

            return true
        })
    }, [tickets, filter, urgencyFilter])

    return {
        filter,
        setFilter,
        urgencyFilter,
        setUrgencyFilter,
        urgencyCounts,
        filteredTickets,
    }
}
