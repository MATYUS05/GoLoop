import React from "react";
import { Link } from "react-router-dom";
import { LuMapPin, LuCalendar, LuUsers } from "react-icons/lu"; // ✅ ikon monokrom

function EventCard({ event }) {
  const getEventStatus = () => {
    const now = new Date();
    const eventDate = event.dateTime.toDate();
    const isFull = event.registered >= event.capacity;
    const hasPassed = now > eventDate;

    if (hasPassed) {
      return { text: "Sudah tutup", style: "bg-gray-200 text-gray-700" };
    }
    if (isFull) {
      return { text: "Penuh", style: "bg-red-100 text-red-800" };
    }
    return { text: "Open register", style: "bg-green-100 text-green-800" };
  };

  const status = getEventStatus();
  const eventDateStr = event.dateTime.toDate().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const eventTimeStr = event.dateTime.toDate().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link to={`/event/${event.id}`} className="block text-black no-underline">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow flex flex-col overflow-hidden h-full">
        {/* Gambar atau placeholder */}
        <div className="relative bg-gray-200 h-40 w-full">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Gambar tidak tersedia
            </div>
          )}
          <span
            className={`absolute top-2 right-2 text-xs font-bold py-1 px-3 rounded-full ${status.style}`}
          >
            {status.text}
          </span>
        </div>

        {/* Konten teks */}
        <div className="p-4 flex flex-col justify-between h-full">
          <div>
            <h3 className="font-bold text-lg text-gray-800 leading-snug mb-1 truncate">
              {event.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3 truncate">
              {event.organizer}
            </p>
          </div>

          {/* Info event */}
          <div className="space-y-1 text-sm text-gray-600 ">
            <p className="flex items-center gap-2">
              <LuMapPin className="text-base" /> {event.location}
            </p>
            <p className="flex items-center gap-2">
              <LuCalendar className="text-base" />
              {eventDateStr}, {eventTimeStr} WIB
            </p>
            <p className="flex items-center gap-2">
              <LuUsers className="text-base" />
              {event.registered}/{event.capacity}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default EventCard;
