import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/agent/messages
 * Endpoint untuk mengambil semua pesan (PUBLIC - No Auth Required)
 * 
 * Query Parameters:
 * - filter: 'all' | 'unread' | 'today' (default: 'all')
 * - ticketId: optional - filter by specific ticket
 * - customerId: optional - filter by specific customer
 * - limit: number - max messages to return (default: 50)
 */
export async function GET(request) {
  try {
    console.log('🔍 GET /api/agent/messages - Public access');
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const ticketId = searchParams.get('ticketId');
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit')) || 50;

    console.log('📊 Query params:', { filter, ticketId, customerId, limit });

    let messages = [];
    
    if (ticketId) {
      console.log('🎫 Fetching messages for specific ticket:', ticketId);
      // Fetch messages from specific ticket
      const messagesSnapshot = await adminDb
        .collection('tickets')
        .doc(ticketId)
        .collection('messages')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      messages = messagesSnapshot.docs.map(doc => ({
        messageId: doc.id,
        ...doc.data(),
      }));
    } else {
      // ==========================================
      // FETCH FROM TWO SOURCES: TICKETS + REQUESTS
      // ==========================================
      
      // 1. Fetch all tickets first
      console.log('📋 Fetching all tickets...');
      
      let ticketsSnapshot;
      try {
        let ticketsQuery = adminDb.collection('tickets').orderBy('updatedAt', 'desc');
        
        if (customerId) {
          ticketsQuery = ticketsQuery.where('customerId', '==', customerId);
        }
        
        ticketsSnapshot = await ticketsQuery.limit(100).get();
        console.log(`Found ${ticketsSnapshot.docs.length} tickets`);
      } catch (ticketError) {
        console.log('⚠️ Error fetching tickets:', ticketError.message);
        ticketsSnapshot = { docs: [] }; // Empty result
      }

      // Group messages by ticket and get latest message per ticket
      const ticketMessagesMap = new Map();

      for (const ticketDoc of ticketsSnapshot.docs) {
        const ticketData = ticketDoc.data();
        const messagesSnapshot = await adminDb
          .collection('tickets')
          .doc(ticketDoc.id)
          .collection('messages')
          .orderBy('createdAt', 'desc')
          .limit(1) // Get only latest message per ticket for inbox view
          .get();

        if (!messagesSnapshot.empty) {
          const latestMessage = messagesSnapshot.docs[0];
          ticketMessagesMap.set(ticketDoc.id, {
            messageId: latestMessage.id,
            ticketId: ticketDoc.id,
            ticketSubject: ticketData.subject,
            ticketStatus: ticketData.status,
            ticketCategory: ticketData.category,
            customerName: ticketData.customerName,
            customerEmail: ticketData.customerEmail,
            source: 'ticket',
            ...latestMessage.data(),
          });
        }
      }

      // Convert map to array
      messages = Array.from(ticketMessagesMap.values());

      // 2. Fetch all requests (NEW - untuk menangkap pesan dari customer yang menggunakan sistem request)
      console.log('📋 Fetching all requests...');
      
      // Try with updatedAt first, fallback to createdAt if index doesn't exist
      let requestsSnapshot;
      try {
        let requestsQuery = adminDb.collection('requests').orderBy('updatedAt', 'desc');
        
        if (customerId) {
          requestsQuery = requestsQuery.where('userId', '==', customerId);
        }
        
        requestsSnapshot = await requestsQuery.limit(100).get();
      } catch (indexError) {
        console.log('⚠️ updatedAt index not found, using createdAt instead');
        let requestsQuery = adminDb.collection('requests').orderBy('createdAt', 'desc');
        
        if (customerId) {
          requestsQuery = requestsQuery.where('userId', '==', customerId);
        }
        
        requestsSnapshot = await requestsQuery.limit(100).get();
      }
      
      console.log(`Found ${requestsSnapshot.docs.length} requests`);

      // Get latest message per request
      for (const requestDoc of requestsSnapshot.docs) {
        const requestData = requestDoc.data();
        
        try {
          // Get latest message for this request
          const messagesSnapshot = await adminDb
            .collection('messages')
            .where('requestId', '==', requestDoc.id)
            .get();

          if (!messagesSnapshot.empty) {
            // Sort messages and get the latest one
            const requestMessages = messagesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            requestMessages.sort((a, b) => {
              return new Date(b.createdAt) - new Date(a.createdAt);
            });

            const latestMessage = requestMessages[0];
            
            // Add to messages array with unified structure
            messages.push({
              messageId: latestMessage.id,
              ticketId: requestDoc.id, // Use requestId as ticketId for consistency
              ticketSubject: requestData.subject || 'No Subject',
              ticketStatus: requestData.status || 'pending',
              ticketCategory: requestData.category || 'Other',
              customerName: latestMessage.senderName || 'Customer',
              customerEmail: 'N/A',
              source: 'request', // Mark as from request system
              message: latestMessage.content,
              content: latestMessage.content,
              createdAt: latestMessage.createdAt,
              read: false, // Default to unread
              senderRole: latestMessage.senderRole || 'customer',
            });
          }
        } catch (msgError) {
          console.error(`Error fetching messages for request ${requestDoc.id}:`, msgError);
          // Continue to next request
        }
      }

      // Sort all messages by createdAt descending
      messages.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    // Apply filters
    if (filter === 'unread') {
      messages = messages.filter(msg => msg.read === false);
    } else if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      messages = messages.filter(msg => new Date(msg.createdAt) >= today);
    }

    // Limit results
    messages = messages.slice(0, limit);

    console.log(`✅ Retrieved ${messages.length} messages (latest per ticket)`);

    return NextResponse.json({
      success: true,
      data: {
        messages,
        totalMessages: messages.length,
        filter,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching agent messages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
