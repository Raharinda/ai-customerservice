// hooks/useRequests.js
import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function useRequests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [user, setUser] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            if (currentUser) {
                fetchRequests(currentUser)
            } else {
                setLoading(false)
                setError('User not authenticated')
            }
        })

        return () => unsubscribe()
    }, [])

    const fetchRequests = async (currentUser) => {
        try {
            setLoading(true)
            setError('')

            if (!currentUser) {
                throw new Error('User not authenticated')
            }

            const idToken = await currentUser.getIdToken()

            // ✅ MIGRASI: Ganti dari /api/request ke /api/tickets
            const response = await fetch(`/api/tickets?customerId=${currentUser.uid}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            })

            // Check if response is ok first
            if (!response.ok) {
                const text = await response.text()
                console.error('❌ Response error:', response.status, text)
                throw new Error(
                    `HTTP ${response.status}: ${text || 'Gagal mengambil data'}`,
                )
            }

            // Check content-type
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('❌ Invalid content-type:', contentType, text)
                throw new Error('Server tidak mengembalikan JSON yang valid')
            }

            const data = await response.json()

            console.log('✅ Tickets loaded:', data.data?.tickets?.length || 0)
            // ✅ MIGRASI: Sesuaikan response structure dari tickets API
            setRequests(data.data?.tickets || [])
        } catch (err) {
            console.error('❌ Fetch error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const refreshRequests = () => {
        if (user) {
            fetchRequests(user)
        }
    }

    return { requests, loading, error, refreshRequests, user }
}
