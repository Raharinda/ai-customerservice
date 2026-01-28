'use client'

/**
 * ErrorState Component
 * Displays error message with action button
 */
export default function ErrorState({
    error,
    onAction,
    actionLabel = 'Go Back',
}) {
    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
            <div className='text-center max-w-md px-4'>
                <div className='text-red-500 text-6xl mb-4'>⚠️</div>
                <h2 className='text-2xl font-bold text-gray-900 mb-2'>Error</h2>
                <p className='text-gray-600 mb-6 leading-relaxed'>
                    {error || 'Something went wrong. Please try again.'}
                </p>
                <button
                    onClick={onAction}
                    className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'
                >
                    {actionLabel}
                </button>
            </div>
        </div>
    )
}
