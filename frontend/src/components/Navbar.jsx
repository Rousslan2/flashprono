import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { path: "/", label: "Accueil" },
    { path: "/pronostics", label: "Pronostics" },
    { path: "/abonnements", label: "Abonnements" },
    { path: "/admin", label: "Admin" },
  ];

  return (
    <nav className="bg-black/90 backdrop-blur-md border-b border-[#1f1f1f] text-white sticky top-0 z-50">
      <div className="container-mobile flex items-center justify-between h-16">
        {/* LOGO */}
        <Link
          to="/"
          className="text-[#38ff73] text-xl font-bold flex items-center gap-1"
        >
          ⚡ FlashProno
        </Link>

        {/* BOUTON BURGER (mobile uniquement) */}
        <button
          className="sm:hidden text-2xl focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* LIENS DESKTOP */}
        <div className="hidden sm:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors ${
                location.pathname === link.path
                  ? "text-[#38ff73] font-semibold"
                  : "text-gray-300 hover:text-[#38ff73]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* MENU MOBILE DÉROULANT */}
      {menuOpen && (
        <div className="sm:hidden border-t border-[#1f1f1f] bg-black/95 backdrop-blur-md px-4 py-3 flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMenuOpen(false)}
              className={`${
                location.pathname === link.path
                  ? "text-[#38ff73] font-semibold"
                  : "text-gray-300 hover:text-[#38ff73]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
