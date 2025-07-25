import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteField,
    writeBatch, // <-- Impor writeBatch
    getDocs,     // <-- Impor getDocs
    increment    // <-- Impor increment
} from 'firebase/firestore';

function AdminEventCompletionReviewPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null); // Untuk menonaktifkan tombol saat proses

  useEffect(() => {
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

  // --- FUNGSI INI DIUBAH TOTAL ---
  const handleApproval = async (event, approve) => {
    setProcessingId(event.id); // Mulai proses, nonaktifkan tombol
    const eventRef = doc(db, 'events', event.id);
    
    try {
      if (approve) {
        // --- PROSES PERSETUJUAN & PEMBAGIAN POIN ---
        const organizerPoints = event.organizerPoints || 3;
        const participantPoints = event.participantPoints || 1;
        
        const batch = writeBatch(db);

        // 1. Beri poin ke penyelenggara
        const organizerRef = doc(db, "users", event.creatorId);
        batch.update(organizerRef, { poin: increment(organizerPoints) });

        // 2. Beri poin ke semua peserta yang disetujui
        const registrationsRef = collection(db, "events", event.id, "registrations");
        const regQuery = query(registrationsRef, where("status", "==", "approved"));
        const registrationsSnapshot = await getDocs(regQuery);

        registrationsSnapshot.forEach((regDoc) => {
            const participantId = regDoc.data().userId;
            const participantRef = doc(db, "users", participantId);
            batch.update(participantRef, { poin: increment(participantPoints) });
        });

        // 3. Update status event menjadi 'completed' dan tandai poin sudah dibagikan
        batch.update(eventRef, { 
            completionStatus: 'completed',
            pointsDistributed: true 
        });

        // 4. Jalankan semua operasi
        await batch.commit();
        
        alert(`Bukti disetujui dan poin berhasil dibagikan untuk event: ${event.title}`);

      } else {
        // --- PROSES PENOLAKAN BUKTI (TETAP SAMA) ---
        await updateDoc(eventRef, {
            completionStatus: 'awaiting_proof',
            completionProofImageUrl: deleteField() 
        });
        alert('Bukti ditolak. Penyelenggara dapat mengunggah bukti baru.');
      }
    } catch (err) {
      console.error("Gagal memproses persetujuan bukti:", err);
      alert('Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setProcessingId(null); // Selesai proses, aktifkan kembali tombol
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
                  <td className="p-3">{sub.organizerName || sub.creatorId}</td>
                  <td className="p-3 text-center">
                    <a href={sub.completionProofImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Lihat Bukti
                    </a>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button 
                        onClick={() => handleApproval(sub, true)} 
                        disabled={processingId === sub.id}
                        className="bg-green-600 text-white px-4 py-1 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {processingId === sub.id ? 'Memproses...' : 'Setujui & Bagikan Poin'}
                    </button>
                    <button 
                        onClick={() => handleApproval(sub, false)} 
                        disabled={processingId === sub.id}
                        className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700 disabled:bg-gray-400"
                    >
                        Tolak
                    </button>
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
