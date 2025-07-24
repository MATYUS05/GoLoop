import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import EventCard from "../../components/common/EventCard";
import heroImage from "../../assets/img/hero-clean.svg"; // Pastikan path gambar sesuai

function EventsPage() {
  const [userProfile, setUserProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, where("status", "==", "approved"));
      const querySnapshot = await getDocs(q);
      const locations = querySnapshot.docs.map((doc) => doc.data().location);
      const uniqueLocations = [...new Set(locations)];
      setAvailableLocations(uniqueLocations);
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const fetchUserProfile = async () => {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setUserProfile(profile);
            if (profile.location) {
              setSelectedLocation(profile.location);
            }
          }
        };
        fetchUserProfile();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const fetchEvents = async () => {
        setLoading(true);
        try {
          const eventsRef = collection(db, "events");
          const q = query(
            eventsRef,
            where("location", "==", selectedLocation),
            where("status", "==", "approved")
          );
          const querySnapshot = await getDocs(q);
          const fetchedEvents = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEvents(fetchedEvents);
        } catch (error) {
          console.error("Gagal mengambil events:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    } else {
      setEvents([]);
      setLoading(false);
    }
  }, [selectedLocation]);

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 space-y-10">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#3B5323] leading-tight">
            Ayo Bersihin <br /> Lingkungan Bersama!
          </h1>
          <p className="text-gray-700 text-lg">
            Yuk bersihin lingkungan bareng orang-orang yang peduli! <br />
            Satu langkah kecilmu bisa berdampak besar
          </p>
        </div>
        <div className="flex-1">
          <img
            src={heroImage}
            alt="Bersihin lingkungan"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </div>

      {/* Filter + Create Event */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Terdekat</h2>
          <select
            value={selectedLocation}
            onChange={handleLocationChange}
            className="bg-[#3B5323] text-white text-sm font-semibold pl-3 pr-8 py-1 rounded-full focus:outline-none"
          >
            <option value="" disabled>
              Pilih Lokasi
            </option>
            {availableLocations.map((location) => (
              <option key={location} value={location}>
                📍 {location}
              </option>
            ))}
          </select>
        </div>

        <Link
          to="/create-event"
          className="bg-[#3B5323] text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-[#2e431a] transition-colors"
        >
          + Create Event
        </Link>
      </div>

      {/* Event List */}
      {loading && <p>Mencari acara di {selectedLocation}...</p>}

      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {!loading && events.length === 0 && selectedLocation && (
        <div className="text-center py-10 px-4 border rounded-lg bg-gray-50">
          <p className="font-semibold">
            Yah, belum ada acara di {selectedLocation}.
          </p>
          <p className="text-gray-600">
            Coba pilih lokasi lain atau buat acaramu sendiri!
          </p>
        </div>
      )}
    </div>
  );
}

export default EventsPage;
