
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase/firebase"; // Hapus 'storage' karena tidak dipakai di sini
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  collectionGroup,
  getDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
// Hapus import untuk storage

function MyEventsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    // Listener untuk event yang dibuat oleh user
    const myEventsQuery = query(
      collection(db, "events"),
      where("creatorId", "==", user.uid),
      orderBy("dateTime", "desc")
    );
    const unsubscribeMyEvents = onSnapshot(myEventsQuery, (snapshot) => {
      setMyEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Listener untuk event yang diikuti oleh user
    const joinedEventsQuery = query(
        collectionGroup(db, 'registrations'),
        where('userId', '==', user.uid)
    );
    const unsubscribeJoinedEvents = onSnapshot(joinedEventsQuery, async (snapshot) => {
        const promises = snapshot.docs.map(async (regDoc) => {
          const registrationData = regDoc.data();
          const eventId = regDoc.ref.parent.parent.id;
          const eventRef = doc(db, 'events', eventId);
          const eventSnap = await getDoc(eventRef);

          if (eventSnap.exists()) {
            return {
              ...eventSnap.data(),
              id: eventSnap.id,
              registrationStatus: registrationData.status,
            };
          }
          return null;
        });

        const results = (await Promise.all(promises)).filter(Boolean);
        results.sort((a, b) => b.dateTime.seconds - a.dateTime.seconds);
        setJoinedEvents(results);
    });

    return () => {
      unsubscribeMyEvents();
      unsubscribeJoinedEvents();
    };
  }, [user]);

  // --- FUNGSI INI YANG DIUBAH TOTAL ---
  // Menggunakan logika Cloudinary, bukan Firebase Storage
  const handleProofUpload = async (eventId, file) => {
    if (!file) return;
    setIsUploading(eventId);

    try {
      // 1. Siapkan data untuk dikirim ke Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      // 2. Kirim request POST ke API Cloudinary
      const response = await fetch(url, { method: "POST", body: formData });
      const data = await response.json();
      if (!data.secure_url) {
        throw new Error("Gagal mengupload gambar ke Cloudinary.");
      }
      const imageUrl = data.secure_url;

      // 3. Update dokumen event di Firestore dengan URL dari Cloudinary
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        completionStatus: 'proof_submitted',
        completionProofImageUrl: imageUrl,
      });

      alert("Bukti berhasil diunggah dan akan ditinjau oleh admin.");
    } catch (error) {
      console.error("Gagal mengunggah bukti:", error);
      alert("Terjadi kesalahan saat mengunggah bukti.");
    } finally {
      setIsUploading(null);
    }
  };
  
  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const statusText = status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || "bg-gray-100"}`}>
        {statusText}
      </span>
    );
  };

  if (loading) {
    return <p className="text-center p-8">Memuat data pengguna...</p>;
  }

  return (
    // ... JSX (Tampilan) tidak ada perubahan, jadi tidak perlu disalin ulang
    <div className="container mx-auto p-4 md:p-8 space-y-12">
      <h1 className="text-3xl font-bold">Aktivitas Saya</h1>
      <section>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Event yang Saya Buat</h2>
            <Link to="/create-event" className="rounded-md bg-green-700 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-green-800">
              + Buat Event Baru
            </Link>
        </div>
        <div className="bg-white p-4 rounded-lg shadow min-h-[80px]">
          {myEvents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {myEvents.map((event) => {
                const eventDate = event.dateTime.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                const eventHasPassed = event.dateTime.toDate() < new Date();
                const showUploadOption = eventHasPassed && event.status === 'approved' && event.completionStatus === 'awaiting_proof';

                return (
                  <li key={event.id} className="py-4">
                    <div className="flex flex-wrap items-center space-x-4">
                        <img src={event.imageUrl} alt={event.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                          <h3 className="font-bold text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600">📍 {event.location}</p>
                          <p className="text-xs text-gray-500">📅 {eventDate}</p>
                           {event.status === 'approved' && (
                             <Link to={`/my-event/participants/${event.id}`} className="mt-2 inline-block bg-blue-600 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-blue-700 transition">
                               Lihat Partisipan
                             </Link>
                           )}
                        </div>
                        <div className="flex-shrink-0">
                           <StatusBadge status={event.status} />
                        </div>
                    </div>
                    <div className="w-full mt-4 pt-4 border-t border-gray-100">
                      {showUploadOption && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">✅ Event telah selesai. Unggah bukti pelaksanaan (misal: foto kegiatan) untuk menyelesaikan event.</p>
                          <input
                            type="file"
                            accept="image/png, image/jpeg"
                            disabled={isUploading === event.id}
                            onChange={(e) => handleProofUpload(event.id, e.target.files[0])}
                            className="mt-2 text-sm text-slate-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50"
                          />
                          {isUploading === event.id && <p className="text-xs text-blue-600 mt-1">Mengunggah...</p>}
                        </div>
                      )}
                      {event.completionStatus === 'proof_submitted' && (
                        <p className="text-sm text-yellow-600 font-medium">⏳ Bukti Anda sedang ditinjau oleh Admin. Mohon tunggu.</p>
                      )}
                      {event.completionStatus === 'completed' && (
                        <p className="text-sm text-green-600 font-medium">🎉 Event telah selesai dan diverifikasi. Poin telah dibagikan kepada peserta.</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-center pt-5">Anda belum membuat event apapun.</p>
          )}
        </div>
      </section>
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Event yang Saya Ikuti</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow min-h-[80px]">
          {joinedEvents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {joinedEvents.map((event) => {
                const eventDate = event.dateTime.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <li key={event.id} className="py-4 flex items-center space-x-4">
                    <img src={event.imageUrl} alt={event.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">📍 {event.location}</p>
                      <p className="text-xs text-gray-500">📅 {eventDate}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <StatusBadge status={event.registrationStatus} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500 text-center pt-5">Anda belum mengikuti event apapun.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MyEventsPage;
