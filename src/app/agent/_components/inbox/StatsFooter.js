export function StatsFooter({ messageCount }) {
    if (messageCount === 0) return null

    return (
        <div className='mt-6 text-center text-gray-600'>
            Showing {messageCount} message{messageCount !== 1 ? 's' : ''}
        </div>
    )
}
