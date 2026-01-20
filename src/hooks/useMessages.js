// hooks/useMessages.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { auth } from '@/lib/firebase'

export function useMessages(requestId) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [sending, setSending] = useState(false)

    // Prevent multiple simultaneous fetches
    const isFetchingRef = useRef(false)

    const fetchMessages = useCallback(async () => {
        // Prevent duplicate fetches
        if (isFetchingRef.current) {
            console.log('⏭️ Skipping message fetch - already fetching')
            return
        }

        try {
            isFetchingRef.current = true
            setLoading(true)
            setError('')

            const user = auth.currentUser
            if (!user) throw new Error('Not authenticated')

            const idToken = await user.getIdToken()
            const response = await fetch(`/api/request/${requestId}/messages`, {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`HTTP ${response.status}: ${text}`)
            }

            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('Invalid response:', text)
                throw new Error('Server tidak mengembalikan JSON yang valid')
            }

            const data = await response.json()
            console.log('✅ Messages loaded:', data.messages?.length || 0)
            setMessages(data.messages || [])
        } catch (err) {
            console.error('❌ Fetch messages error:', err)
            setError(err.message)
        } finally {
            setLoading(false)
            isFetchingRef.current = false
        }
    }, [requestId])

    // Initial fetch only - NO AUTO-REFRESH
    useEffect(() => {
        if (requestId) {
            console.log('🔄 Initial message fetch for request:', requestId)
            fetchMessages()
        }

        // Cleanup
        return () => {
            setMessages([])
            setError('')
        }
    }, [requestId, fetchMessages])

    const sendMessage = async (content) => {
        try {
            setSending(true)
            const user = auth.currentUser
            if (!user) throw new Error('Not authenticated')

            const idToken = await user.getIdToken()
            const response = await fetch(`/api/request/${requestId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({ content }),
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`HTTP ${response.status}: ${text}`)
            }

            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('Invalid response:', text)
                throw new Error('Server tidak mengembalikan JSON yang valid')
            }

            const data = await response.json()

            // Refresh messages after sending
            await fetchMessages()

            console.log('✅ Message sent successfully')
            return data
        } catch (err) {
            console.error('❌ Send message error:', err)
            throw err
        } finally {
            setSending(false)
        }
    }

    return {
        messages,
        loading,
        error,
        sending,
        sendMessage,
        refreshMessages: fetchMessages, // Manual refresh
    }
}
