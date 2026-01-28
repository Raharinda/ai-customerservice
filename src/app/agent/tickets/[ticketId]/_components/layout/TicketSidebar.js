'use client'

import {
    formatDate,
    generateTicketNumber,
    getCategoryColor,
    getStatusColor,
} from '@/utils/messageHelpers'

/**
 * TicketSidebar Component
 * Displays ticket information in a sidebar
 * Uses messageHelper utilities for consistent formatting
 */
export default function TicketSidebar({ ticket, messagesCount }) {
    // Generate ticket number using helper
    const ticketNumber = generateTicketNumber(
        ticket.category,
        ticket.createdAt,
        ticket.ticketId,
    )

    return (
        <div className='bg-white rounded-lg shadow-md p-6 sticky top-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                Ticket Information
            </h2>

            <div className='space-y-4'>
                {/* Ticket Number */}
                <div>
                    <label className='text-sm font-medium text-gray-500 block mb-1'>
                        Ticket Number
                    </label>
                    <p className='text-gray-900 font-mono font-semibold'>
                        {ticketNumber}
                    </p>
                </div>

                {/* Category */}
                <div>
                    <label className='text-sm font-medium text-gray-500 block mb-1'>
                        Category
                    </label>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(ticket.category)}`}
                    >
                        {ticket.category}
                    </span>
                </div>

                {/* Status */}
                <div>
                    <label className='text-sm font-medium text-gray-500 block mb-1'>
                        Status
                    </label>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
                    >
                        {ticket.status}
                    </span>
                </div>

                {/* Customer Info */}
                <div>
                    <label className='text-sm font-medium text-gray-500 block mb-1'>
                        Customer
                    </label>
                    <p className='text-gray-900 font-medium'>
                        {ticket.userName || 'Anonymous'}
                    </p>
                    <p className='text-sm text-gray-600'>{ticket.userEmail}</p>
                </div>

                {/* Created Date */}
                <div>
                    <label className='text-sm font-medium text-gray-500 block mb-1'>
                        Created
                    </label>
                    <p className='text-gray-900 text-sm'>
                        {formatDate(ticket.createdAt)}
                    </p>
                </div>

                {/* Updated Date */}
                {ticket.updatedAt && (
                    <div>
                        <label className='text-sm font-medium text-gray-500 block mb-1'>
                            Last Updated
                        </label>
                        <p className='text-gray-900 text-sm'>
                            {formatDate(ticket.updatedAt)}
                        </p>
                    </div>
                )}

                {/* Message Count */}
                <div>
                    <label className='text-sm font-medium text-gray-500 block mb-1'>
                        Total Messages
                    </label>
                    <p className='text-blue-600 font-semibold text-lg'>
                        {messagesCount}
                    </p>
                </div>
            </div>

            {/* Initial Description */}
            {ticket.description && (
                <div className='mt-6 pt-6 border-t border-gray-200'>
                    <label className='text-sm font-medium text-gray-500 block mb-2'>
                        Initial Description
                    </label>
                    <div className='bg-gray-50 rounded-lg p-4'>
                        <p className='text-gray-700 text-sm whitespace-pre-wrap leading-relaxed'>
                            {ticket.description}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
