'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAgentMessages, useUnreadMessagesCount } from '@/hooks/useAgentMessages';

/**
 * Component untuk Agent melihat semua pesan dari customer
 * 
 * ✅ SEAMLESS - No manual token handling needed!
 * ✅ Auto-refresh setiap 30 detik
 * ✅ Automatic authentication
 * 
 * Features:
 * - Filter messages (all/unread/today)
 * - Display message dengan ticket info
 * - Quick access ke ticket detail
 * - Unread message counter
 * - Real-time updates (via polling)
 */
export default function CustomerMessagesInbox() {
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  // 🎯 SEAMLESS! Hook automatically handles:
  // - Token retrieval
  // - Authentication
  // - Auto-refresh
  // - Error handling
  const { messages, loading, error, refresh } = useAgentMessages(filter, {
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  });

  // Get unread count (automatically updates every minute)
  const { count: unreadCount } = useUnreadMessagesCount();

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleViewTicket = (ticketId) => {
    router.push(`/agent/tickets/${ticketId}`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      technical: 'bg-purple-100 text-purple-800',
      billing: 'bg-green-100 text-green-800',
      general: 'bg-blue-100 text-blue-800',
      account: 'bg-yellow-100 text-yellow-800',
      'feature-request': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || colors.general;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.open;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="customer-messages-inbox">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Customer Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Pesan-pesan dari customer yang perlu ditangani
          </p>
        </div>
        
        {unreadCount > 0 && (
          <div className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold">
            {unreadCount} Unread
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Messages
        </button>
        <button
          onClick={() => handleFilterChange('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => handleFilterChange('today')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'today'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Today
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Messages List */}
          {messages.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg">
                {filter === 'unread' && 'Tidak ada pesan yang belum dibaca'}
                {filter === 'today' && 'Tidak ada pesan hari ini'}
                {filter === 'all' && 'Tidak ada pesan dari customer'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.messageId}
                  className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                    !msg.isRead ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleViewTicket(msg.ticketId)}
                >
                  {/* Message Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {msg.senderName}
                        </h3>
                        {!msg.isRead && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {msg.senderEmail || 'No email'}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(msg.ticketCategory)}`}>
                        {msg.ticketCategory || 'general'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(msg.ticketStatus)}`}>
                        {msg.ticketStatus}
                      </span>
                    </div>
                  </div>

                  {/* Ticket Subject */}
                  <div className="bg-gray-100 px-3 py-2 rounded mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      📋 {msg.ticketSubject}
                    </p>
                  </div>

                  {/* Message Content */}
                  <p className="text-gray-800 mb-3 line-clamp-2">
                    {msg.message}
                  </p>

                  {/* Message Footer */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {formatDate(msg.createdAt)}
                    </span>
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      View Full Ticket →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats Footer */}
          {messages.length > 0 && (
            <div className="mt-6 text-center text-gray-600">
              Showing {messages.length} message{messages.length !== 1 ? 's' : ''}
            </div>
          )}
        </>
      )}
    </div>
  );
}
