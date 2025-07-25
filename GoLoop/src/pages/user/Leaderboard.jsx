import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase'; // Sesuaikan path ke file konfigurasi firebase Anda
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'; // Ganti getDocs dengan onSnapshot

// Komponen kecil untuk menampilkan ikon peringkat
const RankIndicator = ({ rank }) => {
  const medalStyles = "text-2xl";
  if (rank === 1) return <span className={medalStyles}>🥇</span>;
  if (rank === 2) return <span className={medalStyles}>🥈</span>;
  if (rank === 3) return <span className={medalStyles}>🥉</span>;
  return <span className="text-gray-500 font-bold">{rank}</span>;
};

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Membuat query ke koleksi 'users'
    const usersCollection = collection(db, 'users');
    const q = query(
      usersCollection, 
      orderBy('poin', 'desc'), // Mengurutkan berdasarkan 'poin' dari tertinggi ke terendah
      limit(10)                 // Membatasi hanya 10 pengguna teratas
    );

    // 2. Menggunakan onSnapshot untuk listener real-time
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // Setiap kali ada perubahan data yang cocok dengan query, kode ini akan berjalan
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setLeaderboardData(users);
      setLoading(false);
      setError(null);
    }, (err) => {
      // Menangani error dari listener
      console.error("Error fetching leaderboard: ", err);
      if (err.code === 'permission-denied') {
           setError("Gagal memuat data. Anda tidak memiliki izin untuk melihat daftar ini.");
      } else {
          setError("Terjadi kesalahan saat memuat papan peringkat.");
      }
      setLoading(false);
    });

    // 3. Membersihkan listener saat komponen di-unmount
    // Ini penting untuk mencegah memory leak
    return () => unsubscribe();
    
  }, []); // Dependency array kosong agar useEffect hanya berjalan sekali

  if (loading) {
    return <div className="text-center p-8">Memuat papan peringkat...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600 bg-red-100 rounded-lg">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Papan Peringkat Teratas</h1>
      
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="min-w-full">
            {/* Header Tabel */}
            <div className="grid grid-cols-12 gap-4 bg-gray-100 p-4 font-bold text-gray-600 uppercase text-sm">
                <div className="col-span-2 text-center">Peringkat</div>
                <div className="col-span-7">Nama Pengguna</div>
                <div className="col-span-3 text-right">Poin</div>
            </div>

            {/* Body Tabel */}
            {leaderboardData.length > 0 ? (
                leaderboardData.map((user, index) => (
                    <div 
                        key={user.id} 
                        className="grid grid-cols-12 gap-4 items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        {/* Kolom Peringkat */}
                        <div className="col-span-2 text-center">
                            <RankIndicator rank={index + 1} />
                        </div>
                        {/* Kolom Nama Pengguna */}
                        <div className="col-span-7 flex items-center">
                            <img 
                                src={user.photoURL || `https://placehold.co/40x40/E2E8F0/4A5568?text=${user.nama.charAt(0)}`} 
                                alt={user.nama}
                                className="w-10 h-10 rounded-full mr-4 object-cover"
                            />
                            <span className="font-medium text-gray-800">{user.nama}</span>
                        </div>
                        {/* Kolom Poin */}
                        <div className="col-span-3 text-right font-semibold text-green-600 text-lg">
                            {/* Pastikan field 'poin' ada sebelum menampilkannya */}
                            {user.poin ? user.poin.toLocaleString('id-ID') : 0}
                        </div>
                    </div>
                ))
            ) : (
                <p className="p-8 text-center text-gray-500">Belum ada data untuk ditampilkan.</p>
            )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
