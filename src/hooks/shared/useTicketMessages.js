'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Enhanced Hook untuk fetch messages dari ticket tertentu
 * Support auto-refresh, real-time updates, dan CONTEXTUAL AI ANALYSIS
 *
 * NEW FEATURES:
 * - Auto-deteksi pesan baru dari customer
 * - Auto-trigger reanalysis saat customer mengirim pesan baru
 * - Flexible AI analysis yang berubah sesuai konteks percakapan
 */
export function useTicketMessages(ticketId, options = {}) {
    const [messages, setMessages] = useState([])
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sending, setSending] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const { user, getIdToken } = useAuth()

    const {
        autoRefresh = false,
        refreshInterval = 10000, // 10 seconds
        autoAnalyzeOnNewMessage = true, // 🆕 Auto-analyze when customer sends new message
        analyzeDelay = 3000, // 🆕 Wait 3 seconds before triggering analysis
    } = options

    // 🆕 Track last customer message to detect new messages
    const lastCustomerMessageRef = useRef(null)
    const analyzeTimeoutRef = useRef(null)

    // 🆕 Trigger re-analysis using existing endpoint
    const triggerReanalysis = useCallback(
        async (silent = false) => {
            if (!ticketId) return

            // Prevent multiple simultaneous analyses
            if (analyzing) {
                console.log('⏳ Analysis already in progress, skipping...')
                return
            }

            // Show confirmation for manual trigger
            if (!silent) {
                const confirmed = confirm(
                    'Re-analyze this ticket with AI? This will update the analysis based on the full conversation.',
                )
                if (!confirmed) return
            }

            setAnalyzing(true)

            try {
                const token = await getIdToken()

                console.log(
                    `🔄 Triggering contextual AI re-analysis for: ${ticketId}`,
                )

                const response = await fetch(
                    `/api/agent/tickets/${ticketId}/reanalyze`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    },
                )

                const data = await response.json()

                if (response.ok) {
                    console.log('✅ Re-analysis triggered successfully!')
                    console.log(
                        `📊 Analyzing ${data.data.messageCount} messages`,
                    )

                    if (!silent) {
                        alert(
                            'AI is analyzing the full conversation. Results will update shortly...',
                        )
                    }

                    // Wait for AI to process (adjust timing based on your worker speed)
                    setTimeout(async () => {
                        console.log(
                            '🔄 Refreshing to get updated AI analysis...',
                        )
                        await fetchMessages(true)
                        setAnalyzing(false)
                    }, 4000) // 4 seconds - adjust based on your AI worker speed
                } else {
                    console.error('❌ Re-analysis failed:', data.error)
                    if (!silent) {
                        alert(`Failed to trigger re-analysis: ${data.error}`)
                    }
                    setAnalyzing(false)
                }
            } catch (err) {
                console.error('❌ Error triggering re-analysis:', err)
                if (!silent) {
                    alert('Error triggering re-analysis. Please try again.')
                }
                setAnalyzing(false)
            }
        },
        [ticketId, analyzing, getIdToken],
    )

    // Fetch messages
    const fetchMessages = useCallback(
        async (silent = false) => {
            if (!ticketId) {
                setLoading(false)
                return
            }

            if (!silent) setLoading(true)

            try {
                console.log(`Fetching messages for ticket: ${ticketId}`)

                const response = await fetch(
                    `/api/tickets/${ticketId}/messages`,
                )

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(
                        errorData.error || 'Failed to fetch messages',
                    )
                }

                const data = await response.json()

                if (data.success) {
                    const newMessages = data.data.messages || []
                    const newTicket = data.data.ticket || null

                    setMessages(newMessages)
                    setTicket(newTicket)
                    setError(null)

                    // 🆕 DETECT NEW CUSTOMER MESSAGES
                    if (autoAnalyzeOnNewMessage && newMessages.length > 0) {
                        const customerMessages = newMessages.filter(
                            (m) => m.senderRole === 'customer',
                        )

                        if (customerMessages.length > 0) {
                            const latestCustomerMsg =
                                customerMessages[customerMessages.length - 1]

                            // Check if this is a NEW customer message
                            const isNewMessage =
                                lastCustomerMessageRef.current &&
                                lastCustomerMessageRef.current !==
                                    latestCustomerMsg.messageId

                            if (isNewMessage) {
                                console.log(
                                    '🔔 NEW CUSTOMER MESSAGE DETECTED!',
                                    latestCustomerMsg.messageId,
                                )
                                console.log(
                                    '📝 Message:',
                                    latestCustomerMsg.message,
                                )

                                // Clear any pending analysis
                                if (analyzeTimeoutRef.current) {
                                    clearTimeout(analyzeTimeoutRef.current)
                                }

                                // Schedule auto-analysis after delay
                                analyzeTimeoutRef.current = setTimeout(() => {
                                    console.log(
                                        '🤖 AUTO-TRIGGERING CONTEXTUAL AI ANALYSIS...',
                                    )
                                    triggerReanalysis(true) // silent = true
                                }, analyzeDelay)
                            }

                            // Update last customer message reference
                            lastCustomerMessageRef.current =
                                latestCustomerMsg.messageId
                        }
                    }

                    console.log(
                        `✅ Loaded ${newMessages.length} messages`,
                        analyzing ? '(Analysis in progress)' : '',
                    )
                }
            } catch (err) {
                console.error('❌ Error fetching ticket messages:', err)
                setError(err.message)
            } finally {
                if (!silent) setLoading(false)
            }
        },
        [
            ticketId,
            autoAnalyzeOnNewMessage,
            analyzeDelay,
            analyzing,
            triggerReanalysis,
        ],
    )

    // Send message
    const sendMessage = useCallback(
        async (messageText) => {
            if (!ticketId || !messageText?.trim()) {
                throw new Error('Ticket ID dan message diperlukan')
            }

            setSending(true)
            try {
                console.log(`Sending message to ticket: ${ticketId}`)

                const response = await fetch(
                    `/api/tickets/${ticketId}/messages`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            message: messageText.trim(),
                            senderId: user?.uid || 'anonymous',
                            senderName:
                                user?.displayName ||
                                user?.email ||
                                'Support Agent',
                            senderEmail: user?.email || 'agent@example.com',
                            senderRole: user?.role || 'agent',
                        }),
                    },
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send message')
                }

                console.log('✅ Message sent successfully')

                // Refresh messages setelah kirim
                await fetchMessages(true)

                return data.data
            } catch (err) {
                console.error('❌ Error sending message:', err)
                throw err
            } finally {
                setSending(false)
            }
        },
        [ticketId, user, fetchMessages],
    )

    // Initial load
    useEffect(() => {
        fetchMessages()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId]) // Only run when ticketId changes

    // Auto-refresh
    useEffect(() => {
        if (!autoRefresh || !ticketId) return

        const intervalId = setInterval(() => {
            console.log('🔄 Auto-refreshing ticket messages...')
            fetchMessages(true) // silent refresh
        }, refreshInterval)

        return () => clearInterval(intervalId)
    }, [autoRefresh, refreshInterval, ticketId, fetchMessages])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (analyzeTimeoutRef.current) {
                clearTimeout(analyzeTimeoutRef.current)
            }
        }
    }, [])

    return {
        messages,
        ticket,
        loading,
        error,
        sending,
        analyzing, // 🆕 Shows when AI is analyzing
        sendMessage,
        refresh: fetchMessages,
        reanalyze: triggerReanalysis, // 🆕 Manual trigger for re-analysis
    }
}
