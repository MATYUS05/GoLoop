import React from 'react';
import { Link } from 'react-router-dom';

function EventCard({ event }) {
  const getEventStatus = () => {
    const now = new Date();
    const eventDate = event.dateTime.toDate();
    const isFull = event.registered >= event.capacity;
    const hasPassed = now > eventDate;

    if (hasPassed) {
      return { text: 'Sudah tutup', style: 'bg-gray-200 text-gray-700' };
    }
    if (isFull) {
      return { text: 'Penuh', style: 'bg-red-100 text-red-800' };
    }
    return { text: 'Open register', style: 'bg-green-100 text-green-800' };
  };

  const status = getEventStatus();
  const eventDateStr = event.dateTime.toDate().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const eventTimeStr = event.dateTime.toDate().toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <Link to={`/event/${event.id}`} className="block text-black no-underline">
      <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative bg-gray-200 h-40">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Gambar tidak tersedia
            </div>
          )}
          <span 
            className={`absolute top-2 right-2 text-xs font-bold py-1 px-3 rounded-full ${status.style}`}
          >
            {status.text}
          </span>
        </div>

        {/* Konten teks kartu */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-bold text-lg truncate mb-1">{event.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{event.organizer}</p>
          
          {/* Spacer untuk mendorong detail ke bawah */}
          <div className="flex-grow"></div> 
          
          <div className="text-sm text-gray-500 space-y-1 mt-3 border-t pt-3">
            <p className="flex items-center">
              <span className="mr-2">📍</span>{event.location}
            </p>
            <p className="flex items-center">
              <span className="mr-2">📅</span>{eventDateStr}, {eventTimeStr} WIB
            </p>
            <p className="flex items-center">
              <span className="mr-2">👥</span>{event.registered}/{event.capacity}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default EventCard;