// components/MessageDetail.jsx
import React, { useState, useRef, useEffect } from 'react'
import { IoIosArrowBack, IoMdSend } from 'react-icons/io'
import { FaLock, FaCheckCircle } from 'react-icons/fa'

export default function MessageDetail({
    request,
    messages,
    loading,
    sending,
    onSendMessage,
    onBack,
    currentUserId,
}) {
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    // Check if ticket is locked (resolved or closed)
    const isTicketLocked =
        request.status === 'resolved' || request.status === 'closed'
    const ticketStatus = request.status

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Auto-focus input saat component mount (only if not locked)
    useEffect(() => {
        if (!isTicketLocked) {
            inputRef.current?.focus()
        }
    }, [isTicketLocked])

    const handleSend = async () => {
        if (!newMessage.trim() || sending || isTicketLocked) return

        try {
            await onSendMessage(newMessage.trim())
            setNewMessage('')
            // Re-focus input setelah kirim
            inputRef.current?.focus()
        } catch (err) {
            alert('Gagal mengirim pesan: ' + err.message)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            if (!isTicketLocked) {
                handleSend()
            }
        }
    }

    const formatTime = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
        })
    }

    const generateTicketNumber = (category, createdAt) => {
        const categoryPrefix = {
            'Technical Issue': 'T',
            'Billing & Payment': 'B',
            Other: 'G',
            'Account Access': 'S',
            'Feature Request': 'F',
        }

        const date = new Date(createdAt)
        const year = date.getFullYear().toString().slice(-2)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const random = (request.ticketId || request.id)
            .slice(0, 2)
            .toUpperCase()

        const prefix = categoryPrefix[category] || 'R'
        return `${prefix}-${year}${month}${random}`
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            open: {
                bg: 'bg-blue-100',
                text: 'text-blue-800',
                label: 'Open',
            },
            'in-progress': {
                bg: 'bg-purple-100',
                text: 'text-purple-800',
                label: 'In Progress',
            },
            resolved: {
                bg: 'bg-green-100',
                text: 'text-green-800',
                label: 'Resolved',
            },
            closed: {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                label: 'Closed',
            },
        }

        const config = statusConfig[status] || statusConfig.open
        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
            >
                {config.label}
            </span>
        )
    }

    return (
        <div className='flex flex-col h-screen'>
            {/* Header */}
            <div className='border-b border-gray-300 p-4 bg-white'>
                <button
                    onClick={onBack}
                    className='text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1'
                >
                    <IoIosArrowBack /> Back to List
                </button>
                <h2 className='text-xl font-bold mb-2'>{request.subject}</h2>
                <div className='flex items-center gap-3'>
                    <p className='text-sm text-gray-600'>
                        Ticket #
                        {generateTicketNumber(
                            request.category,
                            request.createdAt,
                        )}
                    </p>
                    <span className='text-gray-400'>•</span>
                    <span className='px-2 py-1 border rounded-lg border-gray-300 text-xs'>
                        {request.category}
                    </span>
                    <span className='text-gray-400'>•</span>
                    {getStatusBadge(ticketStatus)}
                </div>

                {/* Status Notice for Resolved/Closed */}
                {isTicketLocked && (
                    <div
                        className={`mt-3 p-3 rounded-lg flex items-center gap-3 ${
                            ticketStatus === 'resolved'
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-gray-50 border border-gray-200'
                        }`}
                    >
                        {ticketStatus === 'resolved' ? (
                            <>
                                <FaCheckCircle className='text-green-600 flex-shrink-0' />
                                <div className='text-sm'>
                                    <p className='font-semibold text-green-800'>
                                        Ticket Resolved
                                    </p>
                                    <p className='text-green-700'>
                                        Your issue has been resolved. If you
                                        need further assistance, please create a
                                        new ticket.
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <FaLock className='text-gray-600 flex-shrink-0' />
                                <div className='text-sm'>
                                    <p className='font-semibold text-gray-800'>
                                        Ticket Closed
                                    </p>
                                    <p className='text-gray-700'>
                                        This ticket has been closed. Please
                                        create a new ticket if you have other
                                        questions.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className='flex-1 overflow-y-auto p-4 bg-gray-50'>
                {loading && messages.length === 0 ? (
                    <div className='flex justify-center py-8'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>
                        No messages yet. Start a conversation with an agent.
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {messages.map((message) => {
                            // Support both old (sender) and new (senderRole) format
                            const isUser =
                                message.sender === 'user' ||
                                message.senderRole === 'customer' ||
                                message.senderId === currentUserId

                            // Check if system message
                            const isSystemMessage =
                                message.senderRole === 'system' ||
                                message.type === 'status_change'

                            const senderName = isUser
                                ? 'You'
                                : isSystemMessage
                                  ? 'System'
                                  : message.senderName || 'Agent'

                            // Render system message differently
                            if (isSystemMessage) {
                                return (
                                    <div
                                        key={message.messageId || message.id}
                                        className='flex justify-center my-4'
                                    >
                                        <div className='bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 max-w-md'>
                                            <p className='text-sm text-blue-700 text-center'>
                                                {message.message ||
                                                    message.content}
                                            </p>
                                            <p className='text-xs text-blue-600 text-center mt-1'>
                                                {formatTime(message.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                )
                            }

                            // Regular message
                            return (
                                <div
                                    key={message.messageId || message.id}
                                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                >
                                    {/* Sender Name */}
                                    <p className='text-sm text-gray-600 mb-1 px-1 font-medium'>
                                        {senderName}
                                    </p>

                                    {/* Chat Bubble */}
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                            isUser
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-800 border border-gray-300'
                                        }`}
                                    >
                                        <p className='whitespace-pre-wrap'>
                                            {message.message || message.content}
                                        </p>
                                        <p
                                            className={`text-xs mt-1 ${
                                                isUser
                                                    ? 'text-blue-100'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {formatTime(message.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className='border-t border-gray-300 bg-white py-6 px-4'>
                <div className='max-w-6xl mx-auto'>
                    {/* Show locked message if ticket is resolved/closed */}
                    {isTicketLocked ? (
                        <div className='bg-gray-100 rounded-lg px-6 py-8 text-center'>
                            <FaLock className='text-gray-400 text-3xl mx-auto mb-3' />
                            <p className='text-gray-700 font-semibold mb-2'>
                                {ticketStatus === 'resolved'
                                    ? 'This ticket has been resolved'
                                    : 'This ticket has been closed'}
                            </p>
                            <p className='text-gray-600 text-sm'>
                                You cannot send new messages to{' '}
                                {ticketStatus === 'resolved'
                                    ? 'resolved'
                                    : 'closed'}{' '}
                                tickets.
                                <br />
                                Please create a new ticket if you need further
                                assistance.
                            </p>
                        </div>
                    ) : (
                        <>
                            <textarea
                                ref={inputRef}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder='Type your message...'
                                rows={3}
                                className='w-full px-4 py-3 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder-gray-400'
                                disabled={sending}
                            />
                            <div className='flex justify-between items-center mt-3'>
                                <p className='text-sm text-gray-500'>
                                    Average response time: 2-4 hours
                                </p>
                                <button
                                    onClick={handleSend}
                                    disabled={sending || !newMessage.trim()}
                                    className='px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors'
                                >
                                    {sending ? 'Sending...' : 'Send Message'}
                                    <IoMdSend />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
