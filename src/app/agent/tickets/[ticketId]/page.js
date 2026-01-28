'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTicketMessages } from '@/hooks/shared/useTicketMessages'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

// Import modular components
import PageHeader from './_components/PageHeader'
import TicketSidebar from './_components/TicketSidebar'
import ConversationHeader from './_components/ConversationHeader'
import TicketActionButtons from './_components/TicketActionButtons'
import AIAnalysisCard from './_components/AIAnalysisCard'
import MessageList from './_components/MessageList'
import MessageInput from './_components/MessageInput'
import LoadingState from './_components/LoadingState'
import ErrorState from './_components/ErrorState'

/**
 * TicketDetailPage - Main Component
 * With ticket status management (resolve/close/reopen)
 */
export default function TicketDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { getIdToken } = useAuth()
    const ticketId = params.ticketId

    const [messageInput, setMessageInput] = useState('')
    const [statusUpdating, setStatusUpdating] = useState(false)

    // Enhanced hook with auto-analysis
    const {
        messages,
        ticket,
        loading,
        error,
        sending,
        analyzing,
        sendMessage,
        refresh,
        reanalyze,
    } = useTicketMessages(ticketId, {
        autoRefresh: true,
        refreshInterval: 10000,
        autoAnalyzeOnNewMessage: true,
        analyzeDelay: 3000,
    })

    // Handler for status updates
    const handleStatusUpdate = async (newStatus) => {
        setStatusUpdating(true)
        try {
            const token = await getIdToken()

            const response = await fetch(
                `/api/agent/tickets/${ticketId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
                },
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update status')
            }

            console.log('✅ Status updated successfully:', data)

            // Refresh ticket data
            await refresh()

            // Show success message
            alert(
                `Ticket status updated to "${newStatus}" successfully! ${
                    newStatus === 'resolved'
                        ? '🎉 Great job resolving the customer issue!'
                        : ''
                }`,
            )
        } catch (err) {
            console.error('Error updating status:', err)
            throw err // Re-throw to be caught by TicketActionButtons
        } finally {
            setStatusUpdating(false)
        }
    }

    // Handler for sending messages
    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!messageInput.trim()) return

        try {
            await sendMessage(messageInput)
            setMessageInput('')
        } catch (err) {
            console.error('Error sending message:', err)
            alert('Gagal mengirim pesan: ' + err.message)
        }
    }

    const handleUseSuggestedResponse = (response) => {
        setMessageInput(response)
        setTimeout(() => {
            document.querySelector('textarea')?.focus()
        }, 0)
    }

    const handleReanalyze = () => {
        reanalyze(false)
    }

    const handleBack = () => {
        router.push('/agent/dashboard')
    }

    // Loading state
    if (loading) {
        return (
            <ProtectedRoute requiredRole='agent'>
                <LoadingState message='Loading ticket...' />
            </ProtectedRoute>
        )
    }

    // Error state
    if (error || !ticket) {
        return (
            <ProtectedRoute requiredRole='agent'>
                <ErrorState
                    error={error || 'Ticket not found'}
                    onAction={handleBack}
                    actionLabel='Back to Dashboard'
                />
            </ProtectedRoute>
        )
    }

    // Check if AI analysis exists
    const hasAiAnalysis =
        ticket?.aiAnalysis?.status === 'done' && ticket?.aiAnalysis?.summary

    return (
        <ProtectedRoute requiredRole='agent'>
            <div className='min-h-screen bg-gray-50'>
                {/* Page Header */}
                <PageHeader
                    title={ticket.subject}
                    ticketId={ticketId}
                    onBack={handleBack}
                    onRefresh={refresh}
                />

                {/* Main Content */}
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        {/* Left Sidebar - Ticket Information */}
                        <div className='lg:col-span-1'>
                            <TicketSidebar
                                ticket={ticket}
                                messagesCount={messages.length}
                            />
                        </div>

                        {/* Right Section - Conversation */}
                        <div className='lg:col-span-2'>
                            <div className='bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-200px)]'>
                                {/* Conversation Header */}
                                <ConversationHeader
                                    messagesCount={messages.length}
                                    analyzing={analyzing}
                                />

                                {/* Messages Area */}
                                <div className='flex-1 overflow-y-auto p-6'>
                                    {/* Ticket Action Buttons */}
                                    <TicketActionButtons
                                        ticket={ticket}
                                        onStatusUpdate={handleStatusUpdate}
                                    />

                                    {/* AI Analysis Card */}
                                    {hasAiAnalysis && (
                                        <AIAnalysisCard
                                            aiAnalysis={ticket.aiAnalysis}
                                            analyzing={analyzing}
                                            onReanalyze={handleReanalyze}
                                            onUseSuggestedResponse={
                                                handleUseSuggestedResponse
                                            }
                                        />
                                    )}

                                    {/* Message List */}
                                    <MessageList messages={messages} />
                                </div>

                                {/* Message Input */}
                                <MessageInput
                                    value={messageInput}
                                    onChange={(e) =>
                                        setMessageInput(e.target.value)
                                    }
                                    onSubmit={handleSendMessage}
                                    disabled={sending || statusUpdating}
                                    placeholder={
                                        ticket.status === 'closed'
                                            ? 'This ticket is closed. Reopen to send messages.'
                                            : 'Type your response...'
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
