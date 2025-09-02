import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import {
  FiUploadCloud,
  FiTrash2,
  FiLoader,
  FiAlertCircle,
  FiCamera,
  FiRefreshCw,
} from "react-icons/fi";

// Data untuk informasi daur ulang diperbarui dengan warna background
const wasteInfo = {
  cardboard: {
    description:
      "Kardus adalah bahan yang mudah didaur ulang. Pastikan dalam keadaan kering dan tidak terkontaminasi minyak.",
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    icon: "📦",
    management: [
      {
        title: "Reduce",
        tip: "Pilih produk dengan kemasan minimal atau tanpa kardus jika memungkinkan.",
      },
      {
        title: "Reuse",
        tip: "Gunakan kembali kotak kardus untuk penyimpanan atau pengiriman barang.",
      },
      {
        title: "Recycle",
        tip: "Lipat kardus agar ringkas dan setor ke bank sampah atau pemulung terdekat.",
      },
    ],
  },
  plastic: {
    description:
      "Sampah plastik butuh ratusan tahun untuk terurai. Daur ulang sangat penting untuk mengurangi polusi.",
    color: "bg-yellow-500", // Diubah menjadi kuning sesuai permintaan
    bgColor: "bg-yellow-50",
    icon: "🧴",
    management: [
      {
        title: "Reduce",
        tip: "Bawa tas belanja dan botol minum sendiri untuk mengurangi sampah plastik.",
      },
      {
        title: "Reuse",
        tip: "Gunakan kembali wadah plastik bekas es krim atau makanan untuk menyimpan barang.",
      },
      {
        title: "Recycle",
        tip: "Bersihkan sisa makanan/minuman, lalu kumpulkan untuk didaur ulang.",
      },
    ],
  },
  paper: {
    description:
      "Kertas berasal dari pohon. Daur ulang kertas membantu menyelamatkan hutan dan menghemat energi.",
    color: "bg-slate-500",
    bgColor: "bg-slate-50",
    icon: "📄",
    management: [
      {
        title: "Reduce",
        tip: "Kurangi mencetak dokumen yang tidak perlu. Gunakan format digital.",
      },
      {
        title: "Reuse",
        tip: "Gunakan sisi kertas yang masih kosong untuk catatan atau kertas buram.",
      },
      {
        title: "Recycle",
        tip: "Pastikan kertas tidak basah atau berminyak sebelum disetor ke bank sampah.",
      },
    ],
  },
  metal: {
    description:
      "Logam seperti kaleng aluminium dan baja dapat didaur ulang berulang kali tanpa kehilangan kualitasnya.",
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    icon: "🔩",
    management: [
      {
        title: "Reduce",
        tip: "Pilih produk dalam kemasan yang lebih besar untuk mengurangi jumlah kaleng.",
      },
      {
        title: "Reuse",
        tip: "Gunakan kaleng bekas sebagai pot tanaman kecil atau tempat pensil.",
      },
      {
        title: "Recycle",
        tip: "Bersihkan kaleng dari sisa isi, lalu pipihkan jika memungkinkan untuk menghemat ruang.",
      },
    ],
  },
  glass: {
    description:
      "Kaca dapat didaur ulang 100% tanpa henti. Memisahkan warna kaca akan sangat membantu proses daur ulang.",
    color: "bg-green-500",
    bgColor: "bg-green-50",
    icon: "�",
    management: [
      {
        title: "Reduce",
        tip: "Beli produk isi ulang (refill) untuk mengurangi jumlah botol kaca baru.",
      },
      {
        title: "Reuse",
        tip: "Gunakan kembali botol atau toples kaca untuk menyimpan bumbu, selai, atau minuman.",
      },
      {
        title: "Recycle",
        tip: "Kumpulkan wadah kaca. Pisahkan berdasarkan warna (bening, hijau, coklat) jika bisa.",
      },
    ],
  },
  trash: {
    description:
      "Ini adalah sampah sisa (residu) yang saat ini sulit atau tidak bisa didaur ulang.",
    color: "bg-red-500",
    bgColor: "bg-red-50",
    icon: "🗑️",
    management: [
      {
        title: "Reduce",
        tip: "Hindari produk dengan kemasan berlapis atau yang tidak dapat didaur ulang.",
      },
      {
        title: "Replace",
        tip: "Ganti produk sekali pakai dengan alternatif yang bisa digunakan berulang kali.",
      },
      {
        title: "Dispose",
        tip: "Buang ke tempat sampah yang benar untuk diangkut ke Tempat Pembuangan Akhir (TPA).",
      },
    ],
  },
};

function ImageClassifier() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const HF_API_KEY = import.meta.env.VITE_HF_API_KEY;
  const API_URL = import.meta.env.VITE_HF_API_URL;

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".jpg"] },
    multiple: false,
    noClick: true,
  });

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setPrediction(null);
    setError(null);

    try {
      const response = await axios.post("/api/classify", selectedFile, {
        headers: {
          "Content-Type": selectedFile.type,
        },
      });

      const topPrediction = response.data.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );
      setPrediction(topPrediction);
    } catch (err) {
      console.error("Error calling classify API:", err);
      setError("Gagal melakukan prediksi. Coba lagi nanti.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview("");
    setPrediction(null);
    setError(null);
  };

  const renderInitialState = () => (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? "border-[#2C441E] bg-green-50"
          : "border-gray-300 hover:border-green-400"
      }`}
    >
      <input {...getInputProps()} />
      <FiUploadCloud className="mx-auto text-5xl text-gray-400" />
      <p className="mt-4 text-gray-600">
        Seret & lepas gambar, atau klik tombol di bawah
      </p>
      <button
        type="button"
        onClick={open}
        className="mt-4 bg-[#2C441E] text-white font-semibold py-2 px-5 rounded-lg hover:bg-[#8D964D] transition"
      >
        Pilih File
      </button>
    </div>
  );

  const renderPreviewState = () => (
    <div className="text-center space-y-4">
      <img
        src={preview}
        alt="Preview"
        className="mx-auto max-h-64 rounded-lg shadow-md"
      />
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className="flex items-center justify-center bg-[#2C441E] text-white font-bold py-2.5 px-6 rounded-lg hover:bg-[#8D964D] transition disabled:bg-gray-400 shadow-md"
        >
          {isLoading ? (
            <FiLoader className="animate-spin mr-2" />
          ) : (
            <FiCamera className="mr-2" />
          )}
          {isLoading ? "Menganalisis..." : "Klasifikasi"}
        </button>
        <button
          onClick={clearSelection}
          title="Hapus Gambar"
          className="flex items-center bg-red-600 text-white font-bold p-3 rounded-lg hover:bg-red-700 transition shadow-md"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );

  const renderResultState = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-1/2">
          <img
            src={preview}
            alt="Hasil"
            className="w-full h-full max-h-[350px] object-cover rounded-lg shadow-md"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col space-y-4">
          <div
            className={`text-white p-4 rounded-lg shadow-lg flex items-center space-x-4 ${
              wasteInfo[prediction.label]?.color || "bg-gray-500"
            }`}
          >
            <span className="text-4xl">
              {wasteInfo[prediction.label]?.icon || "❓"}
            </span>
            <div>
              <p className="text-sm opacity-80">Terdeteksi Sebagai</p>
              <h3 className="text-2xl font-bold">
                {prediction.label.charAt(0).toUpperCase() +
                  prediction.label.slice(1)}
              </h3>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm opacity-80">Keyakinan</p>
              <p className="text-2xl font-bold">
                {(prediction.score * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <div
            className={`p-4 rounded-lg border flex-grow space-y-3 transition-colors duration-500 ${
              wasteInfo[prediction.label]?.bgColor || "bg-white"
            }`}
          >
            <p className="text-gray-600 text-sm pb-3 border-b">
              {wasteInfo[prediction.label]?.description ||
                "Informasi tidak tersedia."}
            </p>
            <div className="space-y-2 pt-2">
              {(wasteInfo[prediction.label]?.management || []).map((item) => (
                <div key={item.title}>
                  <h4 className="font-bold text-gray-800">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={clearSelection}
        className="w-full flex items-center justify-center bg-gray-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-gray-700 transition shadow-md"
      >
        <FiRefreshCw className="mr-2" />
        Coba Lagi
      </button>
    </div>
  );

  return (
    <div
      className={`bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500`}
    >
      <div
        className={`w-full bg-white rounded-2xl shadow-2xl p-8 space-y-6 transition-all duration-500 ease-in-out ${
          prediction ? "max-w-4xl" : "max-w-md"
        }`}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Klasifikasi Sampah
          </h1>
          <p className="text-gray-500 mt-1">
            Unggah gambar sampahmu untuk mengetahui jenisnya!
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg flex items-center">
            <FiAlertCircle className="mr-3" />
            <span>{error}</span>
          </div>
        )}

        {prediction
          ? renderResultState()
          : preview
          ? renderPreviewState()
          : renderInitialState()}
      </div>
    </div>
  );
}

export default ImageClassifier;
