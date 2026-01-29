'use client'

import { IoMdArrowBack } from 'react-icons/io'
import { IoRefresh } from 'react-icons/io5'

/**
 * PageHeader Component
 * Displays page header with back button, title, and refresh button
 */
export default function PageHeader({ title, ticketId, onBack, onRefresh }) {
    return (
        <header className='bg-white border-b border-gray-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
                <div className='flex items-center justify-between'>
                    {/* Left side - Back button and title */}
                    <div className='flex items-center space-x-4'>
                        <button
                            onClick={onBack}
                            className='text-gray-600 hover:text-gray-900 transition-colors'
                            aria-label='Go back'
                        >
                            <IoMdArrowBack size={30} />
                        </button>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-900'>
                                {title}
                            </h1>
                            <p className='text-sm text-gray-500 mt-1'>
                                Ticket ID: {ticketId}
                            </p>
                        </div>
                    </div>

                    {/* Right side - Refresh button */}
                    <button
                        onClick={onRefresh}
                        className='flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
                        aria-label='Refresh'
                    >
                        <IoRefresh className='w-5 h-5' />
                        <span className='font-medium'>Refresh</span>
                    </button>
                </div>
            </div>
        </header>
    )
}
