'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

/**
 * Agent Request Detail Page
 * Halaman untuk agent melihat detail request dari customer
 * dan berkomunikasi via chat
 */
export default function AgentRequestDetail() {
    const params = useParams()
    const router = useRouter()
    const { user, getIdToken } = useAuth()
    const [request, setRequest] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)

    const requestId = params.requestId

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Fetch request detail and messages
    const fetchRequestData = async () => {
        if (!user) return

        try {
            setLoading(true)
            setError(null)
            const token = await getIdToken()

            // Fetch request detail
            const requestRes = await fetch(`/api/request/${requestId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!requestRes.ok) {
                throw new Error('Failed to fetch request')
            }

            const requestData = await requestRes.json()
            setRequest(requestData.request || requestData)

            // Fetch messages
            const messagesRes = await fetch(
                `/api/request/${requestId}/messages`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            )

            if (!messagesRes.ok) {
                throw new Error('Failed to fetch messages')
            }

            const messagesData = await messagesRes.json()
            console.log('Messages data:', messagesData) // Debug log
            setMessages(messagesData.messages || [])
        } catch (err) {
            console.error('Error fetching request:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user && requestId) {
            fetchRequestData()
        }
    }, [user, requestId])

    // Send message
    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!newMessage.trim() || sending) return

        try {
            setSending(true)
            const token = await getIdToken()

            const response = await fetch(
                `/api/agent/requests/${requestId}/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        content: newMessage.trim(),
                    }),
                },
            )

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            const data = await response.json()

            // Add message to local state
            setMessages((prev) => [...prev, data.message])
            setNewMessage('')

            // Refresh data
            fetchRequestData()
        } catch (err) {
            console.error('Error sending message:', err)
            alert('Gagal mengirim pesan: ' + err.message)
        } finally {
            setSending(false)
        }
    }

    if (!user || user.role !== 'agent') {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <p className='text-gray-600'>Memverifikasi akses...</p>
                </div>
            </div>
        )
    }

    return (
        <ProtectedRoute requiredRole='agent'>
            <div className='min-h-screen bg-gray-50'>
                {/* Header */}
                <header className='bg-white border-b border-gray-200'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <div className='flex items-center justify-between py-4'>
                            <button
                                onClick={() => router.push('/agent/dashboard')}
                                className='text-gray-600 hover:text-gray-900 flex items-center gap-2'
                            >
                                ← Back to Dashboard
                            </button>

                            {request && (
                                <div className='flex items-center gap-3'>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            request.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : request.status ===
                                                    'in-progress'
                                                  ? 'bg-blue-100 text-blue-800'
                                                  : request.status ===
                                                      'resolved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {request.status}
                                    </span>
                                    <span className='px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800'>
                                        {request.category}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    {loading ? (
                        <div className='flex justify-center items-center py-12'>
                            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
                        </div>
                    ) : error ? (
                        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                            {error}
                        </div>
                    ) : (
                        <>
                            {/* Request Info */}
                            {request && (
                                <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
                                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                                        {request.subject}
                                    </h1>
                                    <p className='text-gray-600 mb-4'>
                                        {request.description}
                                    </p>
                                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                                        <span>Request ID: {requestId}</span>
                                        <span>•</span>
                                        <span>
                                            Created:{' '}
                                            {new Date(
                                                request.createdAt,
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Messages */}
                            <div className='bg-white rounded-lg shadow-md'>
                                {/* Messages Header */}
                                <div className='border-b border-gray-200 p-4'>
                                    <h2 className='text-lg font-semibold text-gray-900'>
                                        Conversation
                                    </h2>
                                </div>

                                {/* Messages List */}
                                <div className='h-96 overflow-y-auto p-4 space-y-4'>
                                    {messages.length === 0 ? (
                                        <div className='text-center text-gray-500 py-8'>
                                            Belum ada pesan
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => {
                                            // Cek apakah pesan ini dari agent
                                            // Konsisten dengan logic di ticket page
                                            const isAgent =
                                                msg.senderRole === 'agent'

                                            return (
                                                <div
                                                    key={msg.id || index}
                                                    className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                            isAgent
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-200 text-gray-900'
                                                        }`}
                                                    >
                                                        <div className='text-xs opacity-75 mb-1'>
                                                            {msg.senderName ||
                                                                (isAgent
                                                                    ? 'Agent'
                                                                    : 'Customer')}
                                                        </div>
                                                        <p className='break-words'>
                                                            {msg.content ||
                                                                msg.message}
                                                        </p>
                                                        <div className='text-xs opacity-75 mt-1'>
                                                            {new Date(
                                                                msg.createdAt,
                                                            ).toLocaleTimeString(
                                                                'id-ID',
                                                                {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className='border-t border-gray-200 p-4'>
                                    <form
                                        onSubmit={handleSendMessage}
                                        className='flex gap-2'
                                    >
                                        <input
                                            type='text'
                                            value={newMessage}
                                            onChange={(e) =>
                                                setNewMessage(e.target.value)
                                            }
                                            placeholder='Tulis pesan...'
                                            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                            disabled={sending}
                                        />
                                        <button
                                            type='submit'
                                            disabled={
                                                !newMessage.trim() || sending
                                            }
                                            className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors'
                                        >
                                            {sending ? 'Sending...' : 'Send'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    )
}
