// hooks/useRequests.js
import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'

export function useRequests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [user, setUser] = useState(null)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            if (currentUser) {
                // ✅ Use real-time listener instead of one-time fetch
                setupRealtimeListener(currentUser)
            } else {
                setLoading(false)
                setError('User not authenticated')
            }
        })

        return () => unsubscribe()
    }, [])

    // ✅ NEW: Real-time listener for tickets
    const setupRealtimeListener = (currentUser) => {
        try {
            setLoading(true)
            setError('')

            if (!currentUser) {
                throw new Error('User not authenticated')
            }

            console.log('🔄 Setting up real-time listener for tickets...')

            // Create Firestore query
            const ticketsRef = collection(db, 'tickets')
            const q = query(
                ticketsRef,
                where('customerId', '==', currentUser.uid)
                // Note: orderBy removed to avoid composite index requirement
            )

            // Listen for real-time updates
            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    const tickets = snapshot.docs.map((doc) => ({
                        ticketId: doc.id,
                        ...doc.data(),
                    }))

                    // Sort client-side (newest first)
                    tickets.sort((a, b) => {
                        const dateA = new Date(a.createdAt)
                        const dateB = new Date(b.createdAt)
                        return dateB - dateA
                    })

                    console.log('✅ Real-time update: Tickets loaded:', tickets.length)
                    
                    // Log AI analysis status
                    tickets.forEach(ticket => {
                        if (ticket.aiAnalysis) {
                            console.log(`🤖 Ticket ${ticket.ticketId.slice(0, 8)}: AI status = ${ticket.aiAnalysis.status}`)
                        }
                    })

                    setRequests(tickets)
                    setLoading(false)
                },
                (err) => {
                    console.error('❌ Real-time listener error:', err)
                    setError(err.message)
                    setLoading(false)
                }
            )

            // Return cleanup function
            return unsubscribe
        } catch (err) {
            console.error('❌ Setup listener error:', err)
            setError(err.message)
            setLoading(false)
        }
    }

    // Keep the old fetchRequests for manual refresh (fallback)
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
