import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

// GET - Get all messages from a ticket (PUBLIC - No Auth Required)
export async function GET(request, { params }) {
  try {
    const { ticketId } = params;
    console.log(`📬 GET /api/tickets/\${ticketId}/messages - Public access`);

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

// POST - Send message to a ticket (PUBLIC - No Auth Required)
export async function POST(request, { params }) {
  try {
    const { ticketId } = params;
    console.log(`📨 POST /api/tickets/\${ticketId}/messages - Public access`);

    // Ambil data dari request body
    const body = await request.json();
    const { 
      message,
      senderId = 'anonymous',
      senderName = 'Anonymous',
      senderEmail = 'anonymous@example.com',
      senderRole = 'customer'
    } = body;

    // Validasi input
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message tidak boleh kosong' },
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

    // Buat pesan baru
    const messageData = {
      ticketId,
      senderId,
      senderName,
      senderEmail,
      senderRole,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    const messageRef = await adminDb
      .collection('tickets')
      .doc(ticketId)
      .collection('messages')
      .add(messageData);

    // Update ticket's updatedAt
    await adminDb.collection('tickets').doc(ticketId).update({
      updatedAt: new Date().toISOString(),
      status: 'open', // Reopen ticket if it was closed
    });

    console.log(`✅ Message added with ID: \${messageRef.id}`);

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
