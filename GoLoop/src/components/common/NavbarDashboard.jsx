import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebase'; 

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);


function NavbarDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);


  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md fixed w-full z-20 top-0">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <button
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </button>

            <div className="flex items-center">
              <Link
                to="/profile"
                className="w-10 h-10 bg-gray-300 rounded-full block focus:outline-none overflow-hidden"
                aria-label="User profile"
              >
                {user && user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-lg font-bold text-white bg-indigo-500">
                    {user ? user.email.charAt(0).toUpperCase() : "?"}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#3E532D] text-white transform transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <button onClick={toggleSidebar} className="focus:outline-none">
              <CloseIcon />
            </button>
          </div>
          <nav>
            <Link
              to="/home1"
              onClick={toggleSidebar}
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#52733E]"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              onClick={toggleSidebar}
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#52733E]"
            >
              Events
            </Link>
            <Link
              to="/profile"
              onClick={toggleSidebar}
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#52733E]"
            >
              Profil
            </Link>
            <Link
              to="/my-event"
              onClick={toggleSidebar}
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#52733E]"
            >
              MyEvent
            </Link>
            <Link
              to="/kenali-sampah"
              onClick={toggleSidebar}
              className="block py-2.5 px-4 rounded transition duration-200 hover:bg-[#52733E]"
            >
              Kenali Sampah
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left block py-2.5 px-4 rounded transition duration-200 hover:bg-[#52733E]"
            >
              Logout
            </button>
          </nav>
        </div>
      </aside>
      <div className="pt-16"></div>
    </>
  );
}

export default NavbarDashboard;