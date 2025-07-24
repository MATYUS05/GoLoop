import React from 'react';

function EventCard({ event }) {
  const eventDate = event.dateTime.toDate().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const eventTime = event.dateTime.toDate().toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <div className="bg-gray-200 h-40">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Gambar tidak tersedia
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{event.organizer}</p>
        
        {/* --- PERUBAHAN DI SINI --- */}
        <div className="text-sm text-gray-500 space-y-1 mt-3 border-t pt-3">
          {/* 1. Menambahkan Lokasi */}
          <p>📍 {event.location}</p>
          
          {/* 2. Menggabungkan Tanggal & Waktu */}
          <p>📅 {eventDate}, {eventTime} WIB</p>
          
          <p>👥 {event.registered}/{event.capacity}</p>
        </div>
        {/* ------------------------- */}
      </div>
    </div>
  );
}

export default EventCard;