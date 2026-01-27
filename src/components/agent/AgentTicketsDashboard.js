'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore'
import AgentRequestItem from '@/components/agent/AgentRequestItem'

/**
 * Agent Tickets Dashboard
 * Shows all tickets with AI analysis results
 */
export default function AgentTicketsDashboard() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, pending, in-progress, resolved
    const [urgencyFilter, setUrgencyFilter] = useState('all') // all, critical, high, medium, low
    const router = useRouter()

    useEffect(() => {
        console.log('🔄 Setting up real-time listener for all tickets (Agent view)...')

        // Create Firestore query - get ALL tickets for agent
        const ticketsRef = collection(db, 'tickets')
        
        // Listen for real-time updates
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

                console.log('✅ Real-time update: All tickets loaded:', allTickets.length)
                
                // Log AI analysis status WITH FULL DETAILS
                console.log('\n🤖 AI ANALYSIS STATUS SUMMARY:')
                allTickets.forEach(ticket => {
                    if (ticket.aiAnalysis) {
                        console.log(`📋 Ticket ${ticket.ticketId.slice(0, 8)}... (${ticket.subject}):`)
                        console.log(`   Status: ${ticket.aiAnalysis.status}`)
                        if (ticket.aiAnalysis.status === 'done') {
                            console.log(`   ✓ Urgency: ${ticket.aiAnalysis.urgency} (${ticket.aiAnalysis.urgencyScore})`)
                            console.log(`   ✓ Mood: ${ticket.aiAnalysis.mood}`)
                            console.log(`   ✓ Sentiment: ${ticket.aiAnalysis.sentiment}`)
                        } else if (ticket.aiAnalysis.status === 'error') {
                            console.log(`   ✗ Error: ${ticket.aiAnalysis.error}`)
                        }
                    } else {
                        console.log(`📋 Ticket ${ticket.ticketId.slice(0, 8)}... - NO AI ANALYSIS YET`)
                    }
                })
                console.log('\n')

                setTickets(allTickets)
                setLoading(false)
            },
            (err) => {
                console.error('❌ Real-time listener error:', err)
                setLoading(false)
            }
        )

        // Cleanup listener on unmount
        return () => unsubscribe()
    }, [])

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
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

    const handleViewTicket = (ticket) => {
        router.push(`/agent/tickets/${ticket.ticketId}`)
    }

    // Count tickets by urgency
    const urgencyCounts = {
        critical: tickets.filter(t => t.aiAnalysis?.urgency === 'critical').length,
        high: tickets.filter(t => t.aiAnalysis?.urgency === 'high').length,
        medium: tickets.filter(t => t.aiAnalysis?.urgency === 'medium').length,
        low: tickets.filter(t => t.aiAnalysis?.urgency === 'low').length,
    }

    const aiStatusCounts = {
        pending: tickets.filter(t => t.aiAnalysis?.status === 'pending').length,
        processing: tickets.filter(t => t.aiAnalysis?.status === 'processing').length,
        done: tickets.filter(t => t.aiAnalysis?.status === 'done').length,
        error: tickets.filter(t => t.aiAnalysis?.status === 'error').length,
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total Tickets */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600">Total Tickets</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{tickets.length}</p>
                </div>

                {/* Critical Urgency */}
                <div className="bg-red-50 p-4 rounded-lg shadow border border-red-200">
                    <h3 className="text-sm font-medium text-red-700">🚨 Critical</h3>
                    <p className="text-3xl font-bold text-red-900 mt-2">{urgencyCounts.critical}</p>
                </div>

                {/* High Urgency */}
                <div className="bg-orange-50 p-4 rounded-lg shadow border border-orange-200">
                    <h3 className="text-sm font-medium text-orange-700">⚠️ High</h3>
                    <p className="text-3xl font-bold text-orange-900 mt-2">{urgencyCounts.high}</p>
                </div>

                {/* AI Processing */}
                <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-200">
                    <h3 className="text-sm font-medium text-purple-700">🤖 AI Analyzed</h3>
                    <p className="text-3xl font-bold text-purple-900 mt-2">{aiStatusCounts.done}</p>
                </div>
            </div>

            {/* AI Status Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">🤖 AI Analysis Status</h3>
                <div className="flex gap-4 text-sm">
                    <span className="text-purple-700">⏳ Pending: {aiStatusCounts.pending}</span>
                    <span className="text-blue-700">🔄 Processing: {aiStatusCounts.processing}</span>
                    <span className="text-green-700">✅ Done: {aiStatusCounts.done}</span>
                    {aiStatusCounts.error > 0 && (
                        <span className="text-red-700">❌ Error: {aiStatusCounts.error}</span>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <div className="space-y-4">
                    {/* Status Filter */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Status</h3>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'pending', 'in-progress', 'resolved', 'closed'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        filter === status
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    {status === 'all' ? 'All' : status.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Urgency Filter */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by AI Urgency</h3>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setUrgencyFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    urgencyFilter === 'all'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                All Urgency
                            </button>
                            <button
                                onClick={() => setUrgencyFilter('critical')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    urgencyFilter === 'critical'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                            >
                                🚨 Critical ({urgencyCounts.critical})
                            </button>
                            <button
                                onClick={() => setUrgencyFilter('high')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    urgencyFilter === 'high'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                }`}
                            >
                                ⚠️ High ({urgencyCounts.high})
                            </button>
                            <button
                                onClick={() => setUrgencyFilter('medium')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    urgencyFilter === 'medium'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                            >
                                ⚡ Medium ({urgencyCounts.medium})
                            </button>
                            <button
                                onClick={() => setUrgencyFilter('low')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    urgencyFilter === 'low'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                                ✓ Low ({urgencyCounts.low})
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">
                        No tickets found with selected filters
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map(ticket => (
                        <AgentRequestItem
                            key={ticket.ticketId}
                            request={ticket}
                            onClick={handleViewTicket}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
