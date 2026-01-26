export function InboxHeader({ unreadCount }) {
    return (
        <div className='flex justify-between items-center mb-6'>
            <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                    Customer Messages
                </h1>
                <p className='text-gray-600 mt-1'>
                    Auto-refresh setiap 5 detik • Real-time updates
                </p>
            </div>

            {unreadCount > 0 && (
                <div className='bg-red-500 text-white px-4 py-2 rounded-full font-semibold'>
                    {unreadCount} Unread
                </div>
            )}
        </div>
    )
}
