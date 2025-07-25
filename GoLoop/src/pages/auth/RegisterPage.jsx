import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ displayName: '', email: '', password: '' });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password) {
      return setError("Semua field wajib diisi.");
    }
    if (formData.password.length < 6) {
      return setError("Password minimal harus 6 karakter.");
    }

    setLoading(true);
    setError("");
    try {
      // Buat user di Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Update nama di profil Authentication
      await updateProfile(user, { displayName: formData.displayName });

      // Buat dokumen user di Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: formData.displayName,
        email: formData.email,
        location: '',
        role: 'user',
        createdAt: Timestamp.now(),
        points: 0,
      });
      
      // Arahkan ke halaman utama setelah berhasil
      navigate("/login");

    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar.');
      } else {
        setError("Gagal mendaftar. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
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
        Buat Akun Baru
      </h2>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-md border border-gray-200">
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-md font-bold" style={{ color: "#3E532D" }}>
              Nama Lengkap
            </label>
            <input
              type="text"
              name="displayName"
              placeholder="Nama Anda"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E532D]"
              required
            />
          </div>
          <div>
            <label className="text-md font-bold" style={{ color: "#3E532D" }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E532D]"
              required
            />
          </div>
          <div>
            <label className="text-md font-bold" style={{ color: "#3E532D" }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Minimal 6 karakter"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3E532D]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 font-semibold text-white rounded-xl bg-[#3E532D] hover:bg-[#334726] transition disabled:bg-gray-400"
          >
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>
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