import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
  writeBatch,
  getDocs,
  Timestamp,
  increment,
} from "firebase/firestore";

function AdminDashboardPage() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const eventsRef = collection(db, "events");

    // Mengurutkan data di sisi klien untuk menghindari error indeks
    const qPending = query(eventsRef, where("status", "==", "pending"));
    const unsubPending = onSnapshot(qPending, (snapshot) => {
      const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      events.sort((a, b) => b.dateTime.seconds - a.dateTime.seconds);
      setPendingEvents(events);
    });

    // --- PERBAIKAN LOGIKA PENGAMBILAN DATA ---
    // Mengambil semua event yang disetujui dalam satu listener,
    // lalu membaginya ke 'upcoming' (Disetujui) dan 'past' (Selesai) di sisi klien.
    const qApprovedMaster = query(eventsRef, where("status", "==", "approved"));
    const unsubApprovedMaster = onSnapshot(qApprovedMaster, (snapshot) => {
        const allApproved = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        
        const now = new Date();
        const upcoming = [];
        const past = [];

        allApproved.forEach(event => {
            // Cek apakah event.dateTime ada sebelum memanggil toDate()
            if (event.dateTime && event.dateTime.toDate() > now) {
                upcoming.push(event);
            } else {
                past.push(event);
            }
        });

        upcoming.sort((a, b) => b.dateTime.seconds - a.dateTime.seconds);
        past.sort((a, b) => b.dateTime.seconds - a.dateTime.seconds);

        setApprovedEvents(upcoming); // Untuk tab "Disetujui"
        setCompletedEvents(past);    // Untuk tab "Selesai"
        
        setLoading(false);
    });

    const qRejected = query(eventsRef, where("status", "==", "rejected"));
    const unsubRejected = onSnapshot(qRejected, (snapshot) => {
      const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      events.sort((a, b) => b.dateTime.seconds - a.dateTime.seconds);
      setRejectedEvents(events);
    });

    return () => {
      unsubPending();
      unsubApprovedMaster(); // Menggunakan listener utama yang baru
      unsubRejected();
    };
  }, []);

  // Fungsi ini sudah benar, tidak perlu diubah.
  const handleStatusUpdate = async (event, newStatus) => {
    const eventRef = doc(db, "events", event.id);
    try {
      await updateDoc(eventRef, { status: newStatus });
    } catch (error) {
      console.error("Gagal mengubah status event:", error);
    }
  };

  const handleDistributePoints = async (event) => {
    if (event.pointsDistributed) {
      alert("Poin untuk event ini sudah dibagikan.");
      return;
    }
    
    const organizerPoints = event.organizerPoints || 3;
    const participantPoints = event.participantPoints || 1;
    const { id: eventId, creatorId } = event;

    try {
        const batch = writeBatch(db);
        const organizerRef = doc(db, "users", creatorId);
        batch.update(organizerRef, { points: increment(organizerPoints) });

        const registrationsRef = collection(db, "events", eventId, "registrations");
        const q = query(registrationsRef, where("status", "==", "approved"));
        const registrationsSnapshot = await getDocs(q);

        registrationsSnapshot.forEach((regDoc) => {
            const participantId = regDoc.data().userId;
            const participantRef = doc(db, "users", participantId);
            batch.update(participantRef, { points: increment(participantPoints) });
        });

        const eventRef = doc(db, "events", eventId);
        batch.update(eventRef, { pointsDistributed: true });

        await batch.commit();
        alert(`Poin berhasil dibagikan untuk event: ${event.title}`);
    } catch (error) {
        console.error("Gagal membagikan poin:", error);
        alert("Terjadi kesalahan saat membagikan poin.");
    }
  };

  const renderTable = (events, type) => {
    if (loading) return <p className="text-center py-4">Memuat data...</p>;
    if (events.length === 0)
      return (
        <p className="text-center py-4 text-gray-500">
          Tidak ada event dalam kategori ini.
        </p>
      );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left font-medium text-gray-900 py-2 px-4">Judul Event</th>
              <th className="text-left font-medium text-gray-900 py-2 px-4">Penyelenggara</th>
              <th className="text-left font-medium text-gray-900 py-2 px-4">Lokasi</th>
              {(type === "pending" || type === "completed") && (
                <th className="text-center font-medium text-gray-900 py-2 px-4">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event) => (
              <tr key={event.id}>
                <td className="py-2 px-4">{event.title}</td>
                <td className="py-2 px-4 text-gray-700">{event.organizer}</td>
                <td className="py-2 px-4 text-gray-700">{event.location}</td>
                {type === "pending" && (
                  <td className="py-2 px-4 text-center space-x-2">
                    <button onClick={() => handleStatusUpdate(event, "approved")} className="rounded bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700">Approve</button>
                    <button onClick={() => handleStatusUpdate(event, "rejected")} className="rounded bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700">Reject</button>
                  </td>
                )}
                {/* --- PERBAIKAN LOGIKA UNTUK TAB "SELESAI" --- */}
                {type === "completed" && (
                    <td className="py-2 px-4 text-center">
                        {event.completionStatus === 'completed' ? (
                            <button 
                                onClick={() => handleDistributePoints(event)} 
                                disabled={event.pointsDistributed}
                                className={`rounded px-4 py-2 text-xs font-medium text-white ${
                                    event.pointsDistributed 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {event.pointsDistributed ? 'Poin Dibagikan' : 'Bagikan Poin'}
                            </button>
                        ) : (
                            <span className="text-xs italic text-gray-500">
                                {event.completionStatus === 'awaiting_proof' && 'Menunggu Bukti'}
                                {event.completionStatus === 'proof_submitted' && 'Bukti Ditinjau'}
                            </span>
                        )}
                    </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
            <button onClick={() => setActiveTab("pending")} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${ activeTab === "pending" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Menunggu Persetujuan <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-mono">{pendingEvents.length}</span>
            </button>
            <button onClick={() => setActiveTab("approved")} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${ activeTab === "approved" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Disetujui <span className="ml-2 bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-mono">{approvedEvents.length}</span>
            </button>
            <button onClick={() => setActiveTab("completed")} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${ activeTab === "completed" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Selesai <span className="ml-2 bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs font-mono">{completedEvents.length}</span>
            </button>
            <button onClick={() => setActiveTab("rejected")} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${ activeTab === "rejected" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Ditolak <span className="ml-2 bg-red-200 text-red-800 px-2 py-0.5 rounded-full text-xs font-mono">{rejectedEvents.length}</span>
            </button>
        </nav>
      </div>
      <div className="bg-white shadow-md rounded-lg">
        {activeTab === "pending" && renderTable(pendingEvents, "pending")}
        {activeTab === "approved" && renderTable(approvedEvents, "approved")}
        {activeTab === "completed" && renderTable(completedEvents, "completed")}
        {activeTab === "rejected" && renderTable(rejectedEvents, "rejected")}
      </div>
    </div>
  );
}

export default AdminDashboardPage;
