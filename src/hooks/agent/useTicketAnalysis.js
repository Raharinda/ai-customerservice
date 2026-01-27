// app/hooks/useTicketAnalysis.js

import { useState } from 'react'

/**
 * Custom hook for handling ticket re-analysis
 * @returns {Object} { reanalyzeTicket, isAnalyzing }
 */
export function useTicketAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    /**
     * Re-analyze a ticket with AI
     * @param {string} ticketId - Ticket ID to re-analyze
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    const reanalyzeTicket = async (ticketId, onSuccess, onError) => {
        if (isAnalyzing) return

        const confirmed = confirm(
            'Re-analyze this ticket with AI? This will update the analysis based on the full conversation.',
        )
        if (!confirmed) return

        setIsAnalyzing(true)

        try {
            console.log('🔄 Re-analyzing ticket:', ticketId)

            const response = await fetch(
                `/api/agent/tickets/${ticketId}/reanalyze`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )

            const data = await response.json()

            if (response.ok) {
                console.log('✅ Re-analysis triggered successfully')
                alert(
                    'Re-analysis started! The ticket will be updated shortly.',
                )
                onSuccess?.(data)
            } else {
                console.error('❌ Re-analysis failed:', data.error)
                alert(`Failed to start re-analysis: ${data.error}`)
                onError?.(data.error)
            }
        } catch (error) {
            console.error('❌ Error triggering re-analysis:', error)
            alert('Error triggering re-analysis. Please try again.')
            onError?.(error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    return {
        reanalyzeTicket,
        isAnalyzing,
    }
}
