import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDzamNnphFYSQlBvXt635LBkd_uODmVBm8",
  authDomain: "chatapp-eb7d5.firebaseapp.com",
  projectId: "chatapp-eb7d5",
  storageBucket: "chatapp-eb7d5.firebasestorage.app",
  messagingSenderId: "761319577223",
  appId: "1:761319577223:web:fcb8a969729884110a0a22",
  measurementId: "G-67FGQ0J32L"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
