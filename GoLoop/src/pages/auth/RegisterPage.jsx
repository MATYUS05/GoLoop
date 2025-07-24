import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider 
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase"; // Sesuaikan path

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError("Semua kolom wajib diisi.");
      return; 
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (!user || !user.uid) {
        throw new Error("Gagal mendapatkan UID pengguna setelah registrasi.");
      }
      const userData = {
        uid: user.uid,
        name: name,
        email: user.email,
        authProvider: "local",
        createdAt: Timestamp.fromDate(new Date())
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
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user || !user.uid) {
        throw new Error("Gagal mendapatkan UID pengguna dari Google Sign-In.");
      }
      const userData = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        authProvider: "google",
        createdAt: Timestamp.fromDate(new Date())
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Buat Akun Baru</h2>
        <form onSubmit={handleEmailRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nama Lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>
        <div className="relative flex items-center justify-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500">atau</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <button 
          onClick={handleGoogleSignIn} 
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 font-bold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-200"
        >
          Daftar dengan Google
        </button>
        {error && <p className="text-sm text-center text-red-500">{error}</p>}
        <div className="text-sm text-center">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Login di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;