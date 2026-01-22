'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

/**
 * 🧪 TEST PAGE - Agent Messages API
 * 
 * Page untuk testing API GET /api/agent/messages
 * Seamless - tidak perlu manual input token!
 * 
 * Cara pakai:
 * 1. Login sebagai agent
 * 2. Akses: http://localhost:3000/agent/test-messages
 * 3. Klik tombol test yang diinginkan
 * 4. Lihat hasil response
 */
export default function TestAgentMessages() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, getIdToken } = useAuth(); // Get getIdToken from AuthContext

  // Function untuk test API
  const testAPI = async (endpoint, description) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log(`🧪 Testing: ${description}`);
      console.log(`📍 Endpoint: ${endpoint}`);

      // 🔑 AUTOMATIC TOKEN - Use getIdToken from AuthContext!
      const token = await getIdToken();
      console.log(`🔑 Token retrieved automatically`);

      const startTime = Date.now();
      
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const data = await res.json();

      console.log(`✅ Response received in ${responseTime}ms`);
      console.log('Response data:', data);

      setResponse({
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        responseTime,
        data,
        endpoint,
        description,
      });

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="agent">
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🧪 Test Agent Messages API
            </h1>
            <p className="text-gray-600">
              Test endpoint: <code className="bg-gray-100 px-2 py-1 rounded">GET /api/agent/messages</code>
            </p>
            <p className="text-sm text-green-600 mt-2">
              ✅ Logged in as: <strong>{user?.email}</strong> (Role: agent)
            </p>
            <p className="text-xs text-gray-500 mt-1">
              🔑 Token akan otomatis diambil saat test - tidak perlu input manual!
            </p>
          </div>

          {/* Test Buttons */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📋 Test Cases</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Test 1: All Messages */}
              <button
                onClick={() => testAPI('/api/agent/messages', 'Get All Customer Messages')}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                📨 All Messages
              </button>

              {/* Test 2: Unread Messages */}
              <button
                onClick={() => testAPI('/api/agent/messages?filter=unread', 'Get Unread Messages')}
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                🔔 Unread Messages
              </button>

              {/* Test 3: Today's Messages */}
              <button
                onClick={() => testAPI('/api/agent/messages?filter=today', "Get Today's Messages")}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                📅 Today's Messages
              </button>

              {/* Test 4: With Limit */}
              <button
                onClick={() => testAPI('/api/agent/messages?limit=10', 'Get 10 Messages (Limited)')}
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                🔢 Limit 10 Messages
              </button>

              {/* Test 5: Unread + Limit */}
              <button
                onClick={() => testAPI('/api/agent/messages?filter=unread&limit=5', 'Get 5 Unread Messages')}
                disabled={loading}
                className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                🎯 5 Unread Messages
              </button>

              {/* Test 6: Custom Ticket ID (example) */}
              <button
                onClick={() => {
                  const ticketId = prompt('Enter Ticket ID:');
                  if (ticketId) {
                    testAPI(`/api/agent/messages?ticketId=${ticketId}`, `Get Messages from Ticket: ${ticketId}`);
                  }
                }}
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400"
              >
                🎫 By Ticket ID
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700 font-medium">Testing API...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <h3 className="text-red-800 font-semibold mb-2">❌ Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="space-y-4">
              {/* Response Summary */}
              <div className={`rounded-lg p-6 ${response.ok ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-semibold ${response.ok ? 'text-green-800' : 'text-red-800'}`}>
                    {response.ok ? '✅ Success' : '❌ Failed'}
                  </h3>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${response.ok ? 'text-green-700' : 'text-red-700'}`}>
                      Status: {response.status} {response.statusText}
                    </div>
                    <div className="text-xs text-gray-600">
                      Response time: {response.responseTime}ms
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className={response.ok ? 'text-green-700' : 'text-red-700'}>
                    <strong>Test:</strong> {response.description}
                  </p>
                  <p className={response.ok ? 'text-green-700' : 'text-red-700'}>
                    <strong>Endpoint:</strong> {response.endpoint}
                  </p>
                </div>
              </div>

              {/* Response Stats */}
              {response.ok && response.data.data && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-blue-900 font-semibold mb-3">📊 Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {response.data.data.totalMessages}
                      </div>
                      <div className="text-xs text-gray-600">Total Messages</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">
                        {response.data.data.messages.filter(m => m.isRead).length}
                      </div>
                      <div className="text-xs text-gray-600">Read</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-orange-600">
                        {response.data.data.messages.filter(m => !m.isRead).length}
                      </div>
                      <div className="text-xs text-gray-600">Unread</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">
                        {response.data.data.filter || 'all'}
                      </div>
                      <div className="text-xs text-gray-600">Filter Used</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages List */}
              {response.ok && response.data.data?.messages && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    💬 Messages ({response.data.data.messages.length})
                  </h3>
                  
                  {response.data.data.messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No messages found
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {response.data.data.messages.map((msg, index) => (
                        <div
                          key={msg.messageId}
                          className={`border rounded-lg p-4 ${!msg.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  {msg.senderName}
                                </span>
                                {!msg.isRead && (
                                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600">
                                {msg.senderEmail || 'No email'}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`text-xs px-2 py-1 rounded ${
                                msg.ticketCategory === 'technical' ? 'bg-purple-100 text-purple-800' :
                                msg.ticketCategory === 'billing' ? 'bg-green-100 text-green-800' :
                                msg.ticketCategory === 'account' ? 'bg-yellow-100 text-yellow-800' :
                                msg.ticketCategory === 'feature-request' ? 'bg-pink-100 text-pink-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {msg.ticketCategory || 'general'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded p-2 mb-2 text-sm">
                            <strong>Ticket:</strong> {msg.ticketSubject}
                          </div>
                          
                          <p className="text-gray-800 text-sm mb-2">
                            {msg.message}
                          </p>
                          
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>ID: {msg.messageId}</span>
                            <span>{new Date(msg.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Raw JSON Response */}
              <details className="bg-gray-900 text-green-400 rounded-lg p-6">
                <summary className="cursor-pointer font-semibold mb-2">
                  🔍 View Raw JSON Response
                </summary>
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h3 className="text-yellow-900 font-semibold mb-2">💡 Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Klik tombol test untuk langsung coba API</li>
              <li>Token otomatis diambil dari session login - tidak perlu input manual!</li>
              <li>Buka Browser Console (F12) untuk lihat detail request/response</li>
              <li>Test berbeda filter untuk lihat perbedaan hasil</li>
              <li>Jika tidak ada messages, buat ticket dulu sebagai customer</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
