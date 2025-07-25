import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import bgEvents from "../../assets/img/bg-events.svg";


const CITIES = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Medan",
  "Makassar",
  "Semarang",
  "Yogyakarta",
  "Denpasar",
];

function CreateEventPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [eventData, setEventData] = useState({
    title: "",
    organizer: "",
    location: CITIES[0],
    locationDetail: "",
    description: "",
    dateTime: "",
    capacity: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEventData((prev) => ({
          ...prev,
          organizer: currentUser.displayName || "",
        }));
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleChange = (e) => {
    // Perbaikan kecil: Ambil name dan value dari e.target
    const { name, value } = e.target;
    setEventData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setError("Anda harus login untuk membuat event.");
    if (
      !eventData.title ||
      !eventData.location ||
      !eventData.description ||
      !eventData.locationDetail ||
      !imageFile
    ) {
      return setError("Semua field wajib diisi.");
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      );
      const url = `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`;
      const response = await fetch(url, { method: "POST", body: formData });
      const data = await response.json();
      if (!data.secure_url) {
        throw new Error("Gagal mengupload gambar ke Cloudinary.");
      }
      const imageUrl = data.secure_url;

      const newEvent = {
        ...eventData,
        imageUrl: imageUrl,
        capacity: Number(eventData.capacity),
        dateTime: Timestamp.fromDate(new Date(eventData.dateTime)),
        creatorId: user.uid,
        registered: 0,
        status: "pending",
      };

      await addDoc(collection(db, "events"), newEvent);

      alert("Event berhasil dibuat dan sedang menunggu persetujuan admin.");
      navigate("/my-event");
    } catch (err) {
      console.error("Gagal membuat event:", err);
      setError(`Terjadi kesalahan saat menyimpan event: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${bgEvents})`,
      }}
    >
      <div className="container mx-auto p-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Buat Event Baru</h1>
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white rounded-lg shadow-md space-y-4"
        >
          {/* --- FIELD FORM YANG HILANG SUDAH DIKEMBALIKAN --- */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Judul Event
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={eventData.title}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Lokasi (Kota)
            </label>
            <select
              name="location"
              id="location"
              value={eventData.location}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md bg-white"
              required
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="locationDetail"
              className="block text-sm font-medium text-gray-700"
            >
              Detail Lokasi
            </label>
            <input
              type="text"
              name="locationDetail"
              id="locationDetail"
              value={eventData.locationDetail}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md"
              placeholder="Contoh: Gedung Serbaguna, Jl. Merdeka No. 10"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Deskripsi Event
            </label>
            <textarea
              name="description"
              id="description"
              value={eventData.description}
              onChange={handleChange}
              rows="4"
              className="mt-1 block w-full p-2 border rounded-md"
              placeholder="Jelaskan tentang event Anda..."
              required
            />
          </div>

          <div>
            <label
              htmlFor="organizer"
              className="block text-sm font-medium text-gray-700"
            >
              Penyelenggara
            </label>
            <input
              type="text"
              name="organizer"
              id="organizer"
              value={eventData.organizer}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Gambar Event
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              required
            />
          </div>
          {/* ---------------------------------------------------- */}

          <div>
            <label
              htmlFor="dateTime"
              className="block text-sm font-medium text-gray-700"
            >
              Tanggal & Waktu
            </label>
            <input
              type="datetime-local"
              name="dateTime"
              id="dateTime"
              value={eventData.dateTime}
              onChange={handleChange}
              min={minDateTime}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-gray-700"
            >
              Kapasitas Peserta
            </label>
            <input
              type="number"
              name="capacity"
              id="capacity"
              min="1"
              value={eventData.capacity}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border rounded-md"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-green-800 disabled:bg-green-400"
          >
            {loading ? "Menyimpan..." : "Submit Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEventPage;
