import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../../firebase/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!formData.displayName || !formData.email || !formData.password) {
      return setError('Semua field wajib diisi.');
    }
    if (formData.password.length < 6) {
      return setError('Password minimal harus 6 karakter.');
    }

    setLoading(true);
    setError('');

    try {
      // Langkah 1: Buat user di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Langkah 2: Update profil di Firebase Authentication (untuk nama)
      await updateProfile(user, {
        displayName: formData.displayName,
      });

      // Langkah 3: Buat dokumen untuk user di koleksi 'users' Firestore
      // Ini adalah langkah kunci yang menyelesaikan masalah Anda
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: formData.displayName,
        email: formData.email,
        location: '', // Nilai awal untuk field tambahan
        role: 'user', // Peran default untuk pengguna baru
        createdAt: Timestamp.now(),
      });

      // Arahkan ke halaman utama setelah berhasil mendaftar
      navigate('/');

    } catch (err) {
      console.error("Gagal mendaftar:", err);
      // Terjemahkan pesan error Firebase agar lebih mudah dimengerti
      if (err.code === 'auth/email-already-in-use') {
        setError('Email ini sudah terdaftar. Silakan gunakan email lain.');
      } else {
        setError('Gagal mendaftar. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Buat Akun Baru</h2>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="displayName"
              id="displayName"
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Alamat Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={handleChange}
              className="w-full px-3 py-2 mt-1 border rounded-md"
              required
            />
          </div>
          
          {error && <p className="text-sm text-center text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white bg-green-700 rounded-md hover:bg-green-800 disabled:bg-green-400"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-green-700 hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;