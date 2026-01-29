'use client'

import { useState } from 'react'
import {
    STATUS_FILTERS,
    URGENCY_FILTERS,
    URGENCY_CONFIGS,
} from '@/utils/messageHelpers'

function FilterButton({ active, onClick, children, variant = 'default' }) {
    const base =
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full'

    const variants = {
        default: active
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 hover:bg-gray-200',
        critical: active ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700',
        high: active
            ? 'bg-orange-500 text-white'
            : 'bg-orange-100 text-orange-700',
        medium: active
            ? 'bg-yellow-500 text-white'
            : 'bg-yellow-100 text-yellow-700',
        low: active ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700',
    }

    return (
        <button onClick={onClick} className={`${base} ${variants[variant]}`}>
            {children}
        </button>
    )
}

export default function TicketFiltersOverlay({
    filter,
    setFilter,
    urgencyFilter,
    setUrgencyFilter,
    urgencyCounts = {},
    onClose,
}) {
    // local UI state (kalau mau cancel tanpa commit)
    const [localFilter, setLocalFilter] = useState(filter)
    const [localUrgency, setLocalUrgency] = useState(urgencyFilter)

    const applyFilters = () => {
        setFilter(localFilter)
        setUrgencyFilter(localUrgency)
        onClose()
    }

    return (
        <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center'>
            <div className='bg-white rounded-xl p-6 w-full max-w-md space-y-6'>
                <div>
                    <h2 className='text-xl font-semibold'>Filter Tickets</h2>
                    <p className='text-sm text-gray-500'>Narrow down tickets</p>
                </div>

                {/* STATUS */}
                <div>
                    <p className='text-sm font-medium mb-2'>Status</p>
                    <div className='grid grid-cols-2 gap-2'>
                        {STATUS_FILTERS.map((s) => (
                            <FilterButton
                                key={s.value}
                                active={localFilter === s.value}
                                onClick={() => setLocalFilter(s.value)}
                            >
                                {s.label}
                            </FilterButton>
                        ))}
                    </div>
                </div>

                {/* URGENCY */}
                <div>
                    <p className='text-sm font-medium mb-2'>AI Urgency</p>
                    <div className='grid grid-cols-2 gap-2'>
                        <FilterButton
                            active={localUrgency === 'all'}
                            onClick={() => setLocalUrgency('all')}
                        >
                            All
                        </FilterButton>

                        {URGENCY_FILTERS.filter((u) => u.value !== 'all').map(
                            (u) => {
                                const cfg = URGENCY_CONFIGS[u.value]
                                const count = urgencyCounts[u.value] || 0

                                return (
                                    <FilterButton
                                        key={u.value}
                                        variant={u.value}
                                        active={localUrgency === u.value}
                                        onClick={() => setLocalUrgency(u.value)}
                                    >
                                        {cfg.emoji} {cfg.label} ({count})
                                    </FilterButton>
                                )
                            },
                        )}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className='flex gap-3 pt-2'>
                    <button
                        onClick={applyFilters}
                        className='w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600'
                    >
                        Apply
                    </button>
                    <button
                        onClick={onClose}
                        className='w-full border py-2 rounded-lg hover:bg-gray-100'
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}
