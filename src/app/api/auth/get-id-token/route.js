/**
 * Helper endpoint untuk testing
 * Convert customToken menjadi idToken yang bisa dipakai untuk API calls
 * 
 * Usage:
 * POST /api/auth/get-id-token
 * Body: { "customToken": "your-custom-token-here" }
 */

import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { customToken } = await request.json();

    if (!customToken) {
      return NextResponse.json(
        { error: 'customToken diperlukan' },
        { status: 400 }
      );
    }

    // Sign in dengan custom token
    const userCredential = await signInWithCustomToken(auth, customToken);
    
    // Dapatkan idToken
    const idToken = await userCredential.user.getIdToken();

    return NextResponse.json({
      message: 'idToken berhasil didapatkan',
      idToken: idToken,
      user: {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      },
      expiresIn: '1 hour',
      usage: 'Gunakan idToken ini di header: Authorization: Bearer {idToken}'
    });

  } catch (error) {
    console.error('Error getting idToken:', error);
    
    return NextResponse.json(
      { 
        error: 'Gagal mendapatkan idToken',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
