'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithCustomToken,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get ID token untuk verifikasi di backend
        const idToken = await firebaseUser.getIdToken();
        
        // Simpan user data
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          idToken,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register function
  const register = async (email, password, name) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login dengan custom token
      if (data.customToken) {
        await signInWithCustomToken(auth, data.customToken);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔐 Starting login for:', email);
      
      // Login melalui backend API (tidak perlu Email/Password enabled di Firebase Console)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📥 Backend response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Jika backend mengembalikan custom token, gunakan untuk sign in
      if (data.customToken) {
        console.log('🔑 Signing in with custom token');
        await signInWithCustomToken(auth, data.customToken);
        console.log('✅ Signed in with custom token');
      }

      console.log('✅ Login successful');
      return data;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Better error messages
      if (error.message.includes('Email atau password salah')) {
        throw new Error('Email atau password salah');
      }
      if (error.message.includes('tidak terdaftar')) {
        throw new Error('Email tidak terdaftar');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Format email tidak valid');
      }
      if (error.code === 'auth/too-many-requests') {
        throw new Error('Terlalu banyak percobaan login. Coba lagi nanti.');
      }
      
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      console.log('🔐 Starting Google login');
      
      // Sign in dengan Google popup
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      console.log('✅ Google sign-in successful:', firebaseUser.email);
      
      // Verifikasi user di backend
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      console.log('✅ Google login verified');
      return data;
    } catch (error) {
      console.error('❌ Google login error:', error);
      
      // Handle specific Google auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login dibatalkan');
      }
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup diblokir. Izinkan popup untuk login dengan Google.');
      }
      if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Login dibatalkan');
      }
      
      throw error;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
