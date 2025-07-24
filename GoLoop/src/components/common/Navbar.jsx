import React from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 h-16 bg-white shadow">
      <img src="#" alt="Logo GoLoop" className="h-10 w-auto" />

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
        className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded-full transition"
      >
        Login
      </Link>
    </nav>
  );
}

export default Navbar;
