import { adminAuth } from '@/lib/firebaseAdmin';
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

    return NextResponse.json(
      {
        valid: true,
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: decodedToken.name,
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
