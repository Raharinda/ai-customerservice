// hooks/useTicketSearch.js
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function useTicketSearch() {
    const { user, getIdToken } = useAuth()
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!query) {
            setResults([])
            return
        }

        const timeout = setTimeout(async () => {
            setLoading(true)
            try {
                const token = await getIdToken()
                const res = await fetch(`/api/tickets/search?q=${query}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                const data = await res.json()
                setResults(data.tickets)
            } finally {
                setLoading(false)
            }
        }, 400) // debounce

        return () => clearTimeout(timeout)
    }, [query, getIdToken])

    return { query, setQuery, results, loading }
}
