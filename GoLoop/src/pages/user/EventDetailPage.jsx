import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
  increment,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiHome,
  FiArrowLeft,
} from "react-icons/fi";

function EventDetailPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState("loading");
  const [isRegistering, setIsRegistering] = useState(false);

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

        const eventDate = eventData.dateTime.toDate();
        const now = new Date();

        if (eventDate < now) {
          setRegistrationStatus("event_passed");
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

  const handleRegister = async () => {
    if (!currentUser) return alert("Anda harus login untuk mendaftar.");

    setIsRegistering(true);
    try {
      const regRef = doc(
        db,
        "events",
        eventId,
        "registrations",
        currentUser.uid
      );
      await setDoc(regRef, {
        userId: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL || "",
        status: "pending",
        registeredAt: Timestamp.now(),
      });

      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        registered: increment(1),
      });

      setRegistrationStatus("pending");
    } catch (error) {
      console.error("Gagal mendaftar:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const renderRegisterButton = () => {
    const baseStyle =
      "font-bold py-3 rounded-lg transition-all w-full text-center";
    const statusMap = {
      event_passed: [
        "bg-gray-400 text-white cursor-not-allowed",
        "Pendaftaran Ditutup",
      ],
      is_creator: [
        "bg-gray-400 text-white cursor-not-allowed",
        "Pembuat Event",
      ],
      pending: [
        "bg-yellow-500 text-white cursor-not-allowed",
        "Menunggu Persetujuan",
      ],
      approved: [
        "bg-green-600 text-white cursor-not-allowed",
        "Sudah Terdaftar",
      ],
      can_register: [
        "bg-[#3e532d] text-white hover:bg-[#2f4123] shadow-md",
        isRegistering ? "Memproses..." : "Daftar Sekarang",
      ],
    };

    const [style, text] = statusMap[registrationStatus] || [
      "bg-gray-300",
      "Memuat status...",
    ];
    const isDisabled = registrationStatus !== "can_register";

    return (
      <button
        onClick={handleRegister}
        disabled={isDisabled || isRegistering}
        className={`${baseStyle} ${style} disabled:opacity-70 disabled:cursor-not-allowed min-h-[3.5rem] flex items-center justify-center`}
      >
        <span>{text}</span>
      </button>
    );
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

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-[#3e532d] mb-6 pb-2 border-b border-[#3e532d]/20">
                Detail Acara
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          </div>

          {/* Right Column - Event Info & Registration */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 text-[#3e532d]">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">
                      Lokasi
                    </h3>
                    <p className="font-medium text-gray-800">
                      {event.locationDetail}, {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 text-[#3e532d]">
                    <FiClock size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">
                      Waktu
                    </h3>
                    <p className="font-medium text-gray-800">
                      {eventDate}, {eventTime} WIB
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 text-[#3e532d]">
                    <FiHome size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">
                      Penyelenggara
                    </h3>
                    <p className="font-medium text-gray-800">
                      {event.organizer}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5 text-[#3e532d]">
                    <FiUsers size={20} />
                  </div>
                  <div className="w-full">
                    <h3 className="text-sm font-semibold text-gray-500 mb-1">
                      Kuota Peserta
                    </h3>
                    <p className="font-medium text-gray-800 mb-2">
                      {event.registered}/{event.capacity} orang
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#3e532d] h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            (event.registered / event.capacity) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {renderRegisterButton()}
                  <div className="mt-5 text-center">
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center text-[#3e532d] hover:text-[#2f4123] font-medium"
                    >
                      <FiArrowLeft className="mr-2" />
                      Kembali ke Daftar Event
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;
