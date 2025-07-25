import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import emptyTrash from "../../assets/img/empty-trash.png";
import Footer from "../../components/common/Footer";
import emptyTrash1 from "../../assets/img/empty-trash1.png";


import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  collectionGroup,
  getDoc,
  doc,
} from "firebase/firestore";
import { MdLocationOn, MdCalendarToday } from "react-icons/md";

function MyEventsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
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
    const unsubscribeMyEvents = onSnapshot(myEventsQuery, (snapshot) => {
      setMyEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const joinedEventsQuery = query(
      collectionGroup(db, "registrations"),
      where("userId", "==", user.uid)
    );
    const unsubscribeJoinedEvents = onSnapshot(
      joinedEventsQuery,
      async (snapshot) => {
        const promises = snapshot.docs.map(async (regDoc) => {
          const registrationData = regDoc.data();
          const eventId = regDoc.ref.parent.parent.id;
          const eventRef = doc(db, "events", eventId);
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
      }
    );

    return () => {
      unsubscribeMyEvents();
      unsubscribeJoinedEvents();
    };
  }, [user]);

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const statusText = status
      ? status.charAt(0).toUpperCase() + status.slice(1)
      : "";
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          styles[status] || "bg-gray-100"
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
    <div
      className="min-h-screen bg-cover bg-no-repeat bg-center"
      // style={{ backgroundImage: `url(${bgEvents})` }}
    >
      <div className="">
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
                className="rounded-md bg-[#2C441E] py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-green-800"
              >
                + Buat Event Baru
              </Link>
            </div>
            <div
              className="bg-white p-4 rounded-lg shadow min-h-[80px]"
              style={{
                boxShadow:
                  "0 2px 2px rgba(0,0,0,0.1), 0 -2px 0px rgba(0,0,0,0.05)",
              }}
            >
              {myEvents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {myEvents.map((event) => {
                    const eventDate = event.dateTime
                      .toDate()
                      .toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                    return (
                      <li
                        key={event.id}
                        className="py-4 flex items-center space-x-4"
                      >
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-24 h-16 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-grow">
                          <h3 className="font-bold text-gray-900">
                            {event.title}
                          </h3>
                          <p className="text-xs text-[#2C441E] flex items-center gap-1">
                            <MdLocationOn className="text-lg" />
                            {event.location}
                          </p>
                          <p className="text-xs text-[#2C441E] flex items-center gap-1">
                            <MdCalendarToday className="text-sm" />
                            {eventDate}
                          </p>
                          {event.status === "approved" && (
                            <Link
                              to={`/my-event/participants/${event.id}`}
                              className="mt-2 inline-block bg-[#2C441E] text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-[#8D964D] transition"
                            >
                              Lihat Partisipan
                            </Link>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <StatusBadge status={event.status} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <img
                    src={emptyTrash1}
                    alt="No events"
                    className="w-32 mb-3 w-[500px] "
                  />
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
              style={{
                boxShadow:
                  "0 2px 2px rgba(0,0,0,0.1), 0 -2px 0px rgba(0,0,0,0.05)",
              }}
            >
              {joinedEvents.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {joinedEvents.map((event) => {
                    const eventDate = event.dateTime
                      .toDate()
                      .toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      });
                    return (
                      <li
                        key={event.id}
                        className="py-4 flex items-center space-x-4"
                      >
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-24 h-16 object-cover rounded-md flex-shrink-0"
                        />
                        <div className="flex-grow">
                          <h3 className="font-bold text-gray-900">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MdLocationOn className="text-lg" />
                            {event.location}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MdCalendarToday className="text-sm" />
                            {eventDate}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <StatusBadge status={event.registrationStatus} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                  <img
                    src={emptyTrash}
                    alt="No events"
                    className="w-[200px] mb-3"
                  />
                  <p>Anda belum mengikuti event apapun.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MyEventsPage;
