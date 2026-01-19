import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

// GET - Mengambil semua tickets milik user (customer) atau semua tickets (agent)
export async function GET(request) {
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

    // Ambil data user untuk cek role
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const isAgent = userData.role === 'agent';

    let ticketsQuery;

    if (isAgent) {
      // Agent bisa melihat semua tickets atau hanya yang assigned ke mereka
      const { url } = request;
      const searchParams = new URL(url).searchParams;
      const filter = searchParams.get('filter'); // 'all', 'assigned', 'unassigned'

      if (filter === 'assigned') {
        ticketsQuery = adminDb
          .collection('tickets')
          .where('assignedTo', '==', uid)
          .orderBy('updatedAt', 'desc');
      } else if (filter === 'unassigned') {
        ticketsQuery = adminDb
          .collection('tickets')
          .where('assignedTo', '==', null)
          .orderBy('updatedAt', 'desc');
      } else {
        // Default: semua tickets
        ticketsQuery = adminDb
          .collection('tickets')
          .orderBy('updatedAt', 'desc');
      }
    } else {
      // Customer hanya bisa melihat tickets mereka sendiri
      ticketsQuery = adminDb
        .collection('tickets')
        .where('customerId', '==', uid)
        .orderBy('updatedAt', 'desc');
    }

    const ticketsSnapshot = await ticketsQuery.get();

    const tickets = ticketsSnapshot.docs.map(doc => ({
      ticketId: doc.id,
      ...doc.data(),
    }));

    console.log(`✅ Retrieved ${tickets.length} tickets`);

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        tickets: tickets,
        totalTickets: tickets.length,
        userRole: userData.role,
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
