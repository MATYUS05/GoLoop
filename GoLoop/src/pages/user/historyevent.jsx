import React from "react";
// Images are now in root directory
import plastikPollution from "../../assets/plastic.png";
import sampah1 from "../../sampah1.png";
import sampah2 from "../../sampah2.png";
import sampah3 from "../../sampah3.png";

export default function HistoryEvent() {
  const events = [
    {
      image: sampah1,
      date: "24 July 2025",
      title: "Cleaning up the plastic tsunami on Anyer Beach",
      desc: "Event tahunan yang diadakan masyarakat desa Bandulu, Kecamatan Anyer yang mendorong masyarakat dan mahasiswa dalam berkontribusi menjaga lingkungan pantai di Serang, Banten.",
      point: 10,
    },
    {
      image: sampah2,
      date: "11 Desember 2024",
      title: "Cleaning up the rubbish hill on Mount Pangrango",
      desc: "Event yang diadakan mahasiswa IPB dalam rangka memperingati hari gunung sedunia. Bertujuan untuk mendorong anak muda untuk terus melestarikan alam dengan membersihkan sampah di jalur pendakian Gunung Pangrango.",
      point: 10,
    },
    {
      image: sampah3,
      date: "21 November 2024",
      title: "World Tree Day: Planting tree seedlings for reforestation",
      desc: "Event tahunan yang diadakan Satrad 224 Kwandang untuk memperingati hari pohon sedunia. Kegiatan ini diharapkan mendorong kesadaran masyarakat untuk ikut dalam melestarikan lingkungan alam.",
      point: 10,
    },
  ];

  return (
    <div className="w-full">
      {/* Header Section with Background Image - Full Screen */}
      <div className="relative h-screen w-full flex items-center justify-center">
        <img 
          src={plastikPollution} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-opacity-30"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-6xl font-bold mb-6">History Event</h1>
          <p className="text-xl">mari berkontribusi dalam kegiatan kami</p>
        </div>
      </div>

      <div className="space-y-6 max-w-5xl mx-auto mt-16">
        {events.map((event, idx) => (
          <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-md h-64 flex max-w-full">
            <div className="w-1/3 flex-shrink-0">
              <img
                src={event.image}
                alt="event"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-green-900 text-white p-6 flex flex-col justify-between w-2/3 min-w-0">
              <div className="flex-1">
                <p className="text-sm mb-2">{event.date}</p>
                <h2 className="text-xl font-semibold mb-3 line-clamp-2">{event.title}</h2>
                <p className="text-sm leading-relaxed line-clamp-4">{event.desc}</p>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4">
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="medal">🏅</span>
                  <span>+{event.point}</span>
                </div>
                <button className="text-sm underline hover:no-underline whitespace-nowrap">
                  Lihat Detail →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}