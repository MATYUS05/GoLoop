import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userData = {
        uid: user.uid,
        name: name,
        email: user.email,
        authProvider: "local",
        createdAt: Timestamp.fromDate(new Date()),
      };
      await setDoc(doc(db, "users", user.uid), userData);
      navigate("/login");
    } catch (err) {
      console.error("Error saat registrasi:", err);
      setError(err.message);
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
      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        authProvider: "google",
        createdAt: Timestamp.fromDate(new Date()),
      };
      await setDoc(doc(db, "users", user.uid), userData);
      navigate("/login");
    } catch (err) {
      console.error("Error saat Google Sign-In:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      <h2
        className="text-2xl font-bold py-6 text-center"
        style={{ color: "#3E532D" }}
      >
        Buat akun baru
      </h2>

      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-md border border-gray-200">
        <form onSubmit={handleEmailRegister} className="space-y-4">
          <label className="text-md font-bold" style={{ color: "#3E532D" }}>
            Nama Lengkap
          </label>
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E532D]"
            required
          />

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
            placeholder="Password"
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
            {loading ? "Mendaftar..." : "Daftar"}
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
          className="w-full flex items-center justify-center px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition disabled:bg-gray-100"
        >
          Daftar dengan Google
        </button>

        {error && <p className="text-sm text-center text-red-500">{error}</p>}

        <div className="text-sm text-center text-gray-600">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#3E532D] hover:underline"
          >
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
