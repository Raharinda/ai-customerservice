'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({
    children,
    requiredRole,
    unauthRedirect,
}) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (loading) return

        // 1. Belum login
        if (!user) {
            if (unauthRedirect) {
                router.replace(unauthRedirect)
            }
            return
        }

        // 2. Login tapi role salah
        if (requiredRole && user.role !== requiredRole) {
            if (unauthRedirect) {
                router.replace(unauthRedirect)
            }
        }
    }, [user, loading, requiredRole, unauthRedirect, router])

    // 3. Jangan render apa pun selama belum valid
    if (loading) return null
    if (!user) return null
    if (requiredRole && user.role !== requiredRole) return null

    return <>{children}</>
}
