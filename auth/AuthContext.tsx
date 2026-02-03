import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User as FirebaseUser, getIdTokenResult, updateProfile, AuthError, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

type Role = 'admin' | 'student';

export interface User {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signupStudent: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  loginStudent: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function firebaseToUser(fb: FirebaseUser, role: Role): User {
  return {
    uid: fb.uid,
    displayName: fb.displayName,
    email: fb.email,
    role,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      const token = await getIdTokenResult(fbUser);
      const claimRole = (token.claims['role'] as Role) || 'student';
      setUser(firebaseToUser(fbUser, claimRole));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signupStudent = async (email: string, password: string, displayName?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      const token = await getIdTokenResult(cred.user);
      const role: Role = (token.claims['role'] as Role) || 'student';
      setUser(firebaseToUser(cred.user, role));
      return { success: true };
    } catch (e) {
      const error = e as AuthError;
      console.error(e);
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'email-exists' };
      }
      if (error.code === 'auth/weak-password') {
        return { success: false, error: 'weak-password' };
      }
      return { success: false, error: 'unknown' };
    }
  };

  const loginStudent = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await getIdTokenResult(cred.user);
      const role: Role = (token.claims['role'] as Role) || 'student';
      setUser(firebaseToUser(cred.user, role));
      return { success: role === 'student', error: role !== 'student' ? 'not-student' : undefined };
    } catch (e) {
      const error = e as AuthError;
      console.error(e);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        return { success: false, error: 'user-not-found' };
      }
      if (error.code === 'auth/wrong-password') {
        return { success: false, error: 'wrong-password' };
      }
      return { success: false, error: 'unknown' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      const token = await getIdTokenResult(cred.user);
      const role: Role = (token.claims['role'] as Role) || 'student';
      setUser(firebaseToUser(cred.user, role));
      return { success: true };
    } catch (e) {
      const error = e as AuthError;
      console.error(e);
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'popup-closed' };
      }
      return { success: false, error: 'unknown' };
    }
  };

  const loginAdmin = async (email: string, password: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await getIdTokenResult(cred.user);
      const role: Role = (token.claims['role'] as Role) || 'student';
      if (role !== 'admin') {
        await signOut(auth);
        return false;
      }
      setUser(firebaseToUser(cred.user, role));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (e) {
      const error = e as AuthError;
      console.error(e);
      if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'user-not-found' };
      }
      return { success: false, error: 'unknown' };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, signupStudent, loginStudent, loginWithGoogle, loginAdmin, resetPassword, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
