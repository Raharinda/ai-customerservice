import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 400 }
      );
    }

    // Verifikasi token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Ambil role dari Firestore
    let role = 'customer'; // default role
    try {
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        role = userData.role || 'customer';
      }
    } catch (firestoreError) {
      console.error('Error fetching user role from Firestore:', firestoreError);
      // Tetap lanjut dengan role default
    }

    return NextResponse.json(
      {
        valid: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
          role: role,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { valid: false, error: 'Token tidak valid' },
      { status: 401 }
    );
  }
}
