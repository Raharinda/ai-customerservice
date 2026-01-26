import React from 'react'
import { FaCheck } from 'react-icons/fa6'
import { GrInProgress } from 'react-icons/gr'
import { IoMdClose } from 'react-icons/io'
import { IoTimeOutline } from 'react-icons/io5'
import {
    formatDate,
    generateTicketNumber,
    getStatusConfig,
} from '@/utils/messageHelpers'

export default function RequestItem({ request, onClick }) {
    // Prepare icons untuk getStatusConfig
    const statusIcons = {
        pending: <IoTimeOutline />,
        inProgress: <GrInProgress />,
        resolved: <FaCheck />,
        closed: <IoMdClose />,
        open: <IoTimeOutline />,
    }

    const statusConfig = getStatusConfig(request.status, statusIcons)

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
                                request.id,
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
                <div className='flex justify-between items-center text-xs'>
                    <span className='inline-block py-1 px-3 border border-gray-300 rounded-lg'>
                        <span className='capitalize'>{request.category}</span>
                    </span>
                    <span className='flex items-center gap-1'>
                        <IoTimeOutline />
                        {formatDate(request.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    )
}
