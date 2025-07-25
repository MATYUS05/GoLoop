import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteField } from 'firebase/firestore';

function AdminEventCompletionReviewPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Query untuk event yang statusnya 'proof_submitted'
    const q = query(
      collection(db, 'events'),
      where('completionStatus', '==', 'proof_submitted')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubmissions(subs);
      setLoading(false);
    }, (err) => {
      console.error("Gagal mengambil data:", err);
      setError("Gagal mengambil data dari server.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApproval = async (eventId, approve) => {
    const eventRef = doc(db, 'events', eventId);
    
    try {
      if (approve) {
        // --- PROSES PERSETUJUAN BUKTI ---
        // Hanya mengubah status penyelesaian menjadi 'completed'.
        // Pembagian poin akan dilakukan di halaman Admin Dashboard.
        await updateDoc(eventRef, {
          completionStatus: 'completed'
        });
        alert('Bukti penyelesaian event disetujui.');

      } else {
        // --- PROSES PENOLAKAN BUKTI ---
        // Kembalikan status agar penyelenggara bisa upload ulang.
        await updateDoc(eventRef, {
            completionStatus: 'awaiting_proof',
            // Hapus URL gambar bukti yang ditolak agar bersih.
            completionProofImageUrl: deleteField() 
        });
        alert('Bukti ditolak. Penyelenggara dapat mengunggah bukti baru.');
      }
    } catch (err) {
      console.error("Gagal memproses persetujuan bukti:", err);
      alert('Terjadi kesalahan saat memproses permintaan.');
    }
  };

  if (loading) return <p className="p-8">Memuat data pengajuan...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Tinjau Bukti Penyelesaian Event</h1>
      {submissions.length === 0 ? (
        <p>Tidak ada pengajuan bukti untuk ditinjau saat ini.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Nama Event</th>
                <th className="text-left p-3">Penyelenggara</th>
                <th className="text-center p-3">Bukti Gambar</th>
                <th className="text-center p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id} className="border-b">
                  <td className="p-3 font-medium">{sub.title}</td>
                  <td className="p-3">{sub.organizer}</td>
                  <td className="p-3 text-center">
                    <a href={sub.completionProofImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Lihat Bukti
                    </a>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button onClick={() => handleApproval(sub.id, true)} className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700">Setujui</button>
                    <button onClick={() => handleApproval(sub.id, false)} className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700">Tolak</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminEventCompletionReviewPage;
