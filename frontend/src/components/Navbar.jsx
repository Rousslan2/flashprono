import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getUser, isAuthenticated, logout } from "../hooks/useAuth";

export default function Navbar() {
  const [auth, setAuth] = useState({ isAuth: false, user: null });
  const [menuOpen, setMenuOpen] = useState(false);     // menu mobile
  const [profileOpen, setProfileOpen] = useState(false); // dropdown profil (desktop)
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

  // Fermer menus au changement de page
  useEffect(() => {
    refreshAuth();
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const initials = (name = "") =>
    name.trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    logout();
    window.dispatchEvent(new Event("auth-update"));
  };

  // helpers dropdown profil (desktop)
  const openProfile = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setProfileOpen(true);
  };
  const closeProfile = () => {
    timerRef.current = setTimeout(() => setProfileOpen(false), 180);
  };
  const toggleProfile = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setProfileOpen(s => !s);
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/85 backdrop-blur border-b border-[#111]">
      {/* Barre principale : grille 3 colonnes pour centrer le logo sur mobile */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-3 md:py-4 grid grid-cols-3 items-center">
        {/* Colonne gauche (mobile: vide / desktop: liens centrés en section dédiée) */}
        <div className="flex items-center gap-2 md:hidden" />

        {/* Colonne milieu : Logo centré */}
        <div className="flex justify-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2">
            ⚡ <span className="text-green-400">FlashProno</span>
          </Link>
        </div>

        {/* Colonne droite : Hamburger mobile / Profil desktop */}
        <div className="flex items-center justify-end gap-3">
          {/* Hamburger (mobile) */}
          <button
            className="md:hidden p-2 border border-primary rounded-lg"
            aria-label="Ouvrir le menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <div className="w-6 h-0.5 bg-primary mb-1.5" />
            <div className="w-6 h-0.5 bg-primary mb-1.5" />
            <div className="w-6 h-0.5 bg-primary" />
          </button>

          {/* Profil (desktop) */}
          <div className="hidden md:flex items-center">
            {auth.isAuth ? (
              <div
                className="relative"
                onMouseEnter={openProfile}
                onMouseLeave={closeProfile}
              >
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 bg-[#111] px-3 py-2 rounded-xl border border-primary hover:scale-105 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                    {initials(auth.user?.name || "FP")}
                  </div>
                  <span className="text-white hidden sm:inline">
                    {auth.user?.name || "Mon profil"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-primary ml-1 hidden sm:block transition-transform ${profileOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.108l3.71-3.877a.75.75 0 111.08 1.04l-4.24 4.43a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-black border border-primary rounded-xl shadow-lg transition-all duration-200 z-50">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-white hover:bg-[#111] transition"
                      onClick={() => setProfileOpen(false)}
                    >
                      Mon espace
                    </Link>
                    <a
                      href="https://wa.me/33695962084"
                      target="_blank"
                      rel="noreferrer"
                      className="block px-4 py-2 text-white hover:bg-[#111] transition"
                      onClick={() => setProfileOpen(false)}
                    >
                      Support WhatsApp
                    </a>
                    {auth.user?.isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-white hover:bg-[#111] transition"
                        onClick={() => setProfileOpen(false)}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-[#111] transition"
                    >
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link to="/register" className="underline hover:text-white transition">
                  Créer un compte
                </Link>
                <Link
                  to="/login"
                  className="bg-primary text-black px-4 py-2 rounded-lg hover:scale-105 transition"
                >
                  Connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu desktop (sous la ligne principale) */}
      <div className="hidden md:flex">
        <div className="mx-auto max-w-7xl px-6 pb-3">
          <div className="flex items-center justify-center gap-8 text-green-400 font-medium">
            <Link to="/pronostics" className="hover:text-white transition">Pronostics</Link>
            <Link to="/abonnements" className="hover:text-white transition">Abonnements</Link>
            {auth.user?.isAdmin && (
              <Link to="/admin" className="hover:text-white transition">Admin</Link>
            )}
            {auth.isAuth && (
              <Link to="/dashboard" className="hover:text-white transition">Espace membre</Link>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile (déroulant sous la barre) */}
      {menuOpen && (
        <div className="md:hidden bg-black/96 border-t border-primary animate-in fade-in slide-in-from-top-2 z-40">
          <div className="flex flex-col py-3">
            <Link
              to="/pronostics"
              className="px-4 py-3 border-b border-white/10 hover:bg-[#111]"
              onClick={() => setMenuOpen(false)}
            >
              Pronostics
            </Link>
            <Link
              to="/abonnements"
              className="px-4 py-3 border-b border-white/10 hover:bg-[#111]"
              onClick={() => setMenuOpen(false)}
            >
              Abonnements
            </Link>
            {auth.user?.isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-3 border-b border-white/10 hover:bg-[#111]"
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {auth.isAuth ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-3 border-b border-white/10 hover:bg-[#111]"
                  onClick={() => setMenuOpen(false)}
                >
                  Espace membre
                </Link>
                <a
                  href="https://wa.me/33695962084"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 border-b border-white/10 hover:bg-[#111]"
                  onClick={() => setMenuOpen(false)}
                >
                  Support
                </a>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="text-left px-4 py-3 hover:bg-[#111]"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-4 py-3 border-b border-white/10 hover:bg-[#111]"
                  onClick={() => setMenuOpen(false)}
                >
                  Créer un compte
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-3 hover:bg-[#111]"
                  onClick={() => setMenuOpen(false)}
                >
                  Connexion
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
