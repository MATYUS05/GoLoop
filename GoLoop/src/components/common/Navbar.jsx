import React from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 h-16 bg-white shadow">
      <h1 className="text-xl font-bold text-[#3E532D]">GoLoop</h1>
      <ul className="flex space-x-6 text-sm font-semibold">
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

      <Link
        to="/login"
        className="bg-[#3E532D] hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full transition"
      >
        Login
      </Link>
    </nav>
  );
}

export default Navbar;
