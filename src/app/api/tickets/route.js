import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

// GET - Mengambil semua tickets (PUBLIC - No Auth Required)
export async function GET(request) {
  try {
    console.log('📋 GET /api/tickets - Public access');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 100;

    let ticketsQuery = adminDb.collection('tickets').orderBy('createdAt', 'desc');

    // Optional filters
    if (customerId) {
      console.log('🔍 Filtering by customerId:', customerId);
      ticketsQuery = ticketsQuery.where('customerId', '==', customerId);
    }
    
    if (status) {
      console.log('🔍 Filtering by status:', status);
      ticketsQuery = ticketsQuery.where('status', '==', status);
    }

    ticketsQuery = ticketsQuery.limit(limit);

    // Fetch tickets
    const ticketsSnapshot = await ticketsQuery.get();

    const tickets = ticketsSnapshot.docs.map(doc => ({
      ticketId: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Retrieved \${tickets.length} tickets`);

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        tickets: tickets,
        totalTickets: tickets.length,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
