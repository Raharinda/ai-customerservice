'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTicketMessages } from '@/hooks/useTicketMessages';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const ticketId = params.ticketId;

  const [messageInput, setMessageInput] = useState('');

  const {
    messages,
    ticket,
    loading,
    error,
    sending,
    sendMessage,
    refresh,
  } = useTicketMessages(ticketId, {
    autoRefresh: true,
    refreshInterval: 10000, // 10 seconds
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;

    try {
      await sendMessage(messageInput);
      setMessageInput('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Gagal mengirim pesan: ' + err.message);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Technical Issue': 'bg-purple-100 text-purple-800 border-purple-300',
      'Billing & Payment': 'bg-green-100 text-green-800 border-green-300',
      'Feature Request': 'bg-pink-100 text-pink-800 border-pink-300',
      'Account Access': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Other': 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[category] || colors['Other'];
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800 border-blue-300',
      'in-progress': 'bg-purple-100 text-purple-800 border-purple-300',
      resolved: 'bg-green-100 text-green-800 border-green-300',
      closed: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[status] || colors.open;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="agent">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading ticket...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="agent">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/agent/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!ticket) {
    return (
      <ProtectedRoute requiredRole="agent">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
            <p className="text-gray-600 mb-4">Ticket dengan ID tersebut tidak ditemukan.</p>
            <button
              onClick={() => router.push('/agent/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="agent">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/agent/dashboard')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Ticket Detail
                  </h1>
                  <p className="text-sm text-gray-500">Ticket ID: {ticketId}</p>
                </div>
              </div>
              <button
                onClick={refresh}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket Info Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ticket Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subject</label>
                    <p className="text-gray-900 font-medium">{ticket.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(ticket.category)}`}>
                        {ticket.category}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer</label>
                    <p className="text-gray-900">{ticket.userName || 'Anonymous'}</p>
                    <p className="text-sm text-gray-600">{ticket.userEmail}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900 text-sm">{formatDate(ticket.createdAt)}</p>
                  </div>

                  {ticket.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-gray-900 text-sm">{formatDate(ticket.updatedAt)}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Messages</label>
                    <p className="text-gray-900 font-semibold">{messages.length}</p>
                  </div>
                </div>

                {/* Initial Description */}
                {ticket.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <label className="text-sm font-medium text-gray-500 block mb-2">
                      Initial Description
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {ticket.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                {/* Messages Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Conversation ({messages.length})
                  </h2>
                  <p className="text-sm text-gray-600">
                    Messages are auto-refreshing every 10 seconds
                  </p>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-5xl mb-4">💬</div>
                      <p className="text-gray-600">No messages yet</p>
                      <p className="text-sm text-gray-500">Start the conversation below</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isAgent = msg.senderRole === 'agent';
                      
                      return (
                        <div
                          key={msg.messageId || index}
                          className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[70%] ${isAgent ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-lg p-4 ${
                              isAgent 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-sm font-medium ${
                                  isAgent ? 'text-blue-100' : 'text-gray-700'
                                }`}>
                                  {msg.senderName || msg.senderEmail}
                                  {msg.senderRole === 'agent' && ' (Support Agent)'}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">
                                {msg.message}
                              </p>
                              <p className={`text-xs mt-2 ${
                                isAgent ? 'text-blue-200' : 'text-gray-500'
                              }`}>
                                {formatDate(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 bg-white p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-3">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your response..."
                      disabled={sending}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                    <button
                      type="submit"
                      disabled={sending || !messageInput.trim()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
