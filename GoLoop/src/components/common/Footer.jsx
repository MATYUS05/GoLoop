import React from "react";
import { Link as ScrollLink } from "react-scroll";
import {
  FaEnvelope,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  const emails = [
    "caesarjansen1@gmail.com",
    "chelseaarantzaa@gmail.com",
    "mattyuslih@gmail.com",
    "edbertrendrahadiliong25@gmail.com",
  ];

  return (
    <footer className="bg-[#3E532D] text-white pt-12 pb-6">
      <div className="container mx-auto px-6 md:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">GoLoop</h3>
            <p className="mb-4 text-sm">Aksi Nyata untuk Bumi Lebih Bersih</p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-green-300 transition">
                <FaFacebook />
              </a>
              <a href="#" className="hover:text-green-300 transition">
                <FaTwitter />
              </a>
              <a href="#" className="hover:text-green-300 transition">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-green-300 transition">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <ScrollLink
                  to="hero"
                  smooth
                  duration={500}
                  className="hover:text-green-300 cursor-pointer transition"
                >
                  Beranda
                </ScrollLink>
              </li>
              <li>
                <ScrollLink
                  to="wilayah"
                  smooth
                  duration={500}
                  className="hover:text-green-300 cursor-pointer transition"
                >
                  Wilayah
                </ScrollLink>
              </li>
              <li>
                <ScrollLink
                  to="about"
                  smooth
                  duration={500}
                  className="hover:text-green-300 cursor-pointer transition"
                >
                  Tentang Kami
                </ScrollLink>
              </li>
              <li>
                <Link to="/login" className="hover:text-green-300 transition">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Kontak Kami</h3>
            <ul className="space-y-3">
              {emails.map((email, index) => (
                <li key={index} className="flex items-start">
                  <FaEnvelope className="mt-1 mr-3" />
                  <span>{email}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#4a653a] mt-10 pt-6 text-center text-sm text-[#d1e0c5]">
          <p>
            © {new Date().getFullYear()} GoLoop. Seluruh hak cipta dilindungi.
          </p>
          <div className="mt-2 space-x-6">
            <Link to="/privacy" className="hover:text-green-300 transition">
              Kebijakan Privasi
            </Link>
            <Link to="/terms" className="hover:text-green-300 transition">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
