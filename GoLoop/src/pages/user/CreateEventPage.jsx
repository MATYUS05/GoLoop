import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function CreateEventPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [eventData, setEventData] = useState({
    title: '',
    organizer: '',
    location: '',
    dateTime: '',
    capacity: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Otomatis isi nama penyelenggara dari profil pengguna
        setEventData(prev => ({ ...prev, organizer: currentUser.displayName || '' }));
      } else {
        // Jika tidak login, paksa kembali ke halaman login
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setError("Anda harus login untuk membuat event.");
    if (!eventData.title || !eventData.location || !imageFile) {
      return setError("Judul, Lokasi, dan Gambar wajib diisi.");
    }
    
    setLoading(true);
    setError('');

    try {
      // --- Langkah 1: Upload Gambar ke Cloudinary ---
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      
      const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

      const response = await fetch(url, { method: "POST", body: formData });
      const data = await response.json();
      
      if (!data.secure_url) {
        throw new Error("Gagal mengupload gambar ke Cloudinary.");
      }

      const imageUrl = data.secure_url;

      // --- Langkah 2: Simpan data event ke Firestore ---
      const newEvent = {
        ...eventData,
        imageUrl: imageUrl,
        capacity: Number(eventData.capacity),
        dateTime: Timestamp.fromDate(new Date(eventData.dateTime)),
        creatorId: user.uid, // Simpan ID pembuat event
        registered: 0,
        status: 'pending' // Status awal saat dibuat
      };

      await addDoc(collection(db, "events"), newEvent);

      alert("Event berhasil dibuat dan sedang menunggu persetujuan admin.");
      navigate("/my-event"); // Arahkan ke halaman MyEventsPage setelah submit

    } catch (err) {
      console.error("Gagal membuat event:", err);
      // Tampilkan pesan error yang lebih spesifik
      setError(`Terjadi kesalahan saat menyimpan event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Buat Event Baru</h1>
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Judul Event</label>
          <input type="text" name="title" id="title" value={eventData.title} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
        </div>
        <div>
          <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">Penyelenggara</label>
          <input type="text" name="organizer" id="organizer" value={eventData.organizer} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
        </div>
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokasi (Kota)</label>
          <input type="text" name="location" id="location" value={eventData.location} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
        </div>
        
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Gambar Event</label>
          <input type="file" name="image" id="image" accept="image/*" onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" required />
        </div>

        <div>
          <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">Tanggal & Waktu</label>
          <input type="datetime-local" name="dateTime" id="dateTime" value={eventData.dateTime} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
        </div>
        <div>
          <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Kapasitas Peserta</label>
          <input type="number" name="capacity" id="capacity" min="1" value={eventData.capacity} onChange={handleChange} className="mt-1 block w-full p-2 border rounded-md" required />
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="w-full bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-800 disabled:bg-green-400">
          {loading ? 'Menyimpan...' : 'Submit Event'}
        </button>
      </form>
    </div>
  );
}

export default CreateEventPage;