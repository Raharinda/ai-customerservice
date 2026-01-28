'use client'

import MessageBubble from './MessageBubble'

/**
 * MessageList Component
 * Displays all messages in a conversation with empty state
 * No need to pass formatDate - MessageBubble handles it internally
 */
export default function MessageList({ messages }) {
    if (messages.length === 0) {
        return (
            <div className='text-center py-12 text-gray-500'>
                <p className='text-4xl mb-2'>💬</p>
                <p className='text-base font-medium'>No messages yet</p>
                <p className='text-sm mt-1'>Start the conversation below</p>
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            {messages.map((msg, index) => {
                const isAgent = msg.senderRole === 'agent'
                return (
                    <MessageBubble
                        key={msg.messageId || index}
                        message={msg}
                        isAgent={isAgent}
                    />
                )
            })}
        </div>
    )
}
