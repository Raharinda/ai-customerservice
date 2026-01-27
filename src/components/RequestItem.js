// components/RequestItem.jsx
import React from 'react'
import { FaCheck } from 'react-icons/fa6'
import { GrInProgress } from 'react-icons/gr'
import { IoMdClose } from 'react-icons/io'
import { IoTimeOutline } from 'react-icons/io5'

export default function RequestItem({ request, onClick }) {
    const formatTimeAgo = (isoString) => {
        const date = new Date(isoString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 60) return `${diffMins} menit yang lalu`
        if (diffHours < 24) return `${diffHours} jam yang lalu`
        if (diffDays < 7) return `${diffDays} hari yang lalu`

        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
    }

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                bg: 'bg-yellow-50',
                text: 'text-yellow-700',
                label: 'pending',
                icon: <IoTimeOutline />,
            },
            'in-progress': {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                label: 'in-progress',
                icon: <GrInProgress />,
            },
            resolved: {
                bg: 'bg-green-50',
                text: 'text-green-700',
                label: 'resolved',
                icon: <FaCheck />,
            },
            closed: {
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                label: 'closed',
                icon: <IoMdClose />,
            },
        }
        return configs[status] || configs.pending
    }

    const generateTicketNumber = (category, createdAt) => {
        const categoryPrefix = {
            'Technical Issue': 'T',
            'Billing & Payment': 'B',
            'Other': 'G',
            'Account Access': 'S',
            'Feature Request': 'F',
        }

        const date = new Date(createdAt)
        const year = date.getFullYear().toString().slice(-2)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const random = (request.ticketId || request.id).slice(0, 2).toUpperCase()

        const prefix = categoryPrefix[category] || 'R'
        return `${prefix}-${year}${month}${random}`
    }

    const statusConfig = getStatusConfig(request.status)

    return (
        <div
            onClick={() => onClick(request)}
            className='flex bg-white rounded-xl shadow border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md hover:shadow-gray-300'
        >
            {/* Strip Color */}
            <div className='w-1 bg-red-500'></div>

            {/* Content */}
            <div className='flex flex-col p-4 flex-1 space-y-3'>
                {/* Header */}
                <div className='flex justify-between items-start'>
                    <div>
                        <h3 className='font-semibold text-lg text-gray-900 mb-1'>
                            {request.subject}
                        </h3>
                        <p className='text-sm text-gray-500'>
                            Ticket #
                            {generateTicketNumber(
                                request.category,
                                request.createdAt,
                            )}
                        </p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}
                    >
                        <span>{statusConfig.icon}</span>
                        {statusConfig.label}
                    </span>
                </div>

                {/* Footer */}
                <div className='flex justify-between items-center text-xs '>
                    <span className='inline-block py-1 px-3 border border-gray-300 rounded-lg'>
                        <span className='capitalize'>{request.category}</span>
                    </span>
                    <span className='flex items-center gap-1'>
                        <IoTimeOutline />
                        {formatTimeAgo(request.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    )
}
