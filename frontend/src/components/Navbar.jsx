// frontend/src/components/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { getUser, isAuthenticated, logout } from "../hooks/useAuth";

export default function Navbar() {
  const [auth, setAuth] = useState({ isAuth: false, user: null });
  const [menuOpen, setMenuOpen] = useState(false); // mobile + dropdown
  const [profileOpen, setProfileOpen] = useState(false); // dropdown profil (desktop)
  const [scrolled, setScrolled] = useState(false); // effet sticky
  const timerRef = useRef(null);
  const location = useLocation();

  const refreshAuth = () =>
    setAuth({ isAuth: isAuthenticated(), user: getUser() });

  useEffect(() => {
    refreshAuth();
    window.addEventListener("auth-update", refreshAuth);
    window.addEventListener("storage", refreshAuth);
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("auth-update", refreshAuth);
      window.removeEventListener("storage", refreshAuth);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Ferme menus quand la route change
  useEffect(() => {
    refreshAuth();
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const initials = (name = "") =>
    name.trim().split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();

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
    setProfileOpen((s) => !s);
  };

  // Lien actif
  const NavA = ({ to, children }) => {
    const active =
      location.pathname === to ||
      (to !== "/" && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={
          "transition " +
          (active
            ? "text-white"
            : "text-green-400 hover:text-white focus:text-white")
        }
      >
        {children}
      </Link>
    );
  };

  return (
    <nav
      className={[
        "sticky top-0 left-0 right-0 z-50",
        "backdrop-blur supports-[backdrop-filter]:bg-black/70",
        scrolled ? "bg-black/80 border-b border-[#0e1a0e]" : "bg-black/60",
      ].join(" ")}
      role="navigation"
      aria-label="Navigation principale"
    >
      {/* Contenu */}
      <div className="px-4 md:px-8 py-3 md:py-4">
        {/* Grille à 3 zones: gauche / centre / droite */}
        <div className="mx-auto flex items-center gap-4 max-w-7xl">
          {/* Gauche : Logo + hamburger (mobile) */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-2xl font-bold flex items-center gap-2 select-none"
            >
              ⚡ <span className="text-green-400">FlashProno</span>
            </Link>

            {/* Hamburger (mobile) */}
            <button
              className={[
                "md:hidden ml-0 rounded-xl border border-primary/70",
                "h-10 w-10 grid place-items-center active:scale-95 transition",
                "focus:outline-none focus:ring-2 focus:ring-primary/70",
              ].join(" ")}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span
                className={[
                  "block w-5 h-0.5 bg-primary",
                  "before:block before:w-5 before:h-0.5 before:bg-primary before:translate-y-[-6px]",
                  "after:block after:w-5 after:h-0.5 after:bg-primary after:translate-y-[6px]",
                  "relative",
                ].join(" ")}
              />
            </button>
          </div>

          {/* Centre : Menu desktop CENTRÉ */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-8 font-medium">
              <NavA to="/pronostics">Pronostics</NavA>
              <NavA to="/abonnements">Abonnements</NavA>
              <NavA to="/bankroll">Bankroll</NavA>
              <NavA to="/strategies">Stratégies</NavA>
              {auth.user?.isAdmin && <NavA to="/admin">Admin</NavA>}
              {auth.isAuth && <NavA to="/dashboard">Espace membre</NavA>}
            </div>
          </div>

          {/* Droite : actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {auth.isAuth ? (
              <div
                className="relative"
                onMouseEnter={openProfile}
                onMouseLeave={closeProfile}
              >
                <button
                  onClick={toggleProfile}
                  className="flex items-center gap-2 bg-[#0c0c0c] px-3 py-2 rounded-xl border border-primary/70 hover:scale-105 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-black flex items-center justify-center font-bold">
                    {initials(auth.user?.name || "FP")}
                  </div>
                  <span className="text-white hidden sm:inline">
                    {auth.user?.name || "Mon profil"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-primary ml-1 hidden sm:block transition-transform ${
                      profileOpen ? "rotate-180" : ""
                    }`}
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
                  <div className="absolute right-0 mt-2 w-56 bg-black/95 border border-primary rounded-xl shadow-lg transition-all duration-200 z-50">
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
              <>
                <Link
                  to="/register"
                  className="underline hover:text-white transition text-green-400"
                >
                  Créer un compte
                </Link>
                <Link
                  to="/login"
                  className="bg-primary text-black px-4 py-2 rounded-lg hover:scale-105 transition"
                >
                  Connexion
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile (sous la barre). La barre est sticky, donc le menu suit le scroll. */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 border-t border-primary animate-in fade-in slide-in-from-top-2 z-40">
          <div className="flex flex-col py-2">
            <MobileItem to="/pronostics" close={() => setMenuOpen(false)}>
              Pronostics
            </MobileItem>
            <MobileItem to="/abonnements" close={() => setMenuOpen(false)}>
              Abonnements
            </MobileItem>
            <MobileItem to="/bankroll" close={() => setMenuOpen(false)}>
              Bankroll
            </MobileItem>
            <MobileItem to="/strategies" close={() => setMenuOpen(false)}>
              Stratégies
            </MobileItem>

            {auth.user?.isAdmin && (
              <MobileItem to="/admin" close={() => setMenuOpen(false)}>
                Admin
              </MobileItem>
            )}

            {auth.isAuth ? (
              <>
                <MobileItem to="/dashboard" close={() => setMenuOpen(false)}>
                  Espace membre
                </MobileItem>
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
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-left px-4 py-3 hover:bg-[#111]"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <MobileItem to="/register" close={() => setMenuOpen(false)}>
                  Créer un compte
                </MobileItem>
                <MobileItem to="/login" close={() => setMenuOpen(false)}>
                  Connexion
                </MobileItem>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function MobileItem({ to, children, close }) {
  return (
    <Link
      to={to}
      className="px-4 py-3 border-b border-white/10 hover:bg-[#111]"
      onClick={close}
    >
      {children}
    </Link>
  );
}
