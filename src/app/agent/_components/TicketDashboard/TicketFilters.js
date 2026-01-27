// app/agent/_components/TicketsDashboard/TicketFilters.jsx

import React from 'react'
import {
    STATUS_FILTERS,
    URGENCY_FILTERS,
    URGENCY_CONFIGS,
} from '../shared/constants'

/**
 * FilterButton Component
 */
function FilterButton({ active, onClick, children, variant = 'default' }) {
    const baseClasses =
        'px-4 py-2 rounded-lg text-sm font-medium transition-colors'

    const variantClasses = {
        default: active
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        critical: active
            ? 'bg-red-500 text-white'
            : 'bg-red-100 text-red-700 hover:bg-red-200',
        high: active
            ? 'bg-orange-500 text-white'
            : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
        medium: active
            ? 'bg-yellow-500 text-white'
            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
        low: active
            ? 'bg-green-500 text-white'
            : 'bg-green-100 text-green-700 hover:bg-green-200',
    }

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]}`}
        >
            {children}
        </button>
    )
}

/**
 * TicketFilters Component
 * Provides filtering controls for tickets
 */
export default function TicketFilters({
    filter,
    setFilter,
    urgencyFilter,
    setUrgencyFilter,
    urgencyCounts,
}) {
    return (
        <div className='bg-white p-4 rounded-lg shadow border border-gray-200'>
            <div className='space-y-4'>
                {/* Status Filter */}
                <div>
                    <h3 className='text-sm font-medium text-gray-700 mb-2'>
                        Filter by Status
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                        {STATUS_FILTERS.map((status) => (
                            <FilterButton
                                key={status}
                                active={filter === status}
                                onClick={() => setFilter(status)}
                            >
                                {status === 'all'
                                    ? 'All'
                                    : status.replace('-', ' ')}
                            </FilterButton>
                        ))}
                    </div>
                </div>

                {/* Urgency Filter */}
                <div>
                    <h3 className='text-sm font-medium text-gray-700 mb-2'>
                        Filter by AI Urgency
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                        <FilterButton
                            active={urgencyFilter === 'all'}
                            onClick={() => setUrgencyFilter('all')}
                        >
                            All Urgency
                        </FilterButton>
                        {URGENCY_FILTERS.filter((u) => u !== 'all').map(
                            (urgency) => {
                                const config = URGENCY_CONFIGS[urgency]
                                return (
                                    <FilterButton
                                        key={urgency}
                                        active={urgencyFilter === urgency}
                                        onClick={() =>
                                            setUrgencyFilter(urgency)
                                        }
                                        variant={urgency}
                                    >
                                        {config.emoji} {config.label} (
                                        {urgencyCounts[urgency]})
                                    </FilterButton>
                                )
                            },
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
