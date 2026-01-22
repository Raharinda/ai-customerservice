'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom Hook untuk Agent fetch customer messages
 * Automatically handles token, no manual token management needed
 * 
 * Usage:
 * const { messages, loading, error, refresh } = useAgentMessages('unread');
 */
export function useAgentMessages(filter = 'all', options = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, getIdToken } = useAuth(); // Get both user and getIdToken

  const {
    ticketId = null,
    customerId = null,
    limit = 50,
    autoRefresh = true,
    refreshInterval = 5000, // 5 seconds for real-time updates
  } = options;

  // Fetch messages function
  const fetchMessages = useCallback(async (silent = false) => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    setError(null);

    try {
      // 🔑 AUTOMATIC TOKEN HANDLING - Use getIdToken from AuthContext
      const token = await getIdToken();

      // Build query params
      const params = new URLSearchParams();
      if (filter) params.append('filter', filter);
      if (ticketId) params.append('ticketId', ticketId);
      if (customerId) params.append('customerId', customerId);
      if (limit) params.append('limit', limit.toString());

      const url = `/api/agent/messages?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`, // Token automatically included
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages');
      }

      setMessages(data.data.messages);
      return data.data.messages;

    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user, getIdToken, filter, ticketId, customerId, limit]); // Add getIdToken to dependencies

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [fetchMessages, user]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !user) return;

    const interval = setInterval(() => {
      fetchMessages(true); // Silent refresh
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchMessages, user]);

  // Refresh function for manual refresh
  const refresh = useCallback(() => {
    return fetchMessages(false);
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    refresh,
  };
}

/**
 * Custom Hook untuk get unread count
 */
export function useUnreadMessagesCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, getIdToken } = useAuth(); // Get getIdToken from AuthContext

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const token = await getIdToken(); // Use getIdToken from AuthContext
        
        const response = await fetch('/api/agent/messages?filter=unread', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const data = await response.json();
        
        if (response.ok) {
          setCount(data.data.totalMessages);
        }
      } catch (err) {
        console.error('Error fetching unread count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();

    // Refresh count every 10 seconds for real-time updates
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => clearInterval(interval);
  }, [user, getIdToken]); // Add getIdToken to dependencies

  return { count, loading };
}
