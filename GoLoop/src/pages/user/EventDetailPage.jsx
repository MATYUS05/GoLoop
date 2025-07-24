import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, Timestamp, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { FiMapPin, FiCalendar, FiClock, FiUsers, FiHome } from 'react-icons/fi';

function EventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState('loading');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);
  
  useEffect(() => {
    if (!eventId) return;

    const docRef = doc(db, 'events', eventId);
    
    const unsubscribeEvent = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const eventData = { id: docSnap.id, ...docSnap.data() };
        setEvent(eventData);

        const eventDate = eventData.dateTime.toDate();
        const now = new Date();

        if (eventDate < now) {
          setRegistrationStatus('event_passed');
        } else if (currentUser) {
          if (currentUser.uid === eventData.creatorId) {
            setRegistrationStatus('is_creator');
          } else {
            const regRef = doc(db, 'events', eventId, 'registrations', currentUser.uid);
            getDoc(regRef).then(regSnap => {
              if (regSnap.exists()) {
                setRegistrationStatus(regSnap.data().status);
              } else {
                setRegistrationStatus('can_register');
              }
            });
          }
        } else {
          setRegistrationStatus('can_register');
        }
      } else {
        setEvent(null);
      }
      setLoading(false);
    });

    return () => unsubscribeEvent();

  }, [eventId, currentUser]);

  const handleRegister = async () => {
    if (!currentUser) {
      alert("Anda harus login untuk mendaftar.");
      return;
    }
    setIsRegistering(true);
    try {
      const regRef = doc(db, 'events', eventId, 'registrations', currentUser.uid);
      await setDoc(regRef, {
        userId: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL || '',
        status: 'pending',
        registeredAt: Timestamp.now(),
      });

      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        registered: increment(1)
      });
      
      setRegistrationStatus('pending'); 

    } catch (error) {
      console.error("Gagal mendaftar:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const renderRegisterButton = () => {
    switch (registrationStatus) {
      case 'event_passed':
        return <button disabled className="bg-gray-400 text-white font-bold py-3 px-12 rounded-lg cursor-not-allowed">Pendaftaran Telah Ditutup</button>;
      case 'is_creator':
        return <button disabled className="bg-gray-400 text-white font-bold py-3 px-12 rounded-lg cursor-not-allowed">Anda Pembuat Event</button>;
      case 'pending':
        return <button disabled className="bg-yellow-500 text-white font-bold py-3 px-12 rounded-lg cursor-not-allowed">Menunggu Persetujuan</button>;
      case 'approved':
        return <button disabled className="bg-green-600 text-white font-bold py-3 px-12 rounded-lg cursor-not-allowed">Anda Sudah Terdaftar</button>;
      case 'can_register':
        return (
          <button onClick={handleRegister} disabled={isRegistering} className="bg-[#f4d699] text-[#3e532d] font-bold py-3 px-12 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {isRegistering ? 'Memproses...' : 'Register here!'}
          </button>
        );
      default:
        return <button disabled className="bg-gray-300 py-3 px-12 rounded-lg">Memuat status...</button>;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Memuat event...</p></div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center"><p>Event tidak ditemukan.</p></div>;

  const eventDate = event.dateTime.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const eventTime = event.dateTime.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white">
      <div className="w-full h-64 md:h-96">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
      </div>

      <div className="bg-[#dde5d6] text-[#3e532d] p-8 md:p-12 lg:p-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            
            <div className="md:col-span-2">
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{event.title}</h1>
              <h2 className="text-2xl font-bold mb-3">About</h2>
              <p className="text-base leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            <div className="md:col-span-1">
              <div className="text-right mb-8">
                <p className="font-semibold">Coming Soon!</p>
                <p>{eventDate}</p>
              </div>
              <div className="border-l-2 border-[#3e532d]/50 pl-6 space-y-4">
                <div className="flex items-start gap-3">
                  <FiMapPin size={20} className="flex-shrink-0 mt-1"/>
                  <span>{event.locationDetail}, {event.location}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiCalendar size={20} className="flex-shrink-0 mt-1"/>
                  <span>{eventDate}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiClock size={20} className="flex-shrink-0 mt-1"/>
                  <span>{eventTime} WIB</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiHome size={20} className="flex-shrink-0 mt-1"/>
                  <span>{event.organizer}</span>
                </div>
                <div className="flex items-start gap-3">
                  <FiUsers size={20} className="flex-shrink-0 mt-1"/>
                  <span>{event.registered}/{event.capacity} Peserta</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            {renderRegisterButton()}
          </div>
          
          <div className="text-center mt-6">
             <Link to="/dashboard" className="text-sm text-[#3e532d] hover:underline">
                &#8592; Kembali ke Daftar Event
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;