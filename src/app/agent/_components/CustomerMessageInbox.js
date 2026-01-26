'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    useAgentMessages,
    useUnreadMessagesCount,
} from '@/hooks/useAgentMessages'
import {
    InboxHeader,
    MessageList,
    EmptyState,
    ErrorAlert,
    LoadingSpinner,
    StatsFooter,
} from './inbox'
import { FilterButtons } from './inbox/FilterButton'

/**
 * Component untuk Agent melihat semua pesan dari customer
 *
 * ✅ SEAMLESS - No manual token handling needed!
 * ✅ Auto-refresh setiap 5 detik
 * ✅ Automatic authentication
 * ✅ MODULAR - Semua component terpisah dan reusable
 */
export default function CustomerMessagesInbox() {
    const [filter, setFilter] = useState('all')
    const router = useRouter()

    const { messages, loading, error } = useAgentMessages(filter, {
        autoRefresh: true,
        refreshInterval: 5000,
    })

    const { count: unreadCount } = useUnreadMessagesCount()
    console.log('Messages from API:', messages)

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter)
    }

    const handleViewTicket = (ticketId, source) => {
        if (source === 'request') {
            router.push(`/agent/requests/${ticketId}`)
        } else {
            router.push(`/agent/tickets/${ticketId}`)
        }
    }

    return (
        <div className='customer-messages-inbox'>
            <InboxHeader unreadCount={unreadCount} />

            <FilterButtons
                activeFilter={filter}
                onFilterChange={handleFilterChange}
            />

            <ErrorAlert error={error} />

            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    {messages.length === 0 ? (
                        <EmptyState filter={filter} />
                    ) : (
                        <MessageList
                            messages={messages}
                            onViewTicket={handleViewTicket}
                        />
                    )}

                    <StatsFooter messageCount={messages.length} />
                </>
            )}
        </div>
    )
}
