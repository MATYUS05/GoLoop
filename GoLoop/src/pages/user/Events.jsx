import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

function EventsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const fetchUserProfile = async () => {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          } else {
            console.log("Tidak ada data profil untuk user ini di Firestore.");
          }
        };

        fetchUserProfile();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Halaman Events</h1>
      {userProfile ? (
        <p className="mt-2">Selamat datang kembali, {userProfile.name}!</p>
      ) : user ? (
        <p className="mt-2">Selamat datang kembali, {user.email}!</p>
      ) : null}

      <div className="mt-8 p-4 border rounded-lg bg-gray-50">
        <p className="font-semibold">
          Konten untuk Events akan ditampilkan di sini.
        </p>
      </div>

      {/* 3. Tombol logout diperbarui */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-6 rounded-md bg-red-600 py-2 px-4 font-semibold text-white shadow-sm hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? "Keluar..." : "Logout"}
      </button>
    </div>
  );
}

export default EventsPage;
