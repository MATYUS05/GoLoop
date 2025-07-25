import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebase';
import { onAuthStateChanged, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Daftar kota untuk dropdown, bisa Anda sesuaikan
const CITIES = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Makassar', 'Semarang', 'Yogyakarta', 'Denpasar', 'Lainnya'];

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ displayName: '', location: '' });
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // State untuk UI
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // State untuk notifikasi
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mengambil data user saat komponen dimuat
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData({
            displayName: data.displayName || currentUser.displayName || '',
            location: data.location || CITIES[0],
          });
          setImagePreview(currentUser.photoURL || '');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);
  
  // Handler universal untuk form
  const handleInputChange = (e) => {
    setProfileData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000); // Pesan hilang setelah 3 detik
  };

  // Fungsi untuk simpan perubahan nama & lokasi
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setIsSavingProfile(true);

    try {
      await updateProfile(user, { displayName: profileData.displayName });
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: profileData.displayName,
        location: profileData.location,
      });
      showSuccessMessage("Informasi profil berhasil diperbarui!");
    } catch (err) {
      setError("Gagal memperbarui profil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Fungsi untuk upload foto ke Cloudinary
  const handlePictureUpload = async () => {
    if (!user || !profileImage) return;
    setError('');
    setIsUploading(true);
    
    // ... Logika upload ke Cloudinary Anda ...
    // (Contoh disederhanakan)
    const formData = new FormData();
    formData.append("file", profileImage);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    try {
        const response = await fetch(url, { method: 'POST', body: formData });
        const data = await response.json();
        if(data.secure_url) {
            const photoURL = data.secure_url;
            await updateProfile(user, { photoURL });
            await updateDoc(doc(db, "users", user.uid), { photoURL });
            setUser(prev => ({ ...prev, photoURL }));
            showSuccessMessage("Foto profil berhasil diubah!");
        } else {
            throw new Error("Upload gagal");
        }
    } catch(err) {
        setError("Gagal mengupload gambar.");
    } finally {
        setIsUploading(false);
    }
  };

  // Fungsi untuk ubah password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!user || !currentPassword || !newPassword) return;
    if (newPassword.length < 6) return setError("Password baru minimal 6 karakter.");

    setError('');
    setIsChangingPassword(true);
    
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showSuccessMessage("Password berhasil diubah!");
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError("Gagal mengubah password. Pastikan password saat ini benar.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Pengaturan Profil</h1>
        
        {/* Notifikasi Sukses & Error */}
        {success && <div className="mb-6 p-3 bg-green-100 text-green-800 rounded-lg">{success}</div>}
        {error && <div className="mb-6 p-3 bg-red-100 text-red-800 rounded-lg">{error}</div>}

        {/* --- Tata Letak Grid Utama --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* --- Kolom Kiri: Foto Profil --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Foto Profil</h2>
              <img
                src={imagePreview || `https://ui-avatars.com/api/?name=${profileData.displayName || 'A'}&background=random&color=fff&size=128`}
                alt="Profile"
                className="w-32 h-32 rounded-full mb-4 object-cover mx-auto border-4 border-gray-200"
              />
              <p className="text-sm text-gray-500 mb-4">Pilih file gambar baru untuk diunggah.</p>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <label htmlFor="file-upload" className="cursor-pointer bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 text-sm font-medium">
                Pilih Gambar
              </label>
              {profileImage && (
                <button onClick={handlePictureUpload} disabled={isUploading} className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300">
                  {isUploading ? 'Mengunggah...' : 'Upload Foto'}
                </button>
              )}
            </div>
          </div>

          {/* --- Kolom Kanan: Form Data --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form Informasi Umum */}
            <form onSubmit={handleProfileUpdate} className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">Informasi Umum</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                  <input type="text" name="displayName" id="displayName" value={profileData.displayName} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-600 mb-1">Lokasi</label>
                  <select name="location" id="location" value={profileData.location} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white">
                    {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isSavingProfile} className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>

            {/* Form Ubah Password */}
            <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">Ubah Password</h2>
              <div className="space-y-4">
                 <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-600 mb-1">Password Saat Ini</label>
                  <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-1">Password Baru</label>
                  <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required />
                </div>
              </div>
              <button type="submit" disabled={isChangingPassword} className="mt-6 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400">
                {isChangingPassword ? 'Memproses...' : 'Ubah Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProfilePage;