'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import AuthButton from '@/components/auth/AuthButton'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useTicketMessages } from '@/hooks/shared/useTicketMessages'
import { useRequests } from '@/hooks/shared/useRequests'
import { useAuth } from '@/contexts/AuthContext'
import { RequestList, FormRequest } from './_components/RequestSection'
import { MessageDetail } from './_components/MessageSection'
import SearchBar from '@/components/layout/SearchBar'

/**
 * Customer Page - Ticket Management Portal
 *
 * Features:
 * ✅ View all tickets
 * ✅ Create new tickets
 * ✅ Search tickets with dropdown
 * ✅ Real-time message conversations
 * ✅ Auto-locked chat for resolved/closed tickets
 */
export default function CustomerPage() {
    const [selectedRequest, setSelectedRequest] = useState(null)
    const { requests, loading, error, refreshRequests } = useRequests()
    const { user } = useAuth()

    const {
        messages,
        loading: messagesLoading,
        sending,
        sendMessage,
    } = useTicketMessages(selectedRequest?.ticketId || selectedRequest?.id)

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

    // Handle search result selection
    const handleSelectSearchResult = (ticket) => {
        setSelectedRequest(ticket)
    }

    // If viewing a specific ticket/request
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
        <ProtectedRoute
            requiredRole='customer'
            unauthRedirect='/customer/auth/login'
        >
            <div className='min-h-screen bg-gray-50'>
                {/* Navbar */}
                <header className='bg-white shadow-sm'>
                    <div className='flex flex-col gap-4 p-5 justify-between'>
                        <div className='flex items-center justify-between'>
                            {/* Left Side */}
                            <div>
                                <h1 className='text-xl font-bold'>
                                    <Link href='/'>Support AI</Link>
                                </h1>
                                <p className='text-sm text-gray-500 mt-1'>
                                    Welcome, {user?.displayName || user?.email}
                                </p>
                            </div>
                            {/* Right Side */}
                            <div className='flex gap-2'>
                                <FormRequest
                                    onRequestCreated={handleRequestCreated}
                                />
                                <AuthButton />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className='max-w-7xl mx-auto px-4 py-6'>
                    {/* Search Bar */}
                    <SearchBar
                        tickets={requests}
                        onSelectTicket={handleSelectSearchResult}
                        placeholder='Search your tickets by subject or number...'
                        className='mb-6'
                    />

                    {/* Request List */}
                    <RequestList
                        requests={requests}
                        loading={loading}
                        error={error}
                        onRefresh={refreshRequests}
                        onSelectRequest={handleSelectRequest}
                    />
                </main>
            </div>
        </ProtectedRoute>
    )
}
