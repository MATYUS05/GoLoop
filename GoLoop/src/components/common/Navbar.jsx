import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between h-16 items-center">
      <img 
        src="#"
        alt="Logo Perusahaan" 
      />
      <ul className="flex space-x-6">
        <li>
          <a href="/" className="hover:text-gray-300">Home</a>
        </li>
        <li>
          <a href="/wilayah" className="hover:text-gray-300">Wilayah</a>
        </li>
        <li>
          <a href="/about" className="hover:text-gray-300">About</a>
        </li>
      </ul>
      <Link 
        to="/login" 
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Login
      </Link>
    </nav>
  );
}

export default Navbar;