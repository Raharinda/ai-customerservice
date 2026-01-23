'use client'

import FormRequest from '@/app/(public)/customer/_components/FormRequest'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AuthButton from '@/components/AuthButton'
import MessageDetail from '@/components/MessageDetail'
import RequestList from '@/components/RequestList'
import { useAuth } from '@/contexts/AuthContext'
import { useMessages } from '@/hooks/useMessages'
import { useRequests } from '@/hooks/useRequests'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AgentDashboard() {
    const { user, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        // Redirect jika bukan agent
        // if (user && user.role !== 'agent') {
        //     router.push('/customer')
        // }
        // Redirect ke login agent jika tidak login
        // if (!user) {
        //     router.push('/agent')
        // }
    }, [user, router])

    // if (!user || user.role !== 'agent') {
    //     return (
    //         <div className='min-h-screen flex items-center justify-center'>
    //             <div className='text-center'>
    //                 <p className='text-gray-600'>Memverifikasi akses...</p>
    //             </div>
    //         </div>
    //     )
    // }

    const [selectedRequest, setSelectedRequest] = useState(null)
    const { requests, loading, error, refreshRequests } = useRequests()
    const {
        messages,
        loading: messagesLoading,
        sending,
        sendMessage,
    } = useMessages(selectedRequest?.id)

    const handleRequestCreated = (newRequestId) => {
        refreshRequests()
        setTimeout(() => {
            const newRequest = requests.find((r) => r.id === newRequestId)
            if (newRequest) {
                setSelectedRequest(newRequest)
            }
        }, 500)
    }

    const handleSelectRequest = (request) => {
        setSelectedRequest(request)
    }

    const handleBack = () => {
        setSelectedRequest(null)
        refreshRequests()
    }

    if (selectedRequest) {
        return (
            <MessageDetail
                request={selectedRequest}
                messages={messages}
                loading={messagesLoading}
                sending={sending}
                onSendMessage={sendMessage}
                onBack={handleBack}
                currentUserId={user?.uid}
            />
        )
    }

    return (
        <div className=''>
            {/* Navbar */}
            <div className='flex flex-col gap-4 p-5 shadow-sm justify-between'>
                <div className='flex items-center justify-between'>
                    {/* Left Side */}
                    <div>
                        <h1 className='text-xl font-bold'>
                            <Link href='/'>Support AI</Link>
                        </h1>
                    </div>

                    {/* Right Side */}
                    <div className='flex gap-2'>
                        <FormRequest />
                        <AuthButton />
                    </div>
                </div>
            </div>

            <div className='max-w-6xl mx-auto'>
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <div className='border-t pt-6'>
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6'>
                            <h2 className='text-lg font-semibold text-blue-900 mb-2'>
                                🎯 Agent Tools
                            </h2>
                            <p className='text-blue-700'>
                                Access AI-powered tools to analyze
                                conversations, classify issues, understand
                                customer sentiment, and get intelligent response
                                suggestions.
                            </p>
                        </div>

                        <h2 className='text-xl font-semibold mb-4'>
                            Account Information
                        </h2>
                        <div className='space-y-2'>
                            <p>
                                <span className='font-medium'>Name:</span>{' '}
                                {user?.displayName || user?.email}
                            </p>
                            <p>
                                <span className='font-medium'>Email:</span>{' '}
                                {user?.email}
                            </p>
                            <p>
                                <span className='font-medium'>Role:</span>{' '}
                                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                    Support Agent
                                </span>
                            </p>
                            <p>
                                <span className='font-medium'>User ID:</span>{' '}
                                {user?.uid}
                            </p>
                        </div>
                    </div>
                    <div className=' mx-auto p-4 h-screen flex flex-col'>
                        {!selectedRequest ? (
                            <RequestList
                                requests={requests}
                                loading={loading}
                                error={error}
                                onRefresh={refreshRequests}
                                onSelectRequest={handleSelectRequest}
                            />
                        ) : (
                            <MessageDetail
                                request={selectedRequest}
                                messages={messages}
                                loading={messagesLoading}
                                sending={sending}
                                onSendMessage={sendMessage}
                                onBack={handleBack}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
