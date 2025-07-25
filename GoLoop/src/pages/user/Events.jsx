import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Footer from "../../components/common/Footer";
import { HiOutlineLocationMarker } from "react-icons/hi";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import EventCard from "../../components/common/EventCard";
import heroImage from "../../assets/img/hero-clean.svg";

function EventsPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableLocations, setAvailableLocations] = useState([]);
  // Default ke "" yang akan kita artikan sebagai "Semua Lokasi"
  const [selectedLocation, setSelectedLocation] = useState("");

  // Fetch daftar lokasi unik yang tersedia dari semua event
  useEffect(() => {
    const fetchLocations = async () => {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, where("status", "==", "approved"));
      const querySnapshot = await getDocs(q);
      const locations = querySnapshot.docs.map((doc) => doc.data().location);
      const uniqueLocations = [...new Set(locations)].sort(); // Urutkan lokasi secara alfabetis
      setAvailableLocations(uniqueLocations);
    };
    fetchLocations();
  }, []);

  // Cek status login dan atur lokasi default pengguna
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data();
          setUserProfile(profile);
          // Jika pengguna punya lokasi, jadikan itu sebagai filter default.
          // Jika tidak, selectedLocation akan tetap "" (Semua Lokasi).
          if (profile.location) {
            setSelectedLocation(profile.location);
          }
        }
      }
      // Biarkan loading berlanjut sampai event selesai di-fetch
    });
    return () => unsubscribe();
  }, []);

  // Fetch events berdasarkan lokasi yang dipilih (selectedLocation)
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventsRef = collection(db, "events");
        let q;

        // --- LOGIKA BARU ---
        // Query dasar untuk semua event yang disetujui, diurutkan dari yang terbaru
        const baseQueryConstraints = [
            where("status", "==", "approved"),
            orderBy("dateTime", "desc")
        ];

        if (selectedLocation) {
          // Jika ada lokasi yang dipilih, tambahkan filter lokasi
          q = query(eventsRef, where("location", "==", selectedLocation), ...baseQueryConstraints);
        } else {
          // Jika tidak ada lokasi (selectedLocation = ""), fetch semua event
          q = query(eventsRef, ...baseQueryConstraints);
        }

        const querySnapshot = await getDocs(q);
        const fetchedEvents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
      setLoading(false);
    };

    fetchEvents();
  }, [selectedLocation]); // Jalankan ulang setiap kali selectedLocation berubah

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  return (
    <div>
      <div className="container mx-auto px-4 md:px-8 py-10 space-y-10">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3B5323] leading-tight">
              Ayo Bersihin <br /> Lingkungan Bersama!
            </h1>
            <p className="text-[#3B5323] text-lg">
              Yuk bersihin lingkungan bareng orang-orang yang peduli! <br />
              Satu langkah kecilmu bisa berdampak besar
            </p>
          </div>
          <div className="flex-1">
            <img
              src={heroImage}
              alt="Bersihin lingkungan"
              className="w-[300px] mx-auto"
            />
          </div>
        </div>

        {/* Filter + Create Event */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-semibold text-[#2C441E]">
              Acara di
            </h2>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={handleLocationChange}
                className="appearance-none bg-[#2C441E] text-white text-sm font-semibold pl-10 pr-10 py-2 rounded-full focus:outline-none shadow-sm sm:w-48"
              >
                {/* Opsi statis untuk menampilkan semua lokasi */}
                <option value="">Semua Lokasi</option>
                {availableLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
              <HiOutlineLocationMarker className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-lg pointer-events-none" />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-xs pointer-events-none">▼</span>
            </div>
          </div>
          <Link
            to="/create-event"
            className="bg-[#2C441E] text-white font-semibold px-4 py-2 rounded-3xl shadow-sm hover:bg-green-800 transition-colors"
          >
            + Buat Acara
          </Link>
        </div>

        {/* Event List or Loading */}
        {loading && (
          <p className="text-center py-10">
            {selectedLocation
              ? `Mencari acara di ${selectedLocation}...`
              : "Memuat semua acara..."}
          </p>
        )}

        {!loading && events.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-10 px-4 border rounded-lg bg-gray-50">
            <p className="font-semibold">
              Yah, belum ada acara di {selectedLocation || 'lokasi ini'}.
            </p>
            <p className="text-gray-600">
              Coba pilih lokasi lain atau buat acaramu sendiri!
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default EventsPage;
