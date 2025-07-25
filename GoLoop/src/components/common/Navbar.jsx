import React, { useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16m-7 6h7"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-xl font-bold text-[#3E532D]">GoLoop</h1>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-6 text-sm font-semibold">
            <li>
              <ScrollLink
                to="hero"
                smooth={true}
                duration={500}
                className="cursor-pointer hover:text-green-700"
              >
                Home
              </ScrollLink>
            </li>
            <li>
              <ScrollLink
                to="wilayah"
                smooth={true}
                duration={500}
                className="cursor-pointer hover:text-green-700"
              >
                Wilayah
              </ScrollLink>
            </li>
            <li>
              <ScrollLink
                to="about"
                smooth={true}
                duration={500}
                className="cursor-pointer hover:text-green-700"
              >
                About
              </ScrollLink>
            </li>
          </ul>

          <div className="hidden md:block">
            <Link
              to="/login"
              className="bg-[#3E532D] hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full transition"
            >
              Login
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#3E532D] focus:outline-none"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white px-4 pt-2 pb-4 shadow">
          <ScrollLink
            to="hero"
            smooth={true}
            duration={500}
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-[#3E532D] font-semibold hover:text-green-700"
          >
            Home
          </ScrollLink>
          <ScrollLink
            to="wilayah"
            smooth={true}
            duration={500}
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-[#3E532D] font-semibold hover:text-green-700"
          >
            Wilayah
          </ScrollLink>
          <ScrollLink
            to="about"
            smooth={true}
            duration={500}
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-[#3E532D] font-semibold hover:text-green-700"
          >
            About
          </ScrollLink>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="block mt-2 bg-[#3E532D] hover:bg-green-800 text-white text-center font-bold py-2 rounded-full transition"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
