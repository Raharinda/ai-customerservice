export function FilterButtons({ activeFilter, onFilterChange }) {
    const filters = [
        { id: 'all', label: 'All Messages' },
        { id: 'unread', label: 'Unread' },
        { id: 'today', label: 'Today' },
    ]

    return (
        <div className='flex gap-2 mb-6'>
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeFilter === filter.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    )
}
