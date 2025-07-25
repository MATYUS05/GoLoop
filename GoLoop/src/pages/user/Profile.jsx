import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import {
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const TABS = {
  PROFILE: "Profil",
  PASSWORD: "Ubah Password",
};

const CITIES = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Medan",
  "Makassar",
  "Semarang",
  "Yogyakarta",
  "Denpasar",
  "Lainnya",
];

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState(TABS.PROFILE);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [location, setLocation] = useState(CITIES[0]);
  const [profileImage, setProfileImage] = useState(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        setPhotoURL(currentUser.photoURL || "");

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.location) setLocation(data.location);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPhotoURL(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async () => {
    try {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, "users", user.uid), { displayName, location });
      setSuccess("Profil berhasil diperbarui!");
      setError("");
    } catch (err) {
      setError("Gagal memperbarui profil.");
      setSuccess("");
    }
  };

  const handlePasswordSave = async () => {
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess("Password berhasil diubah!");
      setError("");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError("Gagal mengganti password.");
      setSuccess("");
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/3 bg-[#2C441E] p-6 border-r">
          <div className="mb-6 text-white truncate">
            {displayName || "(Belum Ada Nama)"}
          </div>
          <nav className="space-y-4 text-sm">
            <button
              onClick={() => setSelectedTab(TABS.PROFILE)}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                selectedTab === TABS.PROFILE
                  ? "bg-white shadow text-[#2C441E] font-semibold"
                  : "text-white hover:bg-[#56813C]"
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => setSelectedTab(TABS.PASSWORD)}
              className={`block w-full text-left px-4 py-2 rounded-lg ${
                selectedTab === TABS.PASSWORD
                  ? "bg-white shadow text-[#2C441E] font-semibold"
                  : "text-white hover:bg-[#56813C]"
              }`}
            >
              Ubah Password
            </button>
            <button
              onClick={() => auth.signOut()}
              className="mt-8 block w-full text-left text-red-500 px-4 py-2 hover:bg-[#C94749] hover:text-white rounded-lg"
            >
              Keluar
            </button>
          </nav>
        </div>

        {/* Konten */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-[#2C441E] mb-6">
            {selectedTab}
          </h2>

          {success && (
            <div className="bg-green-600 text-white px-4 py-2 mb-4 rounded">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-600 text-white px-4 py-2 mb-4 rounded">
              {error}
            </div>
          )}

          {selectedTab === TABS.PROFILE && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-[#2C441E]">
                <img
                  src={
                    photoURL ||
                    `https://ui-avatars.com/api/?name=${displayName || "User"}`
                  }
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                />
                <label className="cursor-pointer bg-gray-200 px-3 py-1 rounded-3xl text-sm text-gray-700 hover:bg-gray-300">
                  Ganti Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2C441E]">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full mt-1 p-2 shadow rounded-3xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2C441E]">
                  Email
                </label>
                <input
                  type="text"
                  value={user.email}
                  disabled
                  className="w-full mt-1 p-2 shadow rounded-3xl bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2C441E]">
                  Lokasi
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1 p-2 shadow rounded-3xl bg-white"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleProfileSave}
                className="mt-4 bg-[#2C441E] text-sm text-white px-4 py-2 rounded-3xl hover:bg-[#56813C]"
              >
                Simpan Perubahan
              </button>
            </div>
          )}

          {selectedTab === TABS.PASSWORD && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2C441E]">
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full mt-1 p-2 shadow rounded-3xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#2C441E]">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mt-1 p-2 shadow rounded-3xl"
                />
              </div>
              <button
                onClick={handlePasswordSave}
                className="mt-4 bg-[#2C441E] text-sm text-white px-4 py-2 rounded-3xl hover:bg-[#56813C]"
              >
                Simpan Password
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
