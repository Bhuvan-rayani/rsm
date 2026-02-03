import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDSl5dlnhPVFH34MVCQ6iomvECV23pdlk4",
  authDomain: "rsm-robo.firebaseapp.com",
  projectId: "rsm-robo",
  storageBucket: "rsm-robo.firebasestorage.app",
  messagingSenderId: "569097891494",
  appId: "1:569097891494:web:0cbdaf9bee3c716e6c0e67",
  measurementId: "G-F988X4CZ3D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedForum() {
  console.log('🌱 Forum seeding disabled - no default posts');
  console.log('✨ Start fresh with your own forum posts!');
}

seedForum();
