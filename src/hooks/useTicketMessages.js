'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook untuk fetch messages dari ticket tertentu
 * Support auto-refresh dan real-time updates
 */
export function useTicketMessages(ticketId, options = {}) {
  const [messages, setMessages] = useState([]);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const { user, getIdToken } = useAuth();

  const {
    autoRefresh = true,
    refreshInterval = 10000, // 10 seconds
  } = options;

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!ticketId) {
      setLoading(false);
      return;
    }

    try {
      console.log(`📬 Fetching messages for ticket: ${ticketId}`);
      
      const response = await fetch(`/api/tickets/${ticketId}/messages`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data.messages || []);
        setTicket(data.data.ticket || null);
        setError(null);
        console.log(`✅ Loaded ${data.data.messages?.length || 0} messages`);
      }
    } catch (err) {
      console.error('❌ Error fetching ticket messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  // Send message
  const sendMessage = useCallback(async (messageText) => {
    if (!ticketId || !messageText?.trim()) {
      throw new Error('Ticket ID dan message diperlukan');
    }

    setSending(true);
    try {
      console.log(`📨 Sending message to ticket: ${ticketId}`);

      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText.trim(),
          senderId: user?.uid || 'anonymous',
          senderName: user?.displayName || user?.email || 'Support Agent',
          senderEmail: user?.email || 'agent@example.com',
          senderRole: user?.role || 'agent',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      console.log('✅ Message sent successfully');
      
      // Refresh messages setelah kirim
      await fetchMessages();
      
      return data.data;
    } catch (err) {
      console.error('❌ Error sending message:', err);
      throw err;
    } finally {
      setSending(false);
    }
  }, [ticketId, user, fetchMessages]);

  // Initial load
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !ticketId) return;

    const intervalId = setInterval(() => {
      console.log('🔄 Auto-refreshing ticket messages...');
      fetchMessages();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, ticketId, fetchMessages]);

  return {
    messages,
    ticket,
    loading,
    error,
    sending,
    sendMessage,
    refresh: fetchMessages,
  };
}
