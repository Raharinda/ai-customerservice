'use client'

import { useState } from 'react'
import { FaCheck, FaLock, FaUndo } from 'react-icons/fa'
import { BiLoaderAlt } from 'react-icons/bi'

/**
 * TicketActionButtons Component
 * Provides action buttons to update ticket status (resolve, reopen, close)
 */
export default function TicketActionButtons({ ticket, onStatusUpdate }) {
    const [updating, setUpdating] = useState(false)

    const handleStatusChange = async (newStatus, confirmMessage) => {
        const confirmed = confirm(confirmMessage)
        if (!confirmed) return

        setUpdating(true)
        try {
            await onStatusUpdate(newStatus)
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Failed to update ticket status: ' + error.message)
        } finally {
            setUpdating(false)
        }
    }

    const currentStatus = ticket.status

    // Don't show buttons if ticket is already closed
    if (currentStatus === 'closed') {
        return (
            <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4'>
                <div className='flex items-center gap-2 text-gray-600'>
                    <FaLock className='w-4 h-4' />
                    <p className='text-sm font-medium'>
                        This ticket is closed. No further actions available.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4'>
            <div className='flex items-center justify-between'>
                <div>
                    <h4 className='text-sm font-semibold text-gray-900 mb-1'>
                        Ticket Actions
                    </h4>
                    <p className='text-xs text-gray-600'>
                        Update ticket status based on resolution
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    {/* Resolve Button - Show when open or in-progress */}
                    {(currentStatus === 'open' ||
                        currentStatus === 'in-progress') && (
                        <button
                            onClick={() =>
                                handleStatusChange(
                                    'resolved',
                                    'Mark this ticket as RESOLVED? The customer issue has been successfully addressed.',
                                )
                            }
                            disabled={updating}
                            className='flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {updating ? (
                                <>
                                    <BiLoaderAlt className='w-4 h-4 animate-spin' />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FaCheck className='w-4 h-4' />
                                    Mark as Resolved
                                </>
                            )}
                        </button>
                    )}

                    {/* Reopen Button - Show when resolved */}
                    {currentStatus === 'resolved' && (
                        <>
                            <button
                                onClick={() =>
                                    handleStatusChange(
                                        'in-progress',
                                        'REOPEN this ticket? This will move it back to In Progress status.',
                                    )
                                }
                                disabled={updating}
                                className='flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {updating ? (
                                    <>
                                        <BiLoaderAlt className='w-4 h-4 animate-spin' />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FaUndo className='w-4 h-4' />
                                        Reopen Ticket
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() =>
                                    handleStatusChange(
                                        'closed',
                                        'CLOSE this ticket permanently? This action marks the ticket as complete and closed.',
                                    )
                                }
                                disabled={updating}
                                className='flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {updating ? (
                                    <>
                                        <BiLoaderAlt className='w-4 h-4 animate-spin' />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <FaLock className='w-4 h-4' />
                                        Close Ticket
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {/* In Progress Button - Show when open */}
                    {currentStatus === 'open' && (
                        <button
                            onClick={() =>
                                handleStatusChange(
                                    'in-progress',
                                    'Move this ticket to IN PROGRESS? This indicates you are actively working on it.',
                                )
                            }
                            disabled={updating}
                            className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {updating ? (
                                <>
                                    <BiLoaderAlt className='w-4 h-4 animate-spin' />
                                    Updating...
                                </>
                            ) : (
                                <>Start Working</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Status indicator */}
            <div className='mt-3 pt-3 border-t border-blue-200'>
                <p className='text-xs text-gray-600'>
                    Current Status:{' '}
                    <span className='font-semibold capitalize text-blue-700'>
                        {currentStatus.replace('-', ' ')}
                    </span>
                </p>
            </div>
        </div>
    )
}
