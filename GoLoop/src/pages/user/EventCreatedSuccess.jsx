import React from "react";
import { Link } from "react-router-dom";

function EventCreatedSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-[#2C441E] px-4 py-12">
      <h1 className="text-4xl font-bold mb-4 text-center">
        🎉 Event Berhasil Dibuat!
      </h1>
      <p className="text-lg text-center mb-6 max-w-xl">
        Event kamu telah berhasil dibuat dan sedang menunggu persetujuan admin.
        Kamu bisa melihat detailnya di dashboard.
      </p>
      <div className="flex gap-4">
        <Link
          to="/dashboard"
          className="bg-[#2C441E] text-white py-2 px-6 rounded-lg hover:bg-green-800 transition"
        >
          Ke Dashboard
        </Link>
        <Link
          to="/create-event"
          className="bg-white border border-[#2C441E] py-2 px-6 rounded-lg hover:bg-gray-100 transition"
        >
          Buat Event Lagi
        </Link>
      </div>
    </div>
  );
}

export default EventCreatedSuccess;
