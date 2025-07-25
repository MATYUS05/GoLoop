import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Impor dari kedua versi digabungkan
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
import { MdLocationOn, MdCalendarToday } from "react-icons/md";
import emptyTrash from "../../assets/img/empty-trash.png";
import emptyTrash1 from "../../assets/img/empty-trash1.png";
import Footer from "../../components/common/Footer";

function MyEventsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  // State 'isUploading' dari versi fungsional dipertahankan
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

  // Fungsi handleProofUpload dari versi fungsional dipertahankan
  const handleProofUpload = async (eventId, file) => {
    if (!file) return;
    setIsUploading(eventId);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      const response = await fetch(url, { method: "POST", body: formData });
      const data = await response.json();
      if (!data.secure_url) {
        throw new Error("Gagal mengupload gambar ke Cloudinary.");
      }
      const imageUrl = data.secure_url;

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

  // Menggunakan struktur JSX dan styling dari versi kedua
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4 md:p-8 space-y-12">
        <h1 className="text-3xl font-bold text-[#2C441E]">Aktivitas Saya</h1>

        {/* My Events */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-[#2C441E]">
              Event yang Saya Buat
            </h2>
            <Link
              to="/create-event"
              className="rounded-3xl bg-[#2C441E] py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#8D964D]"
            >
              + Buat Event Baru
            </Link>
          </div>
          <div
            className="bg-white p-4 rounded-lg shadow min-h-[80px]"
            style={{ boxShadow: "0 2px 2px rgba(0,0,0,0.1), 0 -2px 0px rgba(0,0,0,0.05)" }}
          >
            {myEvents.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {myEvents.map((event) => {
                  const eventDate = event.dateTime.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                  // Logika untuk menampilkan opsi upload dari versi fungsional
                  const eventHasPassed = event.dateTime.toDate() < new Date();
                  const showUploadOption = eventHasPassed && event.status === 'approved' && event.completionStatus === 'awaiting_proof';

                  return (
                    <li key={event.id} className="py-4">
                      <div className="flex flex-wrap items-center space-x-4">
                        <img src={event.imageUrl} alt={event.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                        <div className="flex-grow">
                          <h3 className="font-bold text-gray-900">{event.title}</h3>
                          {/* Menggunakan ikon dari versi UI kedua */}
                          <p className="text-xs text-[#2C441E] flex items-center gap-1"><MdLocationOn className="text-lg" />{event.location}</p>
                          <p className="text-xs text-[#2C441E] flex items-center gap-1"><MdCalendarToday className="text-sm" />{eventDate}</p>
                          {event.status === 'approved' && (
                            <Link to={`/my-event/participants/${event.id}`} className="mt-2 inline-block bg-[#2C441E] text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-[#8D964D] transition">
                              Lihat Partisipan
                            </Link>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <StatusBadge status={event.status} />
                        </div>
                      </div>
                      {/* Bagian logika upload bukti dipertahankan sepenuhnya */}
                      <div className="w-full mt-4 pt-4 border-t border-gray-100">
                        {showUploadOption && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">✅ Event telah selesai. Unggah bukti pelaksanaan untuk menyelesaikan event.</p>
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
              // Menggunakan tampilan empty state dari versi UI kedua
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <img src={emptyTrash1} alt="No events" className="w-[500px] mb-3" />
                <p>Anda belum membuat event apapun.</p>
              </div>
            )}
          </div>
        </section>

        {/* Joined Events */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-[#2C441E]">
              Event yang Saya Ikuti
            </h2>
          </div>
          <div
            className="bg-white p-4 rounded-lg min-h-[80px]"
            style={{ boxShadow: "0 2px 2px rgba(0,0,0,0.1), 0 -2px 0px rgba(0,0,0,0.05)" }}
          >
            {joinedEvents.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {joinedEvents.map((event) => {
                  const eventDate = event.dateTime.toDate().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
                  return (
                    <li key={event.id} className="py-4 flex items-center space-x-4">
                      <img src={event.imageUrl} alt={event.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                      <div className="flex-grow">
                        <h3 className="font-bold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1"><MdLocationOn className="text-lg" />{event.location}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><MdCalendarToday className="text-sm" />{eventDate}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <StatusBadge status={event.registrationStatus} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              // Menggunakan tampilan empty state dari versi UI kedua
              <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                <img src={emptyTrash} alt="No events" className="w-[200px] mb-3" />
                <p>Anda belum mengikuti event apapun.</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default MyEventsPage;
