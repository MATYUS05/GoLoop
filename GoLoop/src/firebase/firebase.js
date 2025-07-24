import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_KEY,
  authDomain: "goloop-cc633.firebaseapp.com",
  projectId: "goloop-cc633",
  // Perbaiki format storageBucket di sini
  storageBucket: "goloop-cc633.appspot.com", 
  messagingSenderId: "602143974320",
  appId: "1:602143974320:web:da3d32a9bb127e8a842c75",
  measurementId: "G-S69DD3G7C8"
};

// 1. Inisialisasi aplikasi
const app = initializeApp(firebaseConfig);

// 2. Buat semua instance layanan terlebih dahulu
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 3. Ekspor semua layanan bersama-sama di akhir
export { auth, db, storage, analytics };