// src/pages/landingPage/Home.jsx

import React from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";
import gambar1 from "../../assets/img/bg-home.png";
import gambar3 from "../../assets/img/bg-wilayah-3.svg";
import img1 from "../../assets/img/goloop1.png";
import img2 from "../../assets/img/goloop2.png";
import img3 from "../../assets/img/goloop3.png";

function Home1() {
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
            <Link
              to="/login"
              className="bg-white text-green-900 font-semibold px-6 py-3 rounded-full shadow hover:bg-gray-200 transition"
            >
              Ikut berkontribusi
            </Link>
          </div>
        </div>
      </div>
       <div
              id="wilayah"
              className="w-full pt-12 h-[600px] px-6 bg-white flex flex-col items-center text-center"
            >
              <h2 className="text-4xl font-bold mb-10 text-[#2C441E]">
                Wilayah dengan Sampah Terbanyak
              </h2>
              <img
                src={gambar3}
                alt="Wilayah Sampah"
                className="w-auto pl-60 h-auto"
              />
            </div>
                <div className="text-center py-12 px-4">
                    <h2 className="text-4xl font-bold text-[#334222] mb-4">What We Do?</h2>
                    <p className="text-[#334222] text-md font-semibold">
                      GoLoop jadi wadah untuk siapa pun yang ingin bantu bersihin sampah di
                      jalanan dan ruang publik. <br />
                      Kami mengumpulkan relawan & komunitas untuk aksi bersih-bersih, dan
                      pastikan sampah dibuang ke TPA resmi.
                    </p>
                  </div>
                <div
                  id="about"
                  className="grid grid-cols-1 px-6 md:px-24 md:grid-cols-3 gap-8 pb-12"
                >
                  {/* Card 1 */}
                  <div className="rounded-[40px] overflow-hidden shadow-lg bg-[#3E532D] text-white">
                    <img
                      src={img1}
                      alt="GoLoop participation"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">GoLoop Participation</h3>
                      <p className="text-sm">
                        Ikut dalam membersihkan lingkungan tempat kita hidup.
                      </p>
                    </div>
                  </div>
            
                  {/* Card 2 */}
                  <div className="rounded-[40px] overflow-hidden shadow-lg bg-[#3E532D] text-white">
                    <img
                      src={img2}
                      alt="Waste Sorting"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">Waste Sorting</h3>
                      <p className="text-sm">
                        Belajar memilah sampah organik, anorganik, dan B3 agar pengolahan
                        lebih efektif & ramah lingkungan.
                      </p>
                    </div>
                  </div>
            
                  {/* Card 3 */}
                  <div className="rounded-[40px] overflow-hidden shadow-lg bg-[#3E532D] text-white">
                    <img
                      src={img3}
                      alt="Awareness Increase"
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2">Awareness Increase</h3>
                      <p className="text-sm">
                        Tingkatkan kesadaranmu terhadap sekitar dan jadikan tempat ini layak
                        untuk ditinggali.
                      </p>
                    </div>
                  </div>
                </div>
    </div>
  );
}

export default Home1;
