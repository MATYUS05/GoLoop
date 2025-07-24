import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebase'; // Pastikan path ini benar
import { onAuthStateChanged, updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ displayName: '', location: '' });
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
            location: data.location || '',
          });
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({ ...prevState, [name]: value }));
  };

  // Fungsi untuk simpan perubahan nama & lokasi
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError(''); setSuccess('');

    try {
      await updateProfile(user, { displayName: profileData.displayName });
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: profileData.displayName,
        location: profileData.location,
      });
      setSuccess("Profil berhasil diperbarui!");
    } catch (err) {
      setError("Gagal memperbarui profil.");
    }
  };

  // Fungsi untuk upload foto ke CLOUDINARY
  const handlePictureUpload = async () => {
    if (!user || !profileImage) return;
    setError(''); setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append("file", profileImage);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    try {
      const response = await fetch(url, { method: "POST", body: formData });
      const data = await response.json();
      
      if (data.secure_url) {
        const downloadURL = data.secure_url;
        await updateProfile(user, { photoURL: downloadURL });
        await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });
        setUser({ ...user, photoURL: downloadURL });
        setSuccess("Foto profil berhasil diubah!");
      } else {
        throw new Error("Gagal mendapatkan URL dari Cloudinary.");
      }
    } catch (err) {
      setError("Gagal mengupload gambar.");
    } finally {
      setUploading(false);
    }
  };

  // Fungsi untuk ubah password
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!user || !currentPassword || !newPassword) return;
    setError(''); setSuccess('');

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess("Password berhasil diubah!");
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError("Gagal mengubah password. Pastikan password saat ini benar.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Edit Profil</h1>
      
      {error && <p className="p-3 bg-red-100 text-red-700 rounded-md">{error}</p>}
      {success && <p className="p-3 bg-green-100 text-green-700 rounded-md">{success}</p>}

      <form onSubmit={handleProfileUpdate} className="p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Informasi Umum</h2>
        <div className="space-y-4">
          <input type="text" name="displayName" value={profileData.displayName} onChange={handleInputChange} placeholder="Username" className="w-full p-2 border rounded" />
          <input type="text" name="location" value={profileData.location} onChange={handleInputChange} placeholder="Lokasi (e.g., Jakarta)" className="w-full p-2 border rounded" />
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Simpan Perubahan</button>
      </form>

      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Foto Profil</h2>
        <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${profileData.displayName || 'U'}&background=random`} alt="Profile" className="w-32 h-32 rounded-full mb-4 object-cover" />
        <input type="file" accept="image/*" onChange={(e) => setProfileImage(e.target.files[0])} className="mb-2 block" />
        <button onClick={handlePictureUpload} disabled={uploading} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300">
          {uploading ? 'Mengunggah...' : 'Upload Foto'}
        </button>
      </div>

      <form onSubmit={handlePasswordChange} className="p-6 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Ubah Password</h2>
        <div className="space-y-4">
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Password Saat Ini" className="w-full p-2 border rounded" required />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password Baru (min. 6 karakter)" className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">Ubah Password</button>
      </form>
    </div>
  );
}

export default ProfilePage;