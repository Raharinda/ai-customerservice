// Firebase Admin SDK Configuration (Server-side)
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // Validate environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing Firebase credentials. Please check your .env.local file.\n' +
        `projectId: ${projectId ? '✓' : '✗'}\n` +
        `clientEmail: ${clientEmail ? '✓' : '✗'}\n` +
        `privateKey: ${privateKey ? '✓' : '✗'}`
      );
    }

    // Handle different private key formats
    // Remove quotes if they exist at start/end
    privateKey = privateKey.trim().replace(/^["']|["']$/g, '');
    
    // Replace literal \n with actual newlines
    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase admin initialization error:', error.message);
    throw error;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;
