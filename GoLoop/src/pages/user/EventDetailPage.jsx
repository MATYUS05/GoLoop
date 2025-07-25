import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, Timestamp, updateDoc, increment, onSnapshot, runTransaction } from 'firebase/firestore'; // Import runTransaction
import { db, auth } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiHome } from 'react-icons/fi';

// Komponen badge status dengan tambahan logika untuk "Penuh"
const OverallStatusBadge = ({ status }) => {
    let styles = "bg-gray-100 text-gray-800";
    if (status === 'Pendaftaran Dibuka') {
        styles = "bg-green-100 text-green-800";
    } else if (status === 'Pendaftaran Penuh') {
        styles = "bg-orange-100 text-orange-800"; // Warna baru untuk status Penuh
    } else if (status === 'Menunggu Persetujuan Admin' || status === 'Bukti Sedang Ditinjau' || status === 'Menunggu Bukti dari Penyelenggara') {
        styles = "bg-yellow-100 text-yellow-800";
    } else if (status === 'Event Ditolak') {
        styles = "bg-red-100 text-red-800";
    } else if (status === 'Event Telah Selesai') {
        styles = "bg-blue-100 text-blue-800";
    }
    return (
        <span className={`inline-block text-sm font-semibold mr-2 px-3 py-1 rounded-full mb-6 ${styles}`}>
            {status}
        </span>
    );
};


function EventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState("loading");
  const [isRegistering, setIsRegistering] = useState(false);
  const [eventOverallStatus, setEventOverallStatus] = useState('Memuat...');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!eventId) return;

    const docRef = doc(db, "events", eventId);
    const unsubscribeEvent = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const eventData = { id: docSnap.id, ...docSnap.data() };
        setEvent(eventData);

        const eventHasPassed = eventData.dateTime.toDate() < new Date();
        const isFull = eventData.registered >= eventData.capacity;

        if (eventData.status === 'pending') {
          setEventOverallStatus('Menunggu Persetujuan Admin');
        } else if (eventData.status === 'rejected') {
          setEventOverallStatus('Event Ditolak');
        } else if (eventData.status === 'approved') {
          if (eventHasPassed) {
            switch (eventData.completionStatus) {
              case 'awaiting_proof':
                setEventOverallStatus('Menunggu Bukti dari Penyelenggara');
                break;
              case 'proof_submitted':
                setEventOverallStatus('Bukti Sedang Ditinjau');
                break;
              case 'completed':
                setEventOverallStatus('Event Telah Selesai');
                break;
              default:
                setEventOverallStatus('Event Telah Berakhir');
            }
          } else if (isFull) {
            setEventOverallStatus('Pendaftaran Penuh');
          } else {
            setEventOverallStatus('Pendaftaran Dibuka');
          }
        }

        if (eventHasPassed) {
          setRegistrationStatus('event_passed');
        } else if (currentUser) {
          if (currentUser.uid === eventData.creatorId) {
            setRegistrationStatus("is_creator");
          } else {
            const regRef = doc(
              db,
              "events",
              eventId,
              "registrations",
              currentUser.uid
            );
            getDoc(regRef).then((regSnap) => {
              setRegistrationStatus(
                regSnap.exists() ? regSnap.data().status : "can_register"
              );
            });
          }
        } else {
          setRegistrationStatus("can_register");
        }
      } else {
        setEvent(null);
      }
      setLoading(false);
    });

    return () => unsubscribeEvent();
  }, [eventId, currentUser]);

  // --- FUNGSI INI DIUBAH MENGGUNAKAN TRANSAKSI ---
  const handleRegister = async () => {
    if (!currentUser) {
      alert("Anda harus login untuk mendaftar.");
      return;
    }
    // Pengecekan awal di sisi klien untuk UX
    if (eventOverallStatus !== 'Pendaftaran Dibuka') {
      alert("Pendaftaran untuk event ini sudah ditutup atau penuh.");
      return;
    }
    
    setIsRegistering(true);
    
    try {
      // Menjalankan pendaftaran sebagai transaksi untuk mencegah race condition
      await runTransaction(db, async (transaction) => {
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await transaction.get(eventRef);

        if (!eventDoc.exists()) {
          throw new Error("Event tidak ditemukan.");
        }

        const eventData = eventDoc.data();
        
        // Pengecekan krusial di dalam transaksi
        if (eventData.registered >= eventData.capacity) {
          throw new Error("Maaf, pendaftaran sudah penuh.");
        }

        // Jika masih ada tempat, lanjutkan pendaftaran
        const regRef = doc(db, 'events', eventId, 'registrations', currentUser.uid);
        
        // 1. Update dokumen event (tambah jumlah pendaftar)
        transaction.update(eventRef, { registered: increment(1) });
        
        // 2. Buat dokumen pendaftaran baru untuk pengguna
        transaction.set(regRef, {
          userId: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL || '',
          status: 'pending',
          registeredAt: Timestamp.now(),
        });
      });

      // Jika transaksi berhasil, UI akan update via onSnapshot
      setRegistrationStatus('pending');

    } catch (error) {
      console.error("Gagal mendaftar:", error);
      // Menampilkan pesan error spesifik dari transaksi
      alert(error.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setIsRegistering(false);
    }
  };

  const renderActionButton = () => {
    switch (registrationStatus) {
      case 'event_passed':
        return <button disabled className="bg-gray-400 text-white font-bold py-3 px-12 rounded-lg cursor-not-allowed">Event Telah Berakhir</button>;
      case 'is_creator':
        return <button disabled className="bg-gray-400 text-white font-bold py-3 px-12 rounded-lg cursor-not-allowed">Anda Pembuat Event</button>;
      case 'pending':
        return <button disabled className="bg-yellow-500 text-white font-bold py-3 px-12 rounded-lg cursor-not-allowed">Menunggu Persetujuan</button>;
      case 'approved':
        return <button disabled className="bg-green-600 text-white font-bold py-3 px-12 rounded-lg cursor-not-allowed">Anda Sudah Terdaftar</button>;
      case 'can_register':
        if (eventOverallStatus === 'Pendaftaran Penuh') {
            return <button disabled className="bg-orange-500 text-white font-bold py-3 px-12 rounded-lg cursor-not-allowed">Pendaftaran Penuh</button>;
        }
        return (
          <button onClick={handleRegister} disabled={isRegistering || eventOverallStatus !== 'Pendaftaran Dibuka'} className="bg-[#f4d699] text-[#3e532d] font-bold py-3 px-12 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {isRegistering ? 'Memproses...' : 'Register here!'}
          </button>
        );
      default:
        return <button disabled className="bg-gray-300 py-3 px-12 rounded-lg">Memuat status...</button>;
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Memuat event...
      </div>
    );
  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Event tidak ditemukan.
      </div>
    );

  const eventDate = event.dateTime.toDate().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const eventTime = event.dateTime
    .toDate()
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-64 md:h-96">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-8 text-white">
            <h1 className="text-2xl md:text-4xl font-bold max-w-3xl">
              {event.title}
            </h1>
            <div className="flex items-center mt-2">
              <FiCalendar className="mr-2" />
              <span className="font-medium">{eventDate}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#dde5d6] text-[#3e532d] p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
              <OverallStatusBadge status={eventOverallStatus} />
              <h2 className="text-2xl font-bold mb-3 mt-4">About</h2>
              <p className="text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

            <div className="md:col-span-1">
              <div className="text-right mb-8">
                <p className="font-semibold">Coming Soon!</p>
                <p>{eventDate}</p>
              </div>
              <div className="border-l-2 border-[#3e532d]/50 pl-6 space-y-4">
                <div className="flex items-start gap-3"><FiMapPin size={20} className="flex-shrink-0 mt-1"/><span>{event.locationDetail}, {event.location}</span></div>
                <div className="flex items-start gap-3"><FiCalendar size={20} className="flex-shrink-0 mt-1"/><span>{eventDate}</span></div>
                <div className="flex items-start gap-3"><FiClock size={20} className="flex-shrink-0 mt-1"/><span>{eventTime} WIB</span></div>
                <div className="flex items-start gap-3"><FiHome size={20} className="flex-shrink-0 mt-1"/><span>{event.organizer}</span></div>
                <div className="flex items-start gap-3"><FiUsers size={20} className="flex-shrink-0 mt-1"/><span>{event.registered}/{event.capacity} Peserta</span></div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            {renderActionButton()}
          </div>
          
          <div className="text-center mt-6">
            <Link to="/dashboard" className="text-sm text-[#3e532d] hover:underline">
              &#8592; Kembali ke Daftar Event
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default EventDetailPage;
