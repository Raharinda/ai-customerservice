'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function ProfileOverlay({ onClose }) {
    const { user, logout } = useAuth()

    return (
        <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center'>
            <div className='bg-white rounded-xl p-6 w-full max-w-sm space-y-5'>
                <div>
                    <h2 className='text-xl font-semibold'>Profile</h2>
                    <p className='text-sm text-gray-500'>Account information</p>
                </div>

                <div className='space-y-1 text-sm'>
                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p>
                        <strong>Name:</strong> {user.displayName || '-'}
                    </p>
                    <p>
                        <strong>Role:</strong> {user.role}
                    </p>
                </div>

                <div className='flex gap-3 pt-4'>
                    <button
                        onClick={logout}
                        className='w-full bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600'
                    >
                        Logout
                    </button>
                    <button
                        onClick={onClose}
                        className='w-full border border-gray-300 py-2 rounded-lg text-sm hover:bg-gray-100'
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
