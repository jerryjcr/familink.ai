import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq4ADKPhP4Ed2wXrxoWTJ3Ie95zEROQpI",
  authDomain: "family-connect-74783.firebaseapp.com",
  projectId: "family-connect-74783",
  storageBucket: "family-connect-74783.firebasestorage.app",
  messagingSenderId: "379001589375",
  appId: "1:379001589375:web:d1a5c1cfd6697e675f794a",
  measurementId: "G-4XCXFCPB8F"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
