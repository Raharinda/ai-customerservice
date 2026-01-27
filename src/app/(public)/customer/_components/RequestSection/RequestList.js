// components/RequestList.jsx
import React from 'react'
import RequestItem from './RequestItem'

export default function RequestList({
    requests,
    loading,
    error,
    onRefresh,
    onSelectRequest,
}) {
    if (loading) {
        return (
            <div className='flex justify-center items-center p-8'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                <p className='text-red-800'>❌ {error}</p>
                <button
                    onClick={onRefresh}
                    className='mt-2 text-sm text-red-600 hover:text-red-800 underline'
                >
                    Try Again
                </button>
            </div>
        )
    }

    if (requests.length === 0) {
        return (
            <div className='text-center p-8 bg-gray-50 rounded-lg'>
                <p className='text-gray-600'>No requests yet.</p>
                <p className='text-sm text-gray-500 mt-2'>
                    Create a new request to get started.
                </p>
            </div>
        )
    }

    return (
        <div className='flex justify-center'>
            <div className='flex flex-col space-y-4 max-w-7xl w-full'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold'>
                        My Requests ({requests.length})
                    </h2>
                </div>
                {requests.map((request) => (
                    <RequestItem
                        key={request.id}
                        request={request}
                        onClick={onSelectRequest}
                    />
                ))}
            </div>
        </div>
    )
}
