import React from "react";
import { Link } from "react-router-dom";
import { FaLeaf, FaRecycle, FaExclamationTriangle } from "react-icons/fa";
import ilustrasi from "../../assets/img/kenali-sampah.png";

// Tambahkan gambar kategori
import imgOrganik from "../../assets/img/sampah/organik.png";
import imgAnorganik from "../../assets/img/sampah/anorganik.png";
import imgB3 from "../../assets/img/sampah/b3.png";

function KenaliSampah() {
  return (
    <div className="font-quicksand">
      <section className="bg-white py-16 px-4 md:px-12 lg:px-32">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-[#3B5323] leading-tight">
              Kenali Sampahmu,
              <br />
              Selamatkan Lingkungan!
            </h1>
            <p className="text-[#3B5323] text-lg pb-6 pt-2">
              Klasifikasi sampah dengan benar adalah langkah kecil yang
              berdampak besar
            </p>
            {/* Tombol diarahkan ke /model */}
            <Link
              to="/model"
              className="inline-block bg-[#2C441E] text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-[#8D964D] transition"
            >
              Kenali Sampah
            </Link>
          </div>

          <div className="flex-1">
            <img
              src={ilustrasi}
              alt="Ilustrasi pemilahan sampah"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>

        {/* Card Kategori */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
          {/* ORGANIK */}
          <div className="bg-[#2C441E] rounded-2xl p-6">
            <div className="flex justify-center mb-4">
              <img src={imgOrganik} alt="Sampah Organik" className="h-28" />
            </div>
            {/* Menggunakan ikon FaLeaf */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaLeaf />
              <h3 className="text-2xl font-bold">Organik</h3>
            </div>
            <p className="text-sm mb-2">
              Sampah yang mudah terurai secara alami.
            </p>
            <p className="text-sm">
              Contoh: sisa makanan, daun kering, kulit buah, kertas, tisu.
              <br />
              Bisa dijadikan kompos atau pupuk.
            </p>
          </div>

          {/* ANORGANIK */}
          <div className="bg-[#1F2A44] rounded-2xl p-6">
            <div className="flex justify-center mb-4">
              <img src={imgAnorganik} alt="Sampah Anorganik" className="h-28" />
            </div>
            {/* Menggunakan ikon FaRecycle */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaRecycle />
              <h3 className="text-2xl font-bold">Anorganik</h3>
            </div>
            <p className="text-sm mb-2">
              Sampah yang sulit terurai dan tidak berasal dari makhluk hidup.
            </p>
            <p className="text-sm">
              Contoh: plastik, logam, kaca, kertas.
              <br />
              Dapat didaur ulang menjadi barang baru.
            </p>
          </div>

          {/* B3 */}
          <div className="bg-[#A33E3E] rounded-2xl p-6">
            <div className="flex justify-center mb-4">
              <img src={imgB3} alt="Sampah B3" className="h-28" />
            </div>
            {/* Menggunakan ikon FaExclamationTriangle */}
            <div className="flex items-center justify-center gap-2 mb-1">
                <FaExclamationTriangle />
                <h3 className="text-2xl font-bold">B3</h3>
            </div>
            <p className="text-sm mb-1 font-semibold">
              (Bahan Berbahaya & Beracun)
            </p>
            <p className="text-sm mb-2">
              Sampah yang berbahaya bagi lingkungan.
            </p>
            <p className="text-sm">
              Contoh: baterai, obat, botol kaca.
              <br />
              Akan dibuang dengan prosedur khusus.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default KenaliSampah;
