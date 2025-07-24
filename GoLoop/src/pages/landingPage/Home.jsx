// src/pages/landingPage/Home.jsx

import React from "react";
import { Link as ScrollLink } from "react-scroll";
import gambar1 from "../../assets/img/bg-home.png";

function Home() {
  return (
    <div className="font-quicksand">
      {/* Section Hero */}
      <div className="relative w-full h-[600px] overflow-hidden" id="hero">
        <img
          src={gambar1}
          alt="Background"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="relative z-10 w-full h-full flex items-center px-6 md:px-24">
          <div className="text-white max-w-xl">
            <p className="text-lg font-medium">Selamat datang di GoLoop!</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight pb-8">
              Aksi Nyata untuk Bumi Lebih Bersih
            </h1>
            <p className="text-base md:text-lg pb-4">
              GoLoop mendorong masyarakat, komunitas lokal, dan penyelenggara
              kegiatan untuk berkontribusi langsung dalam gerakan pengelolaan
              sampah yang berkelanjutan.
            </p>
            <p className="text-base md:text-lg pb-6">
              Melalui sistem kontribusi dan pelacakan berbasis komunitas, GoLoop
              membangun ekosistem daur ulang yang kolaboratif dan transparan
              untuk mengurangi dampak sampah terhadap lingkungan.
            </p>
            <ScrollLink to="wilayah" smooth={true} duration={500}>
              <button className="bg-white text-green-900 font-semibold px-6 py-3 rounded-full shadow hover:bg-gray-200 transition">
                Ikut berkontribusi
              </button>
            </ScrollLink>
          </div>
        </div>
      </div>

      </div>
  );
}

export default Home;
