'use client'

/**
 * MessageInput Component
 * Handles message input with textarea and send button
 */
export default function MessageInput({
    value,
    onChange,
    onSubmit,
    disabled,
    placeholder = 'Type your response...',
}) {
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault()
            onSubmit(e)
        }
    }

    return (
        <div className='border-t p-4'>
            <form onSubmit={onSubmit} className='flex gap-3'>
                <textarea
                    value={value}
                    onChange={onChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    rows={3}
                    className='flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 resize-none'
                />
                <button
                    type='submit'
                    disabled={disabled || !value.trim()}
                    className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors h-fit'
                >
                    {disabled ? 'Sending...' : 'Send'}
                </button>
            </form>
            <p className='text-xs text-gray-500 mt-2'>
                Tip: Press Ctrl+Enter to send
            </p>
        </div>
    )
}
