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
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      console.log('🔄 Auth state changed:', fbUser?.email);
      
      if (fbUser) {
        // Get ID token untuk verifikasi di backend
        const idToken = await fbUser.getIdToken();
        
        // Ambil data user dari Firestore untuk mendapatkan role
        try {
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          if (response.ok) {
            const data = await response.json();
            const userRole = data.user?.role || 'customer';
            
            console.log('✅ User verified. Role:', userRole);
            
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              idToken,
              role: userRole,
              // Tambahkan method getIdToken
              getIdToken: (forceRefresh) => fbUser.getIdToken(forceRefresh),
            });
          } else {
            // Fallback jika verifikasi gagal
            console.warn('⚠️ Verification failed, using default role');
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              idToken,
              role: 'customer',
              getIdToken: (forceRefresh) => fbUser.getIdToken(forceRefresh),
            });
          }
        } catch (error) {
          console.error('❌ Error fetching user role:', error);
          // Fallback
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
            idToken,
            role: 'customer',
            getIdToken: (forceRefresh) => fbUser.getIdToken(forceRefresh),
          });
        }
      } else {
        console.log('🚪 User signed out');
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
  const login = async (email, password, agentKey = null) => {
    try {
      console.log('🔐 Starting login for:', email, agentKey ? '(as agent)' : '(as customer)');
      
      // Login melalui backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, agentKey }),
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
      if (error.message.includes('Agent key')) {
        throw error;
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

  // Login as Agent function
  const loginAsAgent = async (email, password, agentKey) => {
    try {
      console.log('🔐 Starting agent login for:', email);
      
      // Login melalui agent API endpoint
      const response = await fetch('/api/auth/agent/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, agentKey }),
      });

      const data = await response.json();
      console.log('📥 Agent backend response:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Agent login failed');
      }

      // Jika backend mengembalikan custom token, gunakan untuk sign in
      if (data.customToken) {
        console.log('🔑 Signing in agent with custom token');
        await signInWithCustomToken(auth, data.customToken);
        console.log('✅ Agent signed in with custom token');
      }

      console.log('✅ Agent login successful');
      return data;
    } catch (error) {
      console.error('❌ Agent login error:', error);
      
      // Better error messages
      if (error.message.includes('Agent key tidak valid')) {
        throw new Error('Agent key tidak valid');
      }
      if (error.message.includes('Email atau password salah')) {
        throw new Error('Email atau password salah');
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

  // Function untuk mendapatkan fresh ID token
  const getIdToken = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      return await currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      throw error;
    }
  };

  // Function untuk force refresh user data dan role
  const refreshUser = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No user to refresh');
        return;
      }

      console.log('🔄 Refreshing user data...');
      const idToken = await currentUser.getIdToken(true); // Force refresh token
      
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const userRole = data.user?.role || 'customer';
        
        console.log('✅ User refreshed. New role:', userRole);
        
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          idToken,
          role: userRole,
          getIdToken: (forceRefresh) => currentUser.getIdToken(forceRefresh),
        });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    loginAsAgent,
    loginWithGoogle,
    logout,
    getIdToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
