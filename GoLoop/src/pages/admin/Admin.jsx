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
  writeBatch, // BARU: Impor writeBatch untuk operasi atomik
  getDocs,
  Timestamp, // BARU: Impor Timestamp
} from "firebase/firestore";
import { increment } from "firebase/firestore"; // BARU: Impor increment

function AdminDashboardPage() {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]); // BARU
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const eventsRef = collection(db, "events");
    const errorCallback = (error) => console.error("Error listener:", error);

    // Query untuk Pending Events
    const qPending = query(
      eventsRef,
      where("status", "==", "pending"),
      orderBy("dateTime", "desc")
    );
    const unsubPending = onSnapshot(qPending, (snapshot) => {
      setPendingEvents(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    // Query untuk Approved Events
    const qApproved = query(
      eventsRef,
      where("status", "==", "approved"),
      where("dateTime", ">", Timestamp.now()), // BARU: Hanya yang akan datang
      orderBy("dateTime", "desc")
    );
    const unsubApproved = onSnapshot(qApproved, (snapshot) => {
      setApprovedEvents(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    
    // BARU: Query untuk Completed Events (selesai & belum dibagikan poin)
    const qCompleted = query(
      eventsRef,
      where("status", "==", "approved"),
      where("dateTime", "<=", Timestamp.now()), // Sudah lewat
      orderBy("dateTime", "desc")
    );
    const unsubCompleted = onSnapshot(qCompleted, (snapshot) => {
      setCompletedEvents(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
       setLoading(false); // Pindahkan setLoading ke sini agar UI menunggu semua data
    });

    // Query untuk Rejected Events
    const qRejected = query(
      eventsRef,
      where("status", "==", "rejected"),
      orderBy("dateTime", "desc")
    );
    const unsubRejected = onSnapshot(qRejected, (snapshot) => {
      setRejectedEvents(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    // Cleanup listeners
    return () => {
      unsubPending();
      unsubApproved();
      unsubRejected();
      unsubCompleted(); // BARU
    };
  }, []);

  const handleStatusUpdate = async (eventId, newStatus) => {
    const eventRef = doc(db, "events", eventId);
    try {
      await updateDoc(eventRef, { status: newStatus });
    } catch (error) {
      console.error("Gagal mengubah status event:", error);
    }
  };

  // BARU: Fungsi untuk mendistribusikan poin
  const handleDistributePoints = async (event) => {
    if (event.pointsDistributed) {
      alert("Poin untuk event ini sudah dibagikan.");
      return;
    }

    const { id: eventId, creatorId } = event;

    try {
        // Gunakan batch write untuk memastikan semua operasi berhasil atau gagal bersamaan
        const batch = writeBatch(db);

        // 1. Tambah 3 poin untuk organizer
        const organizerRef = doc(db, "users", creatorId);
        batch.update(organizerRef, { points: increment(3) });

        // 2. Ambil semua partisipan yang 'approved'
        const registrationsRef = collection(db, "events", eventId, "registrations");
        const q = query(registrationsRef, where("status", "==", "approved"));
        const registrationsSnapshot = await getDocs(q);

        // 3. Tambah 1 poin untuk setiap partisipan
        registrationsSnapshot.forEach((regDoc) => {
            const participantId = regDoc.data().userId;
            const participantRef = doc(db, "users", participantId);
            batch.update(participantRef, { points: increment(1) });
        });

        // 4. Tandai bahwa poin untuk event ini sudah dibagikan
        const eventRef = doc(db, "events", eventId);
        batch.update(eventRef, { pointsDistributed: true });

        // Commit semua perubahan dalam satu batch
        await batch.commit();

        alert(`Poin berhasil dibagikan untuk event: ${event.title}`);

    } catch (error) {
        console.error("Gagal membagikan poin:", error);
        alert("Terjadi kesalahan saat membagikan poin. Lihat konsol untuk detail.");
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
              {/* BARU: Kolom Aksi sekarang dinamis */}
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
                    <button onClick={() => handleStatusUpdate(event.id, "approved")} className="rounded bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700">Approve</button>
                    <button onClick={() => handleStatusUpdate(event.id, "rejected")} className="rounded bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700">Reject</button>
                  </td>
                )}
                {/* BARU: Tombol untuk membagikan poin */}
                {type === "completed" && (
                    <td className="py-2 px-4 text-center">
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
            {/* Tab Pending */}
            <button onClick={() => setActiveTab("pending")} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${ activeTab === "pending" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Menunggu Persetujuan <span className="ml-2 bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-mono">{pendingEvents.length}</span>
            </button>
            {/* Tab Approved */}
            <button onClick={() => setActiveTab("approved")} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${ activeTab === "approved" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Disetujui <span className="ml-2 bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-mono">{approvedEvents.length}</span>
            </button>
            {/* BARU: Tab Completed */}
            <button onClick={() => setActiveTab("completed")} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${ activeTab === "completed" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Selesai <span className="ml-2 bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs font-mono">{completedEvents.length}</span>
            </button>
            {/* Tab Rejected */}
            <button onClick={() => setActiveTab("rejected")} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${ activeTab === "rejected" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                Ditolak <span className="ml-2 bg-red-200 text-red-800 px-2 py-0.5 rounded-full text-xs font-mono">{rejectedEvents.length}</span>
            </button>
        </nav>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {activeTab === "pending" && renderTable(pendingEvents, "pending")}
        {activeTab === "approved" && renderTable(approvedEvents, "approved")}
        {activeTab === "completed" && renderTable(completedEvents, "completed")} {/* BARU */}
        {activeTab === "rejected" && renderTable(rejectedEvents, "rejected")}
      </div>
    </div>
  );
}

export default AdminDashboardPage;