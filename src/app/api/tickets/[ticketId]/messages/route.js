import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

// GET - Get all messages from a ticket (PUBLIC - No Auth Required)
export async function GET(request, { params }) {
  try {
    const { ticketId } = await params;
    console.log(`📬 GET /api/tickets/${ticketId}/messages - Public access`);

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID diperlukan' },
        { status: 400 }
      );
    }

    // Cek apakah ticket exists
    const ticketDoc = await adminDb.collection('tickets').doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      return NextResponse.json(
        { error: 'Ticket tidak ditemukan' },
        { status: 404 }
      );
    }

    // Ambil semua messages
    const messagesSnapshot = await adminDb
      .collection('tickets')
      .doc(ticketId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    const messages = messagesSnapshot.docs.map(doc => ({
      messageId: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Retrieved \${messages.length} messages`);

    return NextResponse.json({
      success: true,
      data: {
        ticket: {
          ticketId,
          ...ticketDoc.data(),
        },
        messages,
        totalMessages: messages.length,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets/[ticketId]/messages
 * Send a new message to a ticket - OPTIMIZED
 * 
 * Features:
 * - Auto-update counters (messageCount, lastMessageAt)
 * - Auto-update ticket status based on sender role
 * - Support authentication via idToken
 * - Denormalized sender data for fast reads
 */
export async function POST(request, { params }) {
  try {
    const { ticketId } = await params;
    console.log(`📨 POST /api/tickets/${ticketId}/messages - Optimized`);

    if (!ticketId) {
      return NextResponse.json(
        { error: 'Ticket ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      message,
      idToken, // Optional - for authenticated users
      senderId = 'anonymous',
      senderName = 'Anonymous',
      senderEmail = 'anonymous@example.com',
      senderRole = 'customer'
    } = body;

    // Validate message
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // === AUTHENTICATION (Optional) ===
    let userId = senderId;
    let userName = senderName;
    let userEmail = senderEmail;
    let userRole = senderRole;

    if (idToken) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        userId = decodedToken.uid;
        userEmail = decodedToken.email || userEmail;
        userName = decodedToken.name || decodedToken.email || userName;
        
        // Check if user is agent
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (userDoc.exists && userDoc.data().role === 'agent') {
          userRole = 'agent';
        }
      } catch (authError) {
        console.warn('⚠️ Token verification failed:', authError.message);
      }
    }

    // Check if ticket exists
    const ticketRef = adminDb.collection('tickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();
    
    if (!ticketDoc.exists) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const ticketData = ticketDoc.data();
    const now = new Date().toISOString();

    // === CREATE MESSAGE (Optimized structure) ===
    const messageData = {
      senderId: userId,
      senderName: userName,
      senderEmail: userEmail,
      senderRole: userRole,
      message: message.trim(),
      createdAt: now,
      read: false,
      attachments: [],
      edited: false,
      editedAt: null
    };

    const messageRef = await adminDb
      .collection('tickets')
      .doc(ticketId)
      .collection('messages')
      .add(messageData);

    console.log(`✅ Message added with ID: ${messageRef.id}`);

    // === UPDATE TICKET (Optimized - batch update) ===
    const updateData = {
      updatedAt: now,
      lastMessageAt: now,
      messageCount: (ticketData.messageCount || 0) + 1,
    };

    // Auto-update status based on sender role
    if (userRole === 'agent') {
      if (ticketData.status === 'open') {
        updateData.status = 'in-progress';
      }
      // Auto-assign to responding agent if not assigned
      if (!ticketData.assignedTo) {
        updateData.assignedTo = userId;
      }
      // Reset unread count for agent responses
      updateData.unreadCount = 0;
    } else if (userRole === 'customer') {
      // Increment unread count for customer messages
      updateData.unreadCount = (ticketData.unreadCount || 0) + 1;
      // Reopen ticket if it was closed
      if (ticketData.status === 'closed' || ticketData.status === 'resolved') {
        updateData.status = 'open';
      }
    }

    await ticketRef.update(updateData);

    console.log(`✅ Ticket ${ticketId} updated`);

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: {
        messageId: messageRef.id,
        ...messageData,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
