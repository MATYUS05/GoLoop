import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { FcGoogle } from "react-icons/fc";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkAndRedirect = async (user) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists() && userDoc.data().role === "admin") {
        navigate("/admindashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // Menangkap error jika ada masalah membaca data user dari Firestore
      console.error("Gagal membaca data user:", err);
      setError("Gagal memverifikasi role pengguna.");
    }
  };

  // --- FUNGSI INI YANG DIUBAH ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await checkAndRedirect(userCredential.user);
    } catch (err) {
      // Memberikan pesan error yang lebih spesifik
      console.error("Login Error Code:", err.code);
      switch (err.code) {
        case 'auth/user-not-found':
          setError("Email tidak terdaftar.");
          break;
        case 'auth/wrong-password':
          setError("Password yang Anda masukkan salah.");
          break;
        case 'auth/user-disabled':
          setError("Akun ini telah dinonaktifkan oleh admin.");
          break;
        default:
          setError("Gagal login. Silakan coba beberapa saat lagi.");
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          location: '',
          role: 'user',
          createdAt: Timestamp.now(),
          points: 0,
        });
      }
      
      await checkAndRedirect(user);

    } catch (err) {
      console.error("Google Sign-In Error:", err);
      setError("Gagal login dengan Google. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX (Tampilan) tidak ada perubahan, jadi tidak perlu disalin ulang
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-[#3E532D] hover:underline font-medium"
      >
        ←
      </button>
      <h2
        className="text-2xl font-bold py-6 text-center"
        style={{ color: "#3E532D" }}
      >
        Login ke akunmu
      </h2>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-md border border-gray-200">
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <label className="text-md font-bold" style={{ color: "#3E532D" }}>
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E532D]"
            required
          />
          <label className="text-md font-bold" style={{ color: "#3E532D" }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Kata sandi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E532D]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-semibold text-white rounded-xl bg-[#3E532D] hover:bg-[#334726] transition disabled:bg-gray-400"
          >
            {loading ? "Masuk..." : "Login"}
          </button>
        </form>
        <div className="relative flex items-center justify-center">
          <div className="flex-grow border-t border-gray-300" />
          <span className="mx-4 text-gray-500">atau</span>
          <div className="flex-grow border-t border-gray-300" />
        </div>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:bg-gray-100"
        >
          <FcGoogle size={20} />
          Masuk dengan Google
        </button>
        {error && <p className="text-sm text-center text-red-500">{error}</p>}
        <div className="text-sm text-center text-gray-600">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-semibold text-[#3E532D] hover:underline"
          >
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;