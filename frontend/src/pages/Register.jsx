import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

export default function Register() {
  const [params] = useSearchParams();
  const plan = params.get("plan") || "";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.dispatchEvent(new Event("auth-update"));

      if (plan && plan !== "trial") {
        navigate("/abonnements");
      } else {
        navigate("/dashboard");
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Inscription impossible (email déjà utilisé ?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-green-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }}></div>
        
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-twinkle-1"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-green-300 rounded-full animate-twinkle-2"></div>
        <div className="absolute bottom-1/4 right-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-twinkle-3"></div>
        <div className="absolute top-2/3 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-twinkle-1" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-400 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-400 rounded-full flex items-center justify-center text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-2xl">
              🚀
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500 bg-clip-text text-transparent animate-gradient">
              Rejoins-nous !
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Crée ton compte en quelques secondes</p>
        </div>

        {/* Formulaire */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          
          <form onSubmit={submit} className="relative bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90 backdrop-blur-xl p-8 rounded-3xl border-2 border-emerald-500/30 shadow-2xl">
            <div className="mb-6 group/input">
              <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-semibold group-hover/input:text-emerald-400 transition-colors">
                <span className="text-xl">👤</span>
                Nom
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-black/50 border-2 border-gray-700 text-white font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all hover:border-gray-600 placeholder-gray-500"
                  placeholder="Ton nom"
                  required
                />
              </div>
            </div>

            <div className="mb-6 group/input">
              <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-semibold group-hover/input:text-emerald-400 transition-colors">
                <span className="text-xl">📧</span>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 rounded-xl bg-black/50 border-2 border-gray-700 text-white font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all hover:border-gray-600 placeholder-gray-500"
                placeholder="ton@email.com"
                required
              />
            </div>

            <div className="mb-6 group/input">
              <label className="flex items-center gap-2 text-sm text-gray-300 mb-2 font-semibold group-hover/input:text-emerald-400 transition-colors">
                <span className="text-xl">🔒</span>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 pr-12 rounded-xl bg-black/50 border-2 border-gray-700 text-white font-medium focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all hover:border-gray-600 placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Minimum 6 caractères recommandés</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl animate-shake">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full group/btn overflow-hidden mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl blur opacity-50 group-hover/btn:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-emerald-500 to-green-400 text-white px-6 py-4 rounded-xl font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <span>Créer mon compte</span>
                    <span className="text-xl group-hover/btn:translate-x-1 transition-transform">🚀</span>
                  </>
                )}
              </div>
            </button>

            <div className="mb-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 font-semibold mb-2 text-sm">✨ Inclus :</p>
              <ul className="space-y-1 text-xs text-gray-400">
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Pronos quotidiens</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Suivi en temps réel</li>
                <li className="flex items-center gap-2"><span className="text-emerald-400">✓</span>Analyses détaillées</li>
              </ul>
            </div>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-700"></div>
              <span className="text-gray-500 text-sm">OU</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-700"></div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 mb-3">Déjà un compte ?</p>
              <Link
                to={`/login${plan ? `?plan=${plan}` : ""}`}
                className="inline-block text-emerald-400 hover:text-green-300 font-bold transition-colors group/link"
              >
                <span className="relative">
                  Se connecter
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 to-green-300 transform scale-x-0 group-hover/link:scale-x-100 transition-transform origin-left"></span>
                </span>
              </Link>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-8">
          <FeatureBadge icon="⚡" text="Gratuit" />
          <FeatureBadge icon="🔒" text="Sécurisé" />
          <FeatureBadge icon="🎯" text="Facile" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes twinkle-1 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes twinkle-2 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(2); }
        }
        @keyframes twinkle-3 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.8); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-gradient { background-size: 200% auto; animation: gradient 3s linear infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-twinkle-1 { animation: twinkle-1 2s ease-in-out infinite; }
        .animate-twinkle-2 { animation: twinkle-2 2.5s ease-in-out infinite 0.5s; }
        .animate-twinkle-3 { animation: twinkle-3 2.2s ease-in-out infinite 1s; }
      `}</style>
    </section>
  );
}

function FeatureBadge({ icon, text }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 bg-gradient-to-br from-gray-900/50 to-black/50 border border-gray-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group">
      <span className="text-2xl group-hover:scale-125 transition-transform">{icon}</span>
      <span className="text-xs text-gray-400 group-hover:text-emerald-400 transition-colors font-semibold">{text}</span>
    </div>
  );
}
