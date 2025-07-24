import React from "react";
import { Link as ScrollLink } from "react-scroll";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#344326] text-white py-3 px-6 flex justify-between items-center">
      <span className="font-semibold text-lg">GoLoop</span>
      <span className="text-sm">© 2025 GarudaHacks 6.0</span>
    </footer>
  );
}

export default Footer;
