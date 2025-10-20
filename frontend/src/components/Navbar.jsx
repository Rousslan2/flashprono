import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useRealtimeUser } from "../hooks/useAuth";
import { logout } from "../hooks/useAuth";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = useRealtimeUser();
  const isAuth = !!localStorage.getItem("token");
  const location = useLocation();

  // Fermer dropdown si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    if (confirm("Se déconnecter ?")) {
      await logout();
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-black border-b-2 border-primary shadow-2xl backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group transition-transform hover:scale-105"
          >
            <div className="text-3xl">⚡</div>
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">
              FlashProno
            </span>
          </Link>

          {/* Centre : Menu desktop */}
          <div className="hidden md:flex items-center gap-4">
            <NavLink to="/pronostics" active={isActive("/pronostics")}>
              ⚽ Pronostics
            </NavLink>
            <NavLink to="/abonnements" active={isActive("/abonnements")}>
              👑 Abonnements
            </NavLink>

            {/* 📊 Dropdown Mon Espace */}
            {isAuth && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    ["/bankroll", "/strategies", "/mes-stats"].includes(location.pathname)
                      ? "text-primary border-2 border-primary"
                      : "text-green-400 hover:text-white"
                  }`}
                >
                  📊 Mon Espace
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full mt-2 w-56 bg-black border-2 border-primary/50 rounded-xl shadow-2xl overflow-hidden">
                    <DropdownLink
                      to="/bankroll"
                      icon="💰"
                      label="Bankroll"
                      onClick={() => setDropdownOpen(false)}
                      active={isActive("/bankroll")}
                    />
                    <DropdownLink
                      to="/strategies"
                      icon="🎯"
                      label="Stratégies"
                      onClick={() => setDropdownOpen(false)}
                      active={isActive("/strategies")}
                    />
                    <DropdownLink
                      to="/mes-stats"
                      icon="📊"
                      label="Mes Stats"
                      onClick={() => setDropdownOpen(false)}
                      active={isActive("/mes-stats")}
                    />
                  </div>
                )}
              </div>
            )}

            <NavLink to="/chat" active={isActive("/chat")}>
              💬 Chat
            </NavLink>

            {user?.isAdmin && (
              <NavLink to="/admin" active={isActive("/admin")}>
                🔧 Admin
              </NavLink>
            )}
          </div>

          {/* Droite : Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuth ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    isActive("/dashboard")
                      ? "bg-primary text-black"
                      : "bg-black border-2 border-primary text-primary hover:bg-primary hover:text-black"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-yellow-400 flex items-center justify-center text-black font-bold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  Espace membre
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all font-medium"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-black border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all font-medium"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-primary text-black hover:scale-105 transition-all font-bold"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg bg-primary/20 border border-primary hover:bg-primary/30 transition"
          >
            <svg
              className="w-6 h-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t-2 border-primary/30 animate-fadeIn">
          <div className="flex flex-col text-white">
            <Link
              to="/pronostics"
              className={`px-4 py-3 border-b border-white/10 hover:bg-[#111] ${
                isActive("/pronostics") ? "bg-primary/20 text-primary font-bold" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              ⚽ Pronostics
            </Link>
            <Link
              to="/abonnements"
              className={`px-4 py-3 border-b border-white/10 hover:bg-[#111] ${
                isActive("/abonnements") ? "bg-primary/20 text-primary font-bold" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              👑 Abonnements
            </Link>

            {isAuth && (
              <>
                <Link
                  to="/bankroll"
                  className={`px-4 py-3 border-b border-white/10 hover:bg-[#111] ${
                    isActive("/bankroll") ? "bg-primary/20 text-primary font-bold" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  💰 Bankroll
                </Link>
                <Link
                  to="/strategies"
                  className={`px-4 py-3 border-b border-white/10 hover:bg-[#111] ${
                    isActive("/strategies") ? "bg-primary/20 text-primary font-bold" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  🎯 Stratégies
                </Link>
                <Link
                  to="/mes-stats"
                  className={`px-4 py-3 border-b border-white/10 hover:bg-[#111] ${
                    isActive("/mes-stats") ? "bg-primary/20 text-primary font-bold" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  📊 Mes Stats
                </Link>
              </>
            )}

            <Link
              to="/chat"
              className={`px-4 py-3 border-b border-white/10 hover:bg-[#111] ${
                isActive("/chat") ? "bg-primary/20 text-primary font-bold" : ""
              }`}
              onClick={() => setMenuOpen(false)}
            >
              💬 Chat
            </Link>

            {user?.isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-3 border-b border-white/10 hover:bg-[#111] ${
                  isActive("/admin") ? "bg-primary/20 text-primary font-bold" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                🔧 Admin
              </Link>
            )}
            
            {isAuth ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-4 py-3 border-b border-white/10 hover:bg-[#111] ${
                    isActive("/dashboard") ? "bg-primary/20 text-primary font-bold" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  🏠 Espace membre
                </Link>
                <a
                  href="https://wa.me/33695962084"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 border-b border-white/10 hover:bg-[#111]"
                  onClick={() => setMenuOpen(false)}
                >
                  📞 WhatsApp
                </a>
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="px-4 py-3 text-left hover:bg-[#111] text-red-400"
                >
                  🚪 Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-3 border-b border-white/10 hover:bg-[#111]"
                  onClick={() => setMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-3 hover:bg-[#111] text-primary font-bold"
                  onClick={() => setMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, children, active }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg transition-all font-medium ${
        active
          ? "text-primary border-2 border-primary"
          : "text-green-400 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function DropdownLink({ to, icon, label, onClick, active }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 border-b border-primary/20 transition-all ${
        active
          ? "bg-primary text-black font-bold"
          : "text-white hover:bg-primary/20 hover:text-primary"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
