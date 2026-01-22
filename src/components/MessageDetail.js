// components/MessageDetail.jsx
import React, { useState, useRef, useEffect } from 'react'
import { IoIosArrowBack, IoMdSend } from 'react-icons/io'

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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Auto-focus input saat component mount
    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return

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
            handleSend()
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
            Technical: 'T',
            Billing: 'B',
            General: 'G',
            Support: 'S',
            Bug: 'BG',
            Feature: 'F',
        }

        const date = new Date(createdAt)
        const year = date.getFullYear().toString().slice(-2)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const random = request.id.slice(0, 2).toUpperCase()

        const prefix = categoryPrefix[category] || 'R'
        return `${prefix}-${year}${month}${random}`
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
                <div className='flex'>
                    <p className='text-sm text-gray-600'>
                        Ticket #
                        {generateTicketNumber(
                            request.category,
                            request.createdAt,
                        )}{' '}
                        •{' '}
                        <span className='px-2 border rounded-lg border-gray-300'>
                            {request.category}
                        </span>
                    </p>
                </div>
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
                            const isUser = message.sender === 'user'
                            const senderName = isUser
                                ? 'You'
                                : message.senderName || 'Agent'

                            return (
                                <div
                                    key={message.id}
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
                                                : 'bg-white text-gray-800 border'
                                        }`}
                                    >
                                        <p className='whitespace-pre-wrap'>
                                            {message.content}
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
                    <textarea
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
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
                            className='px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium'
                        >
                            {sending ? 'Sending...' : 'Send Message'}
                            <IoMdSend />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
