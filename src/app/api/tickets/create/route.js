import { adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

// POST - Create new ticket (PUBLIC - No Auth Required)
export async function POST(request) {
  try {
    console.log('📝 POST /api/tickets/create - Public access');

    // Ambil data dari request body
    const body = await request.json();
    const { 
      subject, 
      message, 
      category = 'general',
      customerId = 'anonymous',
      customerEmail = 'anonymous@example.com',
      customerName = 'Anonymous User'
    } = body;

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

    // Validasi category
    const validCategories = ['technical', 'billing', 'general', 'account', 'feature-request'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Category harus salah satu dari: technical, billing, general, account, feature-request' },
        { status: 400 }
      );
    }

    console.log('Creating ticket:', { subject, category, customerId });

    // Buat ticket baru
    const ticketData = {
      subject: subject.trim(),
      category,
      status: 'open',
      customerId,
      customerEmail,
      customerName,
      assignedTo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ticketRef = await adminDb.collection('tickets').add(ticketData);
    const ticketId = ticketRef.id;

    console.log(`✅ Ticket created with ID: ${ticketId}`);

    // Buat message pertama
    const messageData = {
      ticketId,
      senderId: customerId,
      senderName: customerName,
      senderEmail: customerEmail,
      senderRole: 'customer',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    await adminDb
      .collection('tickets')
      .doc(ticketId)
      .collection('messages')
      .add(messageData);

    console.log('✅ Initial message added to ticket');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Ticket berhasil dibuat',
      data: {
        ticketId,
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
