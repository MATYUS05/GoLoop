import React from "react";
import { Link } from "react-router-dom";
import sampahImage from "../../assets/sampah-family.png"; // relative import

function KenaliSampah() {
  return (
    <div className="bg-white min-h-screen p-8">
      {/* Header & Gambar */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 md:pl-16">
        {/* Text Section */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Kenali Sampahmu,<br />Selamatkan Lingkungan!
          </h1>
          <p className="text-gray-700 text-lg">
            Klasifikasi sampah dengan benar adalah langkah kecil yang berdampak besar.
          </p>
          <Link
            to="/kenalisampah"
            className="inline-block mt-6 bg-green-800 text-white px-6 py-2 rounded-full hover:bg-green-900"
          >
            Kenali Sampah
          </Link>
        </div>

        {/* Image Section */}
        <div className="md:w-1/2 flex justify-center">
          <img
            src={sampahImage}
            alt="Keluarga memilah sampah"
            className="w-[300px] md:w-[400px] max-w-full"
          />
        </div>
      </div>

      {/* Kategori Sampah */}
      <div className="bg-100 py-">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Organik */}
          <div className="bg-green-900 rounded-xl p-6 text-center text-white shadow-lg">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">📄</span>
            </div>
            <h3 className="text-2xl font-bold">Organik</h3>
            <p className="mt-2">
              Sampah yang mudah terurai secara alami.
              <br />
              <span className="font-semibold">Contoh:</span> sisa makanan, daun kering, kulit buah, kertas, tisu.
              <br />
              <em>Bisa dijadikan kompos atau pupuk.</em>
            </p>
          </div>

          {/* Anorganik */}
          <div className="bg-blue-900 rounded-xl p-6 text-center text-white shadow-lg">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">🧴</span>
            </div>
            <h3 className="text-2xl font-bold">Anorganik</h3>
            <p className="mt-2">
              Sampah yang sulit terurai dan tidak berasal dari makhluk hidup.
              <br />
              <span className="font-semibold">Contoh:</span> plastik, logam, kaca, kertas.
              <br />
              <em>Dapat didaur ulang menjadi barang baru.</em>
            </p>
          </div>

          {/* B3 */}
          <div className="bg-red-700 rounded-xl p-6 text-center text-white shadow-lg">
            <div className="flex justify-center mb-4">
              <span className="text-4xl">💉</span>
            </div>
            <h3 className="text-2xl font-bold">B3</h3>
            <p className="mt-2">
              <span className="font-bold">(Bahan Berbahaya & Beracun)</span>
              <br />
              Sampah yang berbahaya bagi lingkungan.
              <br />
              <span className="font-semibold">Contoh:</span> baterai, obat, botol kaca.
              <br />
              <em>Akan dibuang dengan prosedur khusus.</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KenaliSampah;
