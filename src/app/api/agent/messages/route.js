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
      // Fetch all tickets first
      console.log('📋 Fetching all tickets...');
      let ticketsQuery = adminDb.collection('tickets');
      
      if (customerId) {
        ticketsQuery = ticketsQuery.where('customerId', '==', customerId);
      }
      
      const ticketsSnapshot = await ticketsQuery.limit(100).get();
      console.log(`Found \${ticketsSnapshot.docs.length} tickets`);

      // Fetch messages from all tickets
      for (const ticketDoc of ticketsSnapshot.docs) {
        const messagesSnapshot = await adminDb
          .collection('tickets')
          .doc(ticketDoc.id)
          .collection('messages')
          .orderBy('createdAt', 'desc')
          .get();

        const ticketMessages = messagesSnapshot.docs.map(doc => ({
          messageId: doc.id,
          ticketId: ticketDoc.id,
          ticketSubject: ticketDoc.data().subject,
          ticketStatus: ticketDoc.data().status,
          ...doc.data(),
        }));

        messages.push(...ticketMessages);
      }

      // Sort by createdAt descending
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

    console.log(`✅ Retrieved \${messages.length} messages`);

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
