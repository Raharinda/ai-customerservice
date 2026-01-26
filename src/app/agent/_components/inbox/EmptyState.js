export function EmptyState({ filter }) {
    const messages = {
        unread: 'Tidak ada pesan yang belum dibaca',
        today: 'Tidak ada pesan hari ini',
        all: 'Tidak ada pesan dari customer',
    }

    return (
        <div className='text-center py-12 bg-gray-50 rounded-lg'>
            <p className='text-gray-500 text-lg'>
                {messages[filter] || messages.all}
            </p>
        </div>
    )
}
