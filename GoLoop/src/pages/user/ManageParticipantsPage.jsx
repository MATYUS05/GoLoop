import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc,
  increment 
} from 'firebase/firestore';

function ManageParticipantsPage() {
  const { eventId } = useParams();
  const [eventTitle, setEventTitle] = useState('');
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventTitle = async () => {
      if (!eventId) return;
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        setEventTitle(eventDoc.data().title);
      }
    };
    fetchEventTitle();

    const regRef = collection(db, 'events', eventId, 'registrations');
    const unsubscribe = onSnapshot(regRef, (snapshot) => {
      const allParticipants = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPending(allParticipants.filter(p => p.status === 'pending'));
      setApproved(allParticipants.filter(p => p.status === 'approved'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  const handleUpdateStatus = async (userId, newStatus) => {
    const regDocRef = doc(db, 'events', eventId, 'registrations', userId);
    const eventRef = doc(db, 'events', eventId);
    
    try {
      await updateDoc(regDocRef, { status: newStatus });

      if (newStatus === 'rejected') {
          await updateDoc(eventRef, {
              registered: increment(-1)
          });
      }
    } catch (error) {
      console.error("Gagal update status:", error);
    }
  };

  const renderList = (participants, type) => {
    if (participants.length === 0) {
      return <p className="text-gray-500 px-4 py-4 text-center">Tidak ada pendaftar dalam kategori ini.</p>;
    }
    return (
      <ul className="divide-y divide-gray-200">
        {participants.map(p => (
          <li key={p.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <img 
                src={p.photoURL || `https://ui-avatars.com/api/?name=${p.displayName}&background=random&color=fff`} 
                alt={p.displayName} 
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="font-medium text-gray-800">{p.displayName}</span>
            </div>
            {type === 'pending' && (
              <div className="space-x-2">
                <button 
                  onClick={() => handleUpdateStatus(p.id, 'approved')} 
                  className="bg-green-100 text-green-800 text-xs font-bold py-1 px-3 rounded-full hover:bg-green-200"
                >
                  Approve
                </button>
                <button 
                  onClick={() => handleUpdateStatus(p.id, 'rejected')} 
                  className="bg-red-100 text-red-800 text-xs font-bold py-1 px-3 rounded-full hover:bg-red-200"
                >
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };
  
  if (loading) return <p className="text-center p-8">Memuat data pendaftar...</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Link to="/my-event" className="text-sm font-semibold text-gray-600 hover:text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Event Saya
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Manajemen Partisipan</h1>
          <p className="text-lg text-gray-500">{eventTitle}</p>
        </div>
        
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-yellow-50 p-4 border-b border-yellow-200">
              <h2 className="text-xl font-semibold text-yellow-800">Menunggu Persetujuan ({pending.length})</h2>
            </div>
            {renderList(pending, 'pending')}
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-green-50 p-4 border-b border-green-200">
              <h2 className="text-xl font-semibold text-green-800">Partisipan Disetujui ({approved.length})</h2>
            </div>
            {renderList(approved, 'approved')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageParticipantsPage;