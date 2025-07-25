import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const RankMedal = ({ rank }) => {
  if (rank === 1) return <span className="text-4xl">🥇</span>;
  if (rank === 2) return <span className="text-4xl">🥈</span>;
  if (rank === 3) return <span className="text-4xl">🥉</span>;
  return null;
};

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const usersCollection = collection(db, "users");
    const q = query(usersCollection, orderBy("points", "desc"), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaderboardData(users);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching leaderboard: ", err);
        setError("Gagal memuat leaderboard.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading)
    return <div className="text-center p-8">Memuat leaderboard...</div>;
  if (error) return <div className="text-center text-red-600 p-4">{error}</div>;

  const topThree = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center text-[#2C441E] mb-6">
        🏆 Papan Peringkat
      </h2>

      {/* Top 3 */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        {topThree.map((user, index) => (
          <div
            key={user.id}
            className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center w-full sm:w-1/3 border border-[#2C441E]"
          >
            <RankMedal rank={index + 1} />
            <img
              src={
                user.photoURL ||
                `https://placehold.co/64x64/E2E8F0/4A5568?text=${
                  user.displayName?.charAt(0) || "U"
                }`
              }
              alt={user.displayName || "User"}
              className="w-16 h-16 rounded-full my-2 object-cover"
            />
            <h3 className="font-semibold text-gray-800 text-center">
              {user.displayName || "Tanpa Nama"}
            </h3>
            <p className="text-[#2C441E] font-bold text-lg">
              {user.points?.toLocaleString("id-ID") || 0} pts
            </p>
          </div>
        ))}
      </div>

      {/* Peringkat 4 ke bawah */}
      {rest.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 bg-[#2C441E] p-4 font-bold text-sm text-white uppercase">
            <div className="col-span-2 text-center">Peringkat</div>
            <div className="col-span-7">Nama</div>
            <div className="col-span-3 text-right">Poin</div>
          </div>

          {/* Data */}
          {rest.map((user, index) => (
            <div
              key={user.id}
              className="grid grid-cols-12 md:grid-cols-12 gap-4 items-center p-4 border-b border-[#2C441E] transition-all"
            >
              <div className="col-span-12 md:col-span-2 text-center text-xl font-bold text-gray-600">
                {index + 4}
              </div>
              <div className="col-span-12 md:col-span-7 flex items-center gap-3">
                <img
                  src={
                    user.photoURL ||
                    `https://placehold.co/40x40/E2E8F0/4A5568?text=${
                      user.displayName?.charAt(0) || "U"
                    }`
                  }
                  alt={user.displayName || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="font-medium text-gray-800">
                  {user.displayName || "Tanpa Nama"}
                </span>
              </div>
              <div className="col-span-12 md:col-span-3 text-right text-[#2C441E] font-semibold text-lg">
                {user.points?.toLocaleString("id-ID") || 0}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
