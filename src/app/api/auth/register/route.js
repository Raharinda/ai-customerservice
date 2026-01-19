import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Validasi input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, dan name harus diisi' },
        { status: 400 }
      );
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Buat user dengan Firebase Admin
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // Simpan data tambahan di Firestore (opsional)
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      createdAt: new Date().toISOString(),
      role: 'customer', // default role
    });

    // Generate custom token untuk auto-login setelah register
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json(
      {
        message: 'User berhasil didaftarkan',
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          name: userRecord.displayName,
        },
        customToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Handle specific Firebase errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
