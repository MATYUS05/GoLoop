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
import Footer from "../../components/common/Footer";
import { FaTrophy } from "react-icons/fa";

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
  const [profileData, setProfileData] = useState({
    displayName: "",
    location: CITIES[0],
  });
  const [points, setPoints] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData({
            displayName: data.displayName || currentUser.displayName || "",
            location: data.location || CITIES[0],
          });
          setImagePreview(currentUser.photoURL || "");
          setPoints(data.points || 0);
        } else {
          setProfileData({
            displayName: currentUser.displayName || "",
            location: CITIES[0],
          });
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;
    setError("");
    setIsSavingProfile(true);

    try {
      await updateProfile(user, { displayName: profileData.displayName });
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: profileData.displayName,
        location: profileData.location,
      });
      showSuccessMessage("Profil berhasil diperbarui!");
    } catch (err) {
      setError("Gagal memperbarui profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePictureUpload = async () => {
    if (!user || !profileImage) return;
    setError("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", profileImage);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    );
    const url = `https://api.cloudinary.com/v1_1/${
      import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    }/image/upload`;

    try {
      const response = await fetch(url, { method: "POST", body: formData });
      const data = await response.json();
      if (data.secure_url) {
        const photoURL = data.secure_url;
        await updateProfile(user, { photoURL });
        await updateDoc(doc(db, "users", user.uid), { photoURL });
        setImagePreview(photoURL);
        showSuccessMessage("Foto profil berhasil diubah!");
      } else {
        throw new Error("Upload gagal");
      }
    } catch (err) {
      setError("Gagal mengupload gambar.");
    } finally {
      setIsUploading(false);
      setProfileImage(null);
    }
  };

  const handlePasswordSave = async () => {
    if (!user || !currentPassword || !newPassword) return;
    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    setError("");
    setIsChangingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showSuccessMessage("Password berhasil diubah!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError("Gagal mengganti password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="p-12 flex-1 flex items-center justify-center">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-lg flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 bg-[#2C441E] p-6 border-r">
            <div className="flex flex-col items-center mb-6">
              <img
                src={
                  imagePreview ||
                  `https://ui-avatars.com/api/?name=${
                    profileData.displayName || "User"
                  }`
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white mb-4"
              />
              <div className="text-white text-center mb-6">
                <div className="font-bold text-xl truncate max-w-full">
                  {profileData.displayName || "(Belum Ada Nama)"}
                </div>
                <div className="flex items-center justify-center mt-2 text-yellow-500">
                  <FaTrophy className="mr-1" />
                  <span className="text-white">{points} Poin</span>
                </div>
              </div>
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

          {/* Konten Utama */}
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
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4 text-[#2C441E]">
                  <div className="relative">
                    <img
                      src={
                        imagePreview ||
                        `https://ui-avatars.com/api/?name=${
                          profileData.displayName || "User"
                        }`
                      }
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-300"
                    />
                    <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-700"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </label>
                  </div>

                  {profileImage && (
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        onClick={handlePictureUpload}
                        disabled={isUploading}
                        className="bg-[#2C441E] text-sm text-white px-4 py-2 rounded-3xl hover:bg-[#56813C] disabled:opacity-50"
                      >
                        {isUploading ? "Mengunggah..." : "Upload Foto"}
                      </button>
                      <span className="text-xs text-gray-500">
                        Foto akan tampil setelah diupload
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2C441E]">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-3 shadow rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2C441E]"
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
                      className="w-full mt-1 p-3 shadow rounded-xl bg-gray-100 text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#2C441E]">
                      Lokasi
                    </label>
                    <select
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-3 shadow rounded-xl bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2C441E]"
                    >
                      {CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleProfileSave}
                  disabled={isSavingProfile}
                  className="mt-4 w-full bg-[#2C441E] text-white px-4 py-3 rounded-xl hover:bg-[#56813C] transition-colors disabled:opacity-50"
                >
                  {isSavingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            )}

            {selectedTab === TABS.PASSWORD && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#2C441E]">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full mt-1 p-3 shadow rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2C441E]"
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
                      className="w-full mt-1 p-3 shadow rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2C441E]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Password minimal 6 karakter
                    </p>
                  </div>
                </div>
                <button
                  onClick={handlePasswordSave}
                  disabled={isChangingPassword}
                  className="mt-4 w-full bg-[#2C441E] text-white px-4 py-3 rounded-xl hover:bg-[#56813C] transition-colors disabled:opacity-50"
                >
                  {isChangingPassword ? "Mengubah..." : "Simpan Password"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfilePage;
