import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDSl5dlnhPVFH34MVCQ6iomvECV23pdlk4",
  authDomain: "rsm-robo.firebaseapp.com",
  projectId: "rsm-robo",
  storageBucket: "rsm-robo.firebasestorage.app",
  messagingSenderId: "569097891494",
  appId: "1:569097891494:web:0cbdaf9bee3c716e6c0e67",
  measurementId: "G-F988X4CZ3D"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only in the browser
export let analytics: ReturnType<typeof getAnalytics> | undefined;
try {
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
} catch {}
