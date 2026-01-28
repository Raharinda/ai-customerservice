'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProfileOverlay from '@/components/layout/ProfileOverlay'

export default function AuthButton() {
    const { user, loading } = useAuth()
    const [open, setOpen] = useState(false)

    if (loading) return null

    if (!user) {
        return (
            <button
                onClick={() => (window.location.href = 'customer/auth/login')}
                className='px-4 py-2 bg-zinc-100 border-2 border-transparent text-black rounded-lg text-sm hover:border-2 hover:border-gray-300'
            >
                Login
            </button>
        )
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className='flex items-center gap-2 border-transparent border-2 px-3 py-2 bg-zinc-100 rounded-lg text-sm hover:border-2 hover:border-gray-300'
            >
                Profile
            </button>

            {open && <ProfileOverlay onClose={() => setOpen(false)} />}
        </>
    )
}
