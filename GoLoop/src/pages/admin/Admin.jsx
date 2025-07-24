import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollectionRef = collection(db, "users");
        const data = await getDocs(usersCollectionRef);
        const fetchedUsers = data.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setUsersList(fetchedUsers);
      } catch (err) {
        console.error("Gagal mengambil data pengguna:", err);
        setError("Tidak dapat memuat data pengguna. Pastikan aturan keamanan benar.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="rounded-md bg-red-600 py-2 px-4 font-semibold text-white shadow-sm hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Daftar Pengguna</h2>
      {loading && <p>Memuat daftar pengguna...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead className="ltr:text-left rtl:text-right">
              <tr>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Nama</th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Email</th>
                <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {usersList.map((user) => (
                <tr key={user.id}>
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">{user.name}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">{user.email}</td>
                  <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;