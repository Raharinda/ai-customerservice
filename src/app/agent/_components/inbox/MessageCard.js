import {
    getCategoryColor,
    getStatusColor,
    formatDate,
    getEmail,
    getDisplayName,
    generateTicketNumber,
} from '@/utils/messageHelpers'

export function MessageCard({ message: msg, onViewTicket }) {
    return (
        <div
            className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                !msg.read ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => onViewTicket(msg.ticketId, msg.source)}
        >
            {/* Message Header */}
            <div className='flex justify-between items-start mb-3'>
                <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                        <h3 className='font-semibold text-gray-900'>
                            {getDisplayName(msg)}
                        </h3>
                        {!msg.read && (
                            <span className='bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
                                New
                            </span>
                        )}
                        {msg.source === 'request' && (
                            <span className='bg-purple-500 text-white text-xs px-2 py-1 rounded-full'>
                                Request
                            </span>
                        )}
                    </div>
                    <p className='text-sm text-gray-600'>{getEmail(msg)}</p>
                </div>

                <div className='flex gap-2'>
                    <span
                        className={`text-xs px-2 py-1 rounded ${getCategoryColor(msg.ticketCategory)}`}
                    >
                        {msg.ticketCategory || 'general'}
                    </span>
                    <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(msg.ticketStatus)}`}
                    >
                        {msg.ticketStatus}
                    </span>
                </div>
            </div>

            {/* Ticket Subject */}
            <div className='bg-gray-100 px-3 py-2 rounded mb-3'>
                <p className='text-sm font-medium text-gray-700'>
                    {msg.ticketSubject}
                </p>
                {msg.ticketId && msg.ticketCategory && msg.createdAt && (
                    <p className='text-xs text-gray-500 mt-1'>
                        Ticket #
                        {generateTicketNumber(
                            msg.ticketCategory,
                            msg.createdAt,
                            msg.ticketId,
                        )}
                    </p>
                )}
            </div>

            {/* Message Footer */}
            <div className='flex justify-between items-center text-sm'>
                <span className='text-gray-500'>
                    {formatDate(msg.createdAt)}
                </span>
                <span className='text-blue-600 hover:text-blue-800 font-medium'>
                    View Full Ticket →
                </span>
            </div>
        </div>
    )
}
