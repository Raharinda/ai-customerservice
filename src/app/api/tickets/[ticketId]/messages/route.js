import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

// POST - Mengirim pesan baru ke tiket yang sudah ada
export async function POST(request, { params }) {
  try {
    // Ambil authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    // Verifikasi token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Token tidak valid' },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    const { ticketId } = params;

    console.log('✅ User authenticated:', uid);
    console.log('📨 Adding message to ticket:', ticketId);

    // Ambil data dari request body
    const body = await request.json();
    const { message } = body;

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

    const ticketData = ticketDoc.data();

    // Cek apakah user adalah pemilik ticket atau agent yang di-assign
    if (ticketData.customerId !== uid && ticketData.assignedTo !== uid) {
      // Ambil user data untuk cek role
      const userDoc = await adminDb.collection('users').doc(uid).get();
      const userData = userDoc.data();
      
      // Allow if user is an agent (even if not assigned yet)
      if (userData.role !== 'agent') {
        return NextResponse.json(
          { error: 'Anda tidak memiliki akses ke ticket ini' },
          { status: 403 }
        );
      }
    }

    // Ambil data user pengirim
    const userDoc = await adminDb.collection('users').doc(uid).get();
    const userData = userDoc.data();

    // Buat pesan baru
    const newMessage = {
      ticketId: ticketId,
      senderId: uid,
      senderName: userData.displayName || userData.email,
      senderRole: userData.role || 'customer',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Simpan pesan ke subcollection
    const messageRef = await adminDb
      .collection('tickets')
      .doc(ticketId)
      .collection('messages')
      .add(newMessage);

    console.log('✅ Message added:', messageRef.id);

    // Update ticket: increment messageCount dan update lastMessageAt
    await adminDb.collection('tickets').doc(ticketId).update({
      messageCount: (ticketData.messageCount || 0) + 1,
      lastMessageAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Jika ticket sudah closed, buka kembali
      status: ticketData.status === 'closed' ? 'open' : ticketData.status,
    });

    console.log('✅ Ticket updated');

    // Return response
    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dikirim',
      data: {
        messageId: messageRef.id,
        ...newMessage,
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

// GET - Mengambil semua pesan dari sebuah ticket
export async function GET(request, { params }) {
  try {
    // Ambil authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Token tidak ditemukan' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    // Verifikasi token
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('❌ Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Token tidak valid' },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    const { ticketId } = params;

    console.log('✅ User authenticated:', uid);
    console.log('📥 Fetching messages for ticket:', ticketId);

    // Cek apakah ticket exists
    const ticketDoc = await adminDb.collection('tickets').doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      return NextResponse.json(
        { error: 'Ticket tidak ditemukan' },
        { status: 404 }
      );
    }

    const ticketData = ticketDoc.data();

    // Cek apakah user adalah pemilik ticket atau agent
    if (ticketData.customerId !== uid) {
      const userDoc = await adminDb.collection('users').doc(uid).get();
      const userData = userDoc.data();
      
      if (userData.role !== 'agent') {
        return NextResponse.json(
          { error: 'Anda tidak memiliki akses ke ticket ini' },
          { status: 403 }
        );
      }
    }

    // Ambil semua pesan, diurutkan dari yang terlama
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

    console.log(`✅ Retrieved ${messages.length} messages`);

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        ticketId: ticketId,
        ticketInfo: {
          subject: ticketData.subject,
          status: ticketData.status,
          priority: ticketData.priority,
          createdAt: ticketData.createdAt,
        },
        messages: messages,
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
