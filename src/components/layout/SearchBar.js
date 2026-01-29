import { useState, useRef, useMemo, useEffect } from 'react'
import { CiSearch } from 'react-icons/ci'
import { IoMdClose } from 'react-icons/io'
import {
    generateTicketNumber,
    formatDate,
    getStatusColor,
} from '@/utils/messageHelpers'

/**
 * SearchBar Component
 * Unified search component for both agent and customer portals
 *
 * Features:
 * - Real-time search with useMemo (no cascading renders)
 * - Search results dropdown
 * - Keyboard navigation
 * - Click outside to close
 * - Uses messageHelper for all formatting
 */
export default function SearchBar({
    tickets = [],
    onSelectTicket,
    placeholder = 'Search tickets by subject, number, or customer...',
    className = '',
}) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const searchRef = useRef(null)
    const inputRef = useRef(null)

    // ✅ Use useMemo instead of useEffect to avoid cascading renders
    const filteredTickets = useMemo(() => {
        if (!query.trim()) {
            return []
        }

        const searchTerm = query.toLowerCase()
        const results = tickets.filter((ticket) => {
            const ticketNumber = generateTicketNumber(
                ticket.category,
                ticket.createdAt,
                ticket.ticketId || ticket.id,
            )

            // Search in multiple fields
            return (
                ticket.subject?.toLowerCase().includes(searchTerm) ||
                ticketNumber.toLowerCase().includes(searchTerm) ||
                ticket.userName?.toLowerCase().includes(searchTerm) ||
                ticket.userEmail?.toLowerCase().includes(searchTerm) ||
                ticket.customerName?.toLowerCase().includes(searchTerm) ||
                ticket.customerEmail?.toLowerCase().includes(searchTerm) ||
                ticket.description?.toLowerCase().includes(searchTerm) ||
                ticket.category?.toLowerCase().includes(searchTerm) ||
                ticket.status?.toLowerCase().includes(searchTerm)
            )
        })

        return results.slice(0, 5) // Limit to 5 results
    }, [query, tickets])

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
        if (searchRef.current && !searchRef.current.contains(event.target)) {
            setIsOpen(false)
            setSelectedIndex(-1)
        }
    }

    // Use effect only for event listeners (external system)
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen || filteredTickets.length === 0) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex((prev) =>
                    prev < filteredTickets.length - 1 ? prev + 1 : prev,
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0) {
                    handleSelectTicket(filteredTickets[selectedIndex])
                }
                break
            case 'Escape':
                e.preventDefault()
                setIsOpen(false)
                setSelectedIndex(-1)
                inputRef.current?.blur()
                break
        }
    }

    const handleSelectTicket = (ticket) => {
        onSelectTicket?.(ticket)
        setQuery('')
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
    }

    const handleClear = () => {
        setQuery('')
        setIsOpen(false)
        inputRef.current?.focus()
    }

    const handleInputChange = (e) => {
        const newQuery = e.target.value
        setQuery(newQuery)
        setSelectedIndex(-1)

        // Open dropdown if there are results
        if (newQuery.trim()) {
            setIsOpen(true)
        } else {
            setIsOpen(false)
        }
    }

    const handleInputFocus = () => {
        if (query && filteredTickets.length > 0) {
            setIsOpen(true)
        }
    }

    return (
        <div
            ref={searchRef}
            className={`relative max-w-7xl mx-auto ${className}`}
        >
            {/* Search Input */}
            <div className='relative'>
                <CiSearch
                    size={20}
                    className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
                />
                <input
                    ref={inputRef}
                    type='text'
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className='w-full rounded-lg bg-zinc-100 py-3 pl-12 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors'
                />
                {query && (
                    <button
                        onClick={handleClear}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                    >
                        <IoMdClose size={20} />
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && filteredTickets.length > 0 && (
                <div className='absolute w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto'>
                    <div className='p-2'>
                        <p className='text-xs text-gray-500 px-3 py-2'>
                            Found {filteredTickets.length} ticket
                            {filteredTickets.length !== 1 ? 's' : ''}
                        </p>
                        {filteredTickets.map((ticket, index) => {
                            const ticketNumber = generateTicketNumber(
                                ticket.category,
                                ticket.createdAt,
                                ticket.ticketId || ticket.id,
                            )
                            const customerName =
                                ticket.userName ||
                                ticket.customerName ||
                                'Anonymous'

                            return (
                                <button
                                    key={ticket.ticketId || ticket.id}
                                    onClick={() => handleSelectTicket(ticket)}
                                    className={`w-full px-2 py-2 rounded-lg `}
                                >
                                    <div className='flex flex-col items-start border border-gray-300 p-4 rounded-xl hover:bg-gray-50'>
                                        <h4 className='font-semibold text-gray-500 text-sm '>
                                            {ticket.subject}
                                        </h4>
                                        <div>
                                            <div className='flex items-center gap-2 mt-1'>
                                                <span className='text-xs text-gray-500'>
                                                    #{ticketNumber}
                                                </span>
                                                <span className='text-xs text-gray-400'>
                                                    •
                                                </span>
                                                <span className='text-xs text-gray-500'>
                                                    {customerName}
                                                </span>
                                            </div>
                                            <div className='flex gap-2 mt-1'>
                                                <span
                                                    className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(
                                                        ticket.status,
                                                    )}`}
                                                >
                                                    {ticket.status}
                                                </span>
                                                <span className='text-xs text-gray-500'>
                                                    {formatDate(
                                                        ticket.createdAt,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* No Results */}
            {isOpen && query && filteredTickets.length === 0 && (
                <div className='absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4'>
                    <div className='text-center text-gray-500 text-sm'>
                        <p>No tickets found for {query}</p>
                        <p className='text-xs mt-1'>
                            Try searching by ticket number, subject, or customer
                            name
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
