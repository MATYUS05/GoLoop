import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { FcGoogle } from "react-icons/fc";

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkAndRedirect = async (user) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().role === "admin") {
      console.log("Admin terdeteksi, mengarahkan ke /admindashboard");
      navigate("/admindashboard");
    } else {
      console.log("User biasa terdeteksi, mengarahkan ke /dashboard");
      navigate("/dashboard");
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      await checkAndRedirect(userCredential.user);
    } catch (err) {
      console.error("Login Gagal:", err);
      setError("Email atau password salah.");
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
      await checkAndRedirect(result.user);
    } catch (err) {
      console.error("Login Google Gagal:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
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
          Daftar dengan Google
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
