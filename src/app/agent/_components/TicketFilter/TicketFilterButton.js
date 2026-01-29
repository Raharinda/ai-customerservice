'use client'

import { useState } from 'react'
import TicketFilterOverlay from './TicketFilterOverlay'
import { GrFilter } from 'react-icons/gr'

export default function TicketFilterButton({
    filter,
    setFilter,
    urgencyFilter,
    setUrgencyFilter,
    urgencyCounts,
}) {
    const [open, setOpen] = useState(false)

    return (
        <div>
            <button
                onClick={() => setOpen(true)}
                className='flex items-center gap-2 px-4 py-2
                           bg-blue-500 border-2 border-transparent
                           rounded-lg text-sm
                           hover:bg-blue-700 transition-all'
            >
                <GrFilter className='text-lg text-white' />
                <span className='text-white font-medium'>Filters</span>
            </button>

            {open && (
                <TicketFilterOverlay
                    filter={filter}
                    setFilter={setFilter}
                    urgencyFilter={urgencyFilter}
                    setUrgencyFilter={setUrgencyFilter}
                    urgencyCounts={urgencyCounts}
                    onClose={() => setOpen(false)}
                />
            )}
        </div>
    )
}
