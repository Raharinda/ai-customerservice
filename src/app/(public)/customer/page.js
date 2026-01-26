'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRequests } from '@/hooks/useRequests'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/contexts/AuthContext'

import {
    RequestList,
    MessageDetail,
    SearchBar,
    FormRequest,
    AuthButton,
} from './_components'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function RequestPage() {
    const [selectedRequest, setSelectedRequest] = useState(null)
    const { requests, loading, error, refreshRequests } = useRequests()
    const { user } = useAuth()
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
        <ProtectedRoute requiredRole='customer'>
            <div>
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

                <SearchBar />

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
        </ProtectedRoute>
    )
}
