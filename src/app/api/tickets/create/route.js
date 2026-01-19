import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
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
    console.log('✅ User authenticated:', uid);

    // Ambil data dari request body
    const body = await request.json();
    const { subject, message, priority = 'medium' } = body;

    // Validasi input
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject dan message wajib diisi' },
        { status: 400 }
      );
    }

    if (subject.trim().length < 5) {
      return NextResponse.json(
        { error: 'Subject minimal 5 karakter' },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message minimal 10 karakter' },
        { status: 400 }
      );
    }

    // Ambil data user dari Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();

    // Buat ticket baru
    const ticketData = {
      customerId: uid,
      customerName: userData.displayName || userData.email,
      customerEmail: userData.email,
      subject: subject.trim(),
      priority: priority,
      status: 'open', // open, in-progress, resolved, closed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: null, // Will be assigned to agent later
      messageCount: 1,
      lastMessageAt: new Date().toISOString(),
    };

    // Simpan ticket ke Firestore
    const ticketRef = await adminDb.collection('tickets').add(ticketData);
    const ticketId = ticketRef.id;

    console.log('✅ Ticket created:', ticketId);

    // Buat pesan pertama di subcollection messages
    const firstMessage = {
      ticketId: ticketId,
      senderId: uid,
      senderName: userData.displayName || userData.email,
      senderRole: 'customer',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    await adminDb
      .collection('tickets')
      .doc(ticketId)
      .collection('messages')
      .add(firstMessage);

    console.log('✅ First message added to ticket');

    // Return response dengan data ticket
    return NextResponse.json({
      success: true,
      message: 'Ticket berhasil dibuat',
      data: {
        ticketId: ticketId,
        ...ticketData,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
