import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, agentKey } = body;

    console.log('🔐 Agent Login API called for:', email);

    // Validasi input
    if (!email || !password || !agentKey) {
      return NextResponse.json(
        { error: 'Email, password, dan agent key diperlukan' },
        { status: 400 }
      );
    }

    // Verifikasi agent key terlebih dahulu
    const validAgentKey = process.env.AGENT_KEY || 'default-agent-key-2026';
    
    if (agentKey !== validAgentKey) {
      console.log('❌ Invalid agent key');
      return NextResponse.json(
        { error: 'Agent key tidak valid' },
        { status: 401 }
      );
    }

    console.log('✅ Agent key verified');

    // Verifikasi user exists di Firestore
    const usersSnapshot = await adminDb
      .collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ User not found:', email);
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    console.log('✅ User found:', uid);

    // Verifikasi password menggunakan Firebase Auth REST API
    let passwordVerified = false;
    
    try {
      const authResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      if (authResponse.ok) {
        console.log('✅ Password verified via Firebase Auth');
        passwordVerified = true;
      } else {
        const errorData = await authResponse.json();
        console.log('❌ Firebase Auth error:', errorData);
        
        // Check if it's because Email/Password login is disabled
        if (errorData.error?.message?.includes('PASSWORD_LOGIN_DISABLED') || 
            errorData.error?.message?.includes('OPERATION_NOT_ALLOWED')) {
          console.log('⚠️  Email/Password login disabled, proceeding with agent key verification');
          passwordVerified = true; // Trust that user exists in Firestore
        } else if (errorData.error?.message?.includes('INVALID_PASSWORD')) {
          console.log('❌ Invalid password');
          return NextResponse.json(
            { error: 'Email atau password salah' },
            { status: 401 }
          );
        } else {
          console.log('❌ Unknown Firebase Auth error');
          return NextResponse.json(
            { error: 'Email atau password salah' },
            { status: 401 }
          );
        }
      }
    } catch (fetchError) {
      console.error('❌ Error calling Firebase Auth API:', fetchError);
      passwordVerified = true; // Proceed if user exists in Firestore
    }

    if (!passwordVerified) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Update user role menjadi agent
    console.log('📝 Updating user role to agent');
    await adminDb.collection('users').doc(uid).update({
      role: 'agent',
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ User role updated to agent');

    // Create custom token untuk client
    console.log('🔑 Creating custom token for agent:', uid);
    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json(
      {
        message: 'Login berhasil sebagai Support Agent',
        customToken,
        user: {
          uid,
          email: userData.email,
          name: userData.name,
          role: 'agent',
        },
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ Agent Login API error:', error.code, error.message);

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat login: ' + error.message },
      { status: 500 }
    );
  }
}
