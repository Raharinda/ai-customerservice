'use client'

import { BiLoaderAlt } from 'react-icons/bi'

/**
 * ConversationHeader Component
 * Displays conversation header with message count and analysis status
 */
export default function ConversationHeader({ messagesCount, analyzing }) {
    return (
        <div className='bg-gray-50 border-b border-gray-200 px-6 py-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='font-semibold text-gray-900'>
                        Conversation ({messagesCount})
                    </h2>
                    <p className='text-xs text-gray-600 mt-1'>
                        {analyzing
                            ? 'AI is analyzing conversation...'
                            : 'AI updates automatically with new messages'}
                    </p>
                </div>
                {analyzing && (
                    <div className='flex items-center gap-2 text-purple-600'>
                        <BiLoaderAlt className='animate-spin w-5 h-5' />
                        <span className='text-xs font-medium'>
                            Analyzing...
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
