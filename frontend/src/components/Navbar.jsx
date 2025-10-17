import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const onClick = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [open, profileOpen]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/60 bg-black/80 border-b border-[#141414]">
      <nav className="container-mobile h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-[#38ff73]">
          ⚡ FlashProno
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" className="hover:text-[#38ff73]">Accueil</NavLink>
          <NavLink to="/pronostics" className="hover:text-[#38ff73]">Pronostics</NavLink>
          <NavLink to="/abonnements" className="hover:text-[#38ff73]">Abonnements</NavLink>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!token ? (
            <>
              <Link to="/register" className="btn btn-outline px-4 py-2">Créer un compte</Link>
              <Link to="/login" className="btn btn-primary px-4 py-2">Connexion</Link>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 border border-[#1f1f1f] hover:border-[#38ff73]">
                <div className="size-7 bg-[#131313] rounded-full grid place-items-center">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="max-w-[120px] truncate">{user?.name || "Profil"}</span>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 card p-2">
                  <Link className="block px-3 py-2 rounded hover:bg-white/5" to="/dashboard">Espace membre</Link>
                  <a className="block px-3 py-2 rounded hover:bg-white/5" href="https://wa.me/33695962084" target="_blank" rel="noreferrer">Support WhatsApp</a>
                  {user?.isAdmin && (
                    <Link className="block px-3 py-2 rounded hover:bg-white/5" to="/admin">Admin</Link>
                  )}
                  <button onClick={logout} className="block w-full text-left px-3 py-2 rounded hover:bg-white/5 text-red-400">
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="md:hidden inline-flex items-center justify-center size-10 rounded-lg border border-[#1f1f1f] active:scale-95"
          onClick={() => setOpen((v) => !v)}
          aria-label="Ouvrir le menu">
          ☰
        </button>
      </nav>

      {open && (
        <div ref={menuRef} className="md:hidden border-t border-[#141414] bg-black/95">
          <div className="container-mobile py-3 flex flex-col gap-1">
            <NavLink to="/" onClick={() => setOpen(false)} className="px-2 py-2 rounded hover:bg-white/5">Accueil</NavLink>
            <NavLink to="/pronostics" onClick={() => setOpen(false)} className="px-2 py-2 rounded hover:bg-white/5">Pronostics</NavLink>
            <NavLink to="/abonnements" onClick={() => setOpen(false)} className="px-2 py-2 rounded hover:bg-white/5">Abonnements</NavLink>

            {!token ? (
              <div className="pt-2 grid gap-2">
                <Link to="/register" onClick={() => setOpen(false)} className="btn btn-outline w-full px-4 py-3">Créer un compte</Link>
                <Link to="/login" onClick={() => setOpen(false)} className="btn btn-primary w-full px-4 py-3">Connexion</Link>
              </div>
            ) : (
              <div className="pt-2 grid gap-1">
                <span className="px-2 py-2 text-sm text-gray-400">Connecté : {user?.name}</span>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="px-2 py-2 rounded hover:bg-white/5">Espace membre</Link>
                {user?.isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="px-2 py-2 rounded hover:bg-white/5">Admin</Link>
                )}
                <a className="px-2 py-2 rounded hover:bg-white/5" href="https://wa.me/33695962084" target="_blank" rel="noreferrer">Support WhatsApp</a>
                <button onClick={() => { setOpen(false); logout(); }} className="px-2 py-2 text-left rounded hover:bg-white/5 text-red-400">Se déconnecter</button>
              </div>
            )}
          </div>
          <div style={{height: 'var(--safe-b)'}} />
        </div>
      )}
    </header>
  );
}
