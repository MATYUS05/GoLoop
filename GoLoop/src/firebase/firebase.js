import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "goloop-cc633.firebaseapp.com",
  projectId: "goloop-cc633",
  storageBucket: "goloop-cc633.firebasestorage.app",
  messagingSenderId: "602143974320",
  appId: "1:602143974320:web:da3d32a9bb127e8a842c75",
  measurementId: "G-S69DD3G7C8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);