import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    console.log('🔐 Login API called');

    if (!idToken) {
      console.log('❌ No idToken provided');
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 400 }
      );
    }

    console.log('✅ Token received, verifying...');

    // Verifikasi ID token dari Firebase
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    console.log('✅ Token verified for user:', uid);

    // Ambil data user dari Firestore
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    let userData = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.displayName || decodedToken.email,
    };

    if (userDoc.exists) {
      console.log('✅ User data found in Firestore');
      userData = { ...userData, ...userDoc.data() };
    } else {
      console.log('⚠️  User not in Firestore, using token data');
    }

    console.log('✅ Login successful for:', userData.email);

    return NextResponse.json(
      {
        message: 'Login berhasil',
        user: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Login API error:', error.code, error.message);

    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'Token sudah kadaluarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

    if (error.code === 'auth/invalid-id-token') {
      return NextResponse.json(
        { error: 'Token tidak valid. Silakan login kembali.' },
        { status: 401 }
      );
    }

    if (error.code === 'auth/argument-error') {
      return NextResponse.json(
        { error: 'Format token tidak valid' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login: ' + error.message },
      { status: 500 }
    );
  }
}
