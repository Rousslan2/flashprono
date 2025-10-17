import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getUser, isAuthenticated, logout } from "../hooks/useAuth";

export default function Navbar() {
  const [auth, setAuth] = useState({ isAuth: false, user: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const timerRef = useRef(null);
  const location = useLocation();

  const refreshAuth = () =>
    setAuth({ isAuth: isAuthenticated(), user: getUser() });

  useEffect(() => {
    refreshAuth();
    window.addEventListener("auth-update", refreshAuth);
    window.addEventListener("storage", refreshAuth);
    return () => {
      window.removeEventListener("auth-update", refreshAuth);
      window.removeEventListener("storage", refreshAuth);
    };
  }, []);

  // 🔁 se met à jour aussi quand l’URL change
  useEffect(() => {
    refreshAuth();
  }, [location.pathname]);

  const initials = (name = "") =>
    name.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const openMenu = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMenuOpen(true);
  };
  const closeMenu = () => {
    timerRef.current = setTimeout(() => setMenuOpen(false), 200);
  };
  const toggleMenu = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMenuOpen(s => !s);
  };

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("auth-update"));
  };

  return (
    <nav className="bg-black text-primary p-4 flex justify-between items-center shadow-lg z-50 relative">
      <Link to="/" className="text-2xl font-bold">⚡ FlashProno</Link>
      {/* Mobile hamburger */}
      <button
        className="md:hidden ml-auto p-2 border border-primary rounded-lg"
        aria-label="Ouvrir le menu"
        onClick={() => setMenuOpen(o => !o)}
      >
        {/* Icone hamburger */}
        <div className="w-6 h-0.5 bg-primary mb-1.5"></div>
        <div className="w-6 h-0.5 bg-primary mb-1.5"></div>
        <div className="w-6 h-0.5 bg-primary"></div>
      </button>
    

      <div className="hidden md:flex gap-6 items-center">
        <Link to="/pronostics" className="hover:text-white transition">Pronostics</Link>
        <Link to="/abonnements" className="hover:text-white transition">Abonnements</Link>
        {auth.user?.isAdmin && (
          <Link to="/admin" className="hover:text-white transition">Admin</Link>
        )}

        {auth.isAuth ? (
          <>
            <Link to="/dashboard" className="hover:text-white transition">Espace membre</Link>

            <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
              <button
                onClick={toggleMenu}
                className="flex items-center gap-2 bg-[#111] px-3 py-2 rounded-xl border border-primary hover:scale-105 transition"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                  {initials(auth.user?.name || "FP")}
                </div>
                <span className="text-white hidden sm:inline">
                  {auth.user?.name || "Mon profil"}
                </span>
                <svg
                  className={`w-4 h-4 text-primary ml-1 hidden sm:block transition-transform ${menuOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20" fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.108l3.71-3.877a.75.75 0 111.08 1.04l-4.24 4.43a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-black border border-primary rounded-xl shadow-lg transition-all duration-200">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-white hover:bg-[#111] transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mon espace
                  </Link>
                  <a
                    href="https://wa.me/33695962084"
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-2 text-white hover:bg-[#111] transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Support WhatsApp
                  </a>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#111] transition"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/register" className="underline hover:text-white transition">Créer un compte</Link>
            <Link to="/login" className="bg-primary text-black px-4 py-2 rounded-lg hover:scale-105 transition">
              Connexion
            </Link>
          </>
        )}
      </div>
      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 border-t border-primary animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col py-3">
            <Link to="/pronostics" className="px-4 py-3 border-b border-white/10 hover:bg-[#111]" onClick={() => setMenuOpen(false)}>Pronostics</Link>
            <Link to="/abonnements" className="px-4 py-3 border-b border-white/10 hover:bg-[#111]" onClick={() => setMenuOpen(false)}>Abonnements</Link>
            {auth.isAuth ? (
              <>
                <Link to="/dashboard" className="px-4 py-3 border-b border-white/10 hover:bg-[#111]" onClick={() => setMenuOpen(false)}>Espace membre</Link>
                {/* Sous-menu rapide */}
                <Link to="/dashboard" className="px-4 py-3 border-b border-white/10 hover:bg-[#111]" onClick={() => setMenuOpen(false)}>Mon espace</Link>
                <a href="https://wa.me/33695962084" target="_blank" rel="noreferrer" className="px-4 py-3 border-b border-white/10 hover:bg-[#111]" onClick={() => setMenuOpen(false)}>Support</a>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="text-left px-4 py-3 hover:bg-[#111]">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/register" className="px-4 py-3 border-b border-white/10 hover:bg-[#111]" onClick={() => setMenuOpen(false)}>Créer un compte</Link>
                <Link to="/login" className="px-4 py-3 hover:bg-[#111]" onClick={() => setMenuOpen(false)}>Connexion</Link>
              </>
            )}
          </div>
        </div>
      )}

    
  <div className='flex gap-3'>
    <a href='/pronostics'>Pronostics</a>
    <a href='/pronos-en-or'>Pronos en or</a>
    <a href='/strategie-bankroll'>Stratégie bankroll</a>
  </div>
</nav>
  );
}
