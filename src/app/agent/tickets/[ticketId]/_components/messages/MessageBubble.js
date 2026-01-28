'use client'

import { formatDate, getDisplayName, getEmail } from '@/utils/messageHelpers'
import { FaInfoCircle } from 'react-icons/fa'

/**
 * MessageBubble Component
 * Displays a single message in the conversation
 * Handles system messages (status changes) differently
 */
export default function MessageBubble({ message, isAgent }) {
    // Check if this is a system message
    const isSystemMessage =
        message.senderRole === 'system' || message.type === 'status_change'

    // Render system message differently
    if (isSystemMessage) {
        return (
            <div className='flex justify-center my-4'>
                <div className='bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 max-w-md'>
                    <div className='flex items-center gap-2 text-blue-700'>
                        <FaInfoCircle className='w-4 h-4 flex-shrink-0' />
                        <p className='text-sm font-medium'>{message.message}</p>
                    </div>
                    <p className='text-xs text-blue-600 text-center mt-1'>
                        {formatDate(message.createdAt)}
                    </p>
                </div>
            </div>
        )
    }

    // Regular message rendering
    const displayName = getDisplayName(message)
    const email = getEmail(message)

    return (
        <div className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}>
            <div className='max-w-[70%]'>
                <div
                    className={`rounded-lg p-4 ${
                        isAgent
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                    }`}
                >
                    {/* Sender Info */}
                    <div className='mb-2'>
                        <p
                            className={`text-sm font-medium ${
                                isAgent ? 'text-blue-100' : 'text-gray-700'
                            }`}
                        >
                            {displayName}
                            {isAgent && ' (Support Agent)'}
                        </p>
                        {!isAgent && email !== 'Email tidak tersedia' && (
                            <p
                                className={`text-xs ${
                                    isAgent ? 'text-blue-200' : 'text-gray-500'
                                }`}
                            >
                                {email}
                            </p>
                        )}
                    </div>

                    {/* Message Content */}
                    <p className='text-sm whitespace-pre-wrap leading-relaxed'>
                        {message.message}
                    </p>

                    {/* Timestamp */}
                    <p
                        className={`text-xs mt-2 ${
                            isAgent ? 'text-blue-200' : 'text-gray-500'
                        }`}
                    >
                        {formatDate(message.createdAt)}
                    </p>
                </div>
            </div>
        </div>
    )
}
