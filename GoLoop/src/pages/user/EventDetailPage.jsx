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
  runTransaction,
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
import Footer from "../../components/common/Footer";

const OverallStatusBadge = ({ status }) => {
  let styles = "bg-gray-100 text-gray-800";
  if (status === "Pendaftaran Dibuka") {
    styles = "bg-green-100 text-green-800";
  } else if (status === "Pendaftaran Penuh") {
    styles = "bg-[#C94749] text-white";
  } else if (
    status === "Menunggu Persetujuan Admin" ||
    status === "Bukti Sedang Ditinjau" ||
    status === "Menunggu Bukti dari Penyelenggara"
  ) {
    styles = "bg-yellow-100 text-yellow-800";
  } else if (status === "Event Ditolak") {
    styles = "bg-red-100 text-red-800";
  } else if (status === "Event Telah Selesai") {
    styles = "bg-blue-100 text-blue-800";
  }
  return (
    <span
      className={`inline-block text-sm font-semibold mr-2 px-3 py-1 rounded-full mb-6 ${styles}`}
    >
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
  const [eventOverallStatus, setEventOverallStatus] = useState("Memuat...");

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

        if (eventData.status === "pending") {
          setEventOverallStatus("Menunggu Persetujuan Admin");
        } else if (eventData.status === "rejected") {
          setEventOverallStatus("Event Ditolak");
        } else if (eventData.status === "approved") {
          if (eventHasPassed) {
            switch (eventData.completionStatus) {
              case "awaiting_proof":
                setEventOverallStatus("Menunggu Bukti dari Penyelenggara");
                break;
              case "proof_submitted":
                setEventOverallStatus("Bukti Sedang Ditinjau");
                break;
              case "completed":
                setEventOverallStatus("Event Telah Selesai");
                break;
              default:
                setEventOverallStatus("Event Telah Berakhir");
            }
          } else if (isFull) {
            setEventOverallStatus("Pendaftaran Penuh");
          } else {
            setEventOverallStatus("Pendaftaran Dibuka");
          }
        }

        if (eventHasPassed) {
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
              if (regSnap.exists()) {
                setRegistrationStatus(regSnap.data().status);
              } else {
                setRegistrationStatus("can_register");
              }
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
    if (!currentUser) {
      alert("Anda harus login untuk mendaftar.");
      return;
    }

    if (eventOverallStatus !== "Pendaftaran Dibuka") {
      alert("Pendaftaran untuk event ini sudah ditutup atau penuh.");
      return;
    }

    setIsRegistering(true);

    try {
      await runTransaction(db, async (transaction) => {
        const eventRef = doc(db, "events", eventId);
        const eventDoc = await transaction.get(eventRef);

        if (!eventDoc.exists()) {
          throw new Error("Event tidak ditemukan.");
        }

        const eventData = eventDoc.data();

        if (eventData.registered >= eventData.capacity) {
          throw new Error("Maaf, pendaftaran sudah penuh.");
        }

        const regRef = doc(
          db,
          "events",
          eventId,
          "registrations",
          currentUser.uid
        );

        transaction.update(eventRef, { registered: increment(1) });

        transaction.set(regRef, {
          userId: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL || "",
          status: "pending",
          registeredAt: Timestamp.now(),
        });
      });

      setRegistrationStatus("pending");
    } catch (error) {
      console.error("Gagal mendaftar:", error);
      alert(error.message || "Terjadi kesalahan saat mendaftar.");
    } finally {
      setIsRegistering(false);
    }
  };

  const renderRegisterButton = () => {
    const baseStyle =
      "font-bold py-3 rounded-lg transition-all w-full text-center";

    if (eventOverallStatus === "Pendaftaran Penuh") {
      return (
        <button
          disabled
          className={`${baseStyle} bg-[#C94749] text-white cursor-not-allowed`}
        >
          Pendaftaran Penuh
        </button>
      );
    }

    const statusMap = {
      event_passed: [
        "bg-gray-400 text-white cursor-not-allowed",
        "Event Telah Berakhir",
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
              <OverallStatusBadge status={eventOverallStatus} />
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
      <Footer />
    </div>
  );
}

export default EventDetailPage;
