// app/hooks/useTicketsData.js

import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Custom hook for managing tickets data with real-time updates from Firestore
 * @returns {Object} { tickets, loading, error }
 */
export function useTicketsData() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        console.log(
            '🔄 Setting up real-time listener for all tickets (Agent view)...',
        )

        const ticketsRef = collection(db, 'tickets')

        const unsubscribe = onSnapshot(
            ticketsRef,
            (snapshot) => {
                const allTickets = snapshot.docs.map((doc) => ({
                    ticketId: doc.id,
                    ...doc.data(),
                }))

                // Sort by created date (newest first)
                allTickets.sort((a, b) => {
                    const dateA = new Date(a.createdAt)
                    const dateB = new Date(b.createdAt)
                    return dateB - dateA
                })

                console.log(
                    '✅ Real-time update: All tickets loaded:',
                    allTickets.length,
                )

                // Log AI analysis status with full details
                logAIAnalysisStatus(allTickets)

                setTickets(allTickets)
                setLoading(false)
                setError(null)
            },
            (err) => {
                console.error('❌ Real-time listener error:', err)
                setError(err.message)
                setLoading(false)
            },
        )

        // Cleanup listener on unmount
        return () => unsubscribe()
    }, [])

    return { tickets, loading, error }
}

/**
 * Log AI analysis status for debugging
 */
function logAIAnalysisStatus(tickets) {
    console.log('\n🤖 AI ANALYSIS STATUS SUMMARY:')

    tickets.forEach((ticket) => {
        if (ticket.aiAnalysis) {
            console.log(
                `📋 Ticket ${ticket.ticketId.slice(0, 8)}... (${ticket.subject}):`,
            )
            console.log(`   Status: ${ticket.aiAnalysis.status}`)

            if (ticket.aiAnalysis.status === 'done') {
                console.log(
                    `   ✓ Urgency: ${ticket.aiAnalysis.urgency} (${ticket.aiAnalysis.urgencyScore})`,
                )
                console.log(`   ✓ Mood: ${ticket.aiAnalysis.mood}`)
                console.log(`   ✓ Sentiment: ${ticket.aiAnalysis.sentiment}`)
            } else if (ticket.aiAnalysis.status === 'error') {
                console.log(`   ✗ Error: ${ticket.aiAnalysis.error}`)
            }
        } else {
            console.log(
                `📋 Ticket ${ticket.ticketId.slice(0, 8)}... - NO AI ANALYSIS YET`,
            )
        }
    })

    console.log('\n')
}
