import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

/**
 * GET /api/agent/tickets
 * Optimized endpoint untuk agent dashboard
 * 
 * Performance optimizations:
 * - Query only necessary fields
 * - Use composite indexes for filtering + sorting
 * - Pagination support
 * - Counter fields to avoid subcollection queries
 * - lastMessageAt for efficient sorting
 * 
 * Query Parameters:
 * - filter: 'all' | 'unread' | 'open' | 'in-progress' | 'resolved' (default: 'all')
 * - assignedTo: agentId - filter by assigned agent
 * - limit: number - max tickets to return (default: 50)
 * - startAfter: ticketId - for pagination
 */
export async function GET(request) {
  try {
    console.log('🎫 GET /api/agent/tickets - Optimized query');
    
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    const assignedTo = searchParams.get('assignedTo');
    const limit = parseInt(searchParams.get('limit')) || 50;
    const startAfter = searchParams.get('startAfter');

    console.log('📊 Query params:', { filter, assignedTo, limit, startAfter });

    // === BUILD OPTIMIZED QUERY ===
    let ticketsQuery = adminDb.collection('tickets');

    // Apply filters
    if (filter === 'unread') {
      // Tickets with unread messages (for agent)
      ticketsQuery = ticketsQuery.where('unreadCount', '>', 0);
    } else if (filter === 'open') {
      ticketsQuery = ticketsQuery.where('status', '==', 'open');
    } else if (filter === 'in-progress') {
      ticketsQuery = ticketsQuery.where('status', '==', 'in-progress');
    } else if (filter === 'resolved') {
      ticketsQuery = ticketsQuery.where('status', '==', 'resolved');
    }

    // Filter by assigned agent
    if (assignedTo) {
      ticketsQuery = ticketsQuery.where('assignedTo', '==', assignedTo);
    }

    // Sort by lastMessageAt (most recent first) - REQUIRES COMPOSITE INDEX
    ticketsQuery = ticketsQuery.orderBy('lastMessageAt', 'desc');

    // Limit results
    ticketsQuery = ticketsQuery.limit(limit);

    // Pagination support
    if (startAfter) {
      const startDoc = await adminDb.collection('tickets').doc(startAfter).get();
      if (startDoc.exists) {
        ticketsQuery = ticketsQuery.startAfter(startDoc);
      }
    }

    // Execute query
    const ticketsSnapshot = await ticketsQuery.get();
    
    console.log(`✅ Found ${ticketsSnapshot.docs.length} tickets`);

    // === TRANSFORM DATA ===
    const tickets = ticketsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ticketId: doc.id,
        // Core fields
        subject: data.subject,
        description: data.description,
        category: data.category,
        status: data.status,
        priority: data.priority,
        
        // Customer info (denormalized)
        customerId: data.customerId,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        
        // Assignment
        assignedTo: data.assignedTo,
        
        // Timestamps
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        lastMessageAt: data.lastMessageAt,
        
        // Counters (no need to query messages subcollection!)
        messageCount: data.messageCount || 0,
        unreadCount: data.unreadCount || 0,
        
        // Metadata
        tags: data.tags || [],
      };
    });

    // === STATS (Optional - for dashboard) ===
    const stats = {
      totalReturned: tickets.length,
      hasMore: tickets.length === limit,
    };

    return NextResponse.json({
      success: true,
      data: {
        tickets,
        stats,
        filter,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching agent tickets:', error);
    
    // Check if it's an index error
    if (error.message && error.message.includes('index')) {
      return NextResponse.json({
        error: 'Database index required',
        details: 'Please create composite index in Firebase Console',
        indexUrl: error.message.match(/https:\/\/[^\s]+/)?.[0] || null
      }, { status: 500 });
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
