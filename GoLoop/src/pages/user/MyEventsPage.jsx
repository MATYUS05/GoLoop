import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

function MyEventsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
    const myEventsQuery = query(
      collection(db, "events"),
      where("creatorId", "==", user.uid),
      orderBy("dateTime", "desc")
    );
    const unsubscribeMyEvents = onSnapshot(
      myEventsQuery,
      (querySnapshot) => {
        const fetchedEvents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMyEvents(fetchedEvents);
      },
      (error) => {
        console.error("Gagal mendengarkan 'My Events':", error);
      }
    );

    const publicEventsQuery = query(
      collection(db, "events"),
      where("status", "==", "approved"),
      orderBy("dateTime", "desc")
    );
    const unsubscribePublicEvents = onSnapshot(
      publicEventsQuery,
      (querySnapshot) => {
        const fetchedEvents = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPublicEvents(fetchedEvents);
      },
      (error) => {
        console.error("Gagal mendengarkan 'Public Events':", error);
      }
    );

    return () => {
      unsubscribeMyEvents();
      unsubscribePublicEvents();
    };
  }, [user]);

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const statusText = status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "";

    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {statusText}
      </span>
    );
  };

  if (loading) {
    return <p className="text-center p-8">Memuat data pengguna...</p>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Event Saya</h1>
      </div>

      {/* Bagian Status Pengajuan Event */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Status Pengajuan Event</h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow min-h-[80px]">
          {myEvents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {myEvents.map((event) => (
                <li
                  key={event.id}
                  className="py-3 flex justify-between items-center"
                >
                  <span className="font-medium text-gray-800">
                    {event.title}
                  </span>
                  <StatusBadge status={event.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center pt-5">
              Anda belum mengajukan event apapun.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Jelajahi Event Publik</h2>
        <div className="space-y-4">
          {publicEvents.filter((event) => user && event.creatorId !== user.uid)
            .length > 0 ? (
            publicEvents
              .filter((event) => user && event.creatorId !== user.uid)
              .map((event) => (
                <div
                  key={event.id}
                  className="bg-white p-4 rounded-lg shadow flex items-start space-x-4"
                >
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-32 h-20 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600">{event.location}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.dateTime.seconds * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-gray-500 text-center pt-5">
              Belum ada event publik yang tersedia saat ini.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MyEventsPage;
