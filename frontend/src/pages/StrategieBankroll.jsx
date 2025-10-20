import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { isSubscriptionActive } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function StrategieBankroll() {
  const [loading, setLoading] = useState(true);
  const [pronos, setPronos] = useState([]);
  const [error, setError] = useState("");
  const active = isSubscriptionActive();

  useEffect(() => {
    const run = async () => {
      try {
        if (!active) {
          setLoading(false);
          return;
        }
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/pronostics?categorie=strategie_bankroll`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPronos(data);
      } catch (e) {
        setError(e?.response?.data?.message || "Erreur chargement");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [active]);

  if (!active) {
    return (
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-8 animate-bounce-slow">
            <div className="inline-block w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 text-5xl border-4 border-white/20 shadow-2xl">
              🔒
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
                Stratégie Bankroll
              </span>
              <br />
              <span className="text-white drop-shadow-lg">Gestion avancée réservée aux VIP</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-8">
              Des <span className="text-purple-400 font-bold">stratégies expertes</span> pour gérer ton capital comme un pro et maximiser tes gains !
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FeaturePreview icon="🎯" title="Gestion optimale" desc="Techniques avancées de mise" />
            <FeaturePreview icon="📊" title="Plans personnalisés" desc="Adapté à ton profil" />
            <FeaturePreview icon="💰" title="Protection capital" desc="Sécurise ta bankroll" />
          </div>

          <Link
            to="/abonnements"
            className="group relative inline-block"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-110 transition-all duration-300 shadow-2xl">
              ✨ Devenir membre VIP
            </div>
          </Link>
        </div>
      </section>
    );
  }

  if (loading) return <div className='text-center py-20'><div className="text-6xl mb-4 animate-bounce">📊</div><p className='text-gray-400'>Chargement des stratégies...</p></div>;
  if (error) return <p className='text-center text-red-400 py-10'>{error}</p>;

  return (
    <section className='py-16 px-4 max-w-6xl mx-auto relative overflow-hidden'>
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="text-center mb-10 relative z-10">
        <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500 rounded-full mb-6 animate-pulse-slow">
          <span className="text-purple-400 font-bold text-sm">📊 STRATÉGIE AVANCÉE</span>
        </div>
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-black mb-6'>
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
            Gestion Bankroll Pro
          </span>
        </h1>
        <p className="text-xl text-gray-300">
          Plans de mise experts pour protéger et faire croître ton capital
        </p>
      </div>

      {pronos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-8xl mb-6 animate-bounce">📊</div>
          <h3 className="text-2xl font-bold text-white mb-3">Aucune stratégie disponible</h3>
          <p className="text-gray-400">Les plans arrivent bientôt !</p>
        </div>
      ) : (
        <div className='grid md:grid-cols-2 gap-6 relative z-10'>
          {pronos.map((p, index) => (
            <div 
              key={p._id} 
              className='relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-3xl border-2 border-purple-500/50 hover:scale-105 transition-all duration-500 overflow-hidden group animate-slide-in-up shadow-2xl shadow-purple-500/20'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-full text-sm font-black border-2 border-purple-500/50">
                    📊 PRO
                  </span>
                  <span className="text-sm text-gray-400">{p.competition || "—"}</span>
                </div>

                <h3 className='text-2xl font-black text-white mb-4'>
                  {p.equipe1} <span className="text-purple-400">VS</span> {p.equipe2}
                </h3>
                
                <div className="flex gap-3 mb-4">
                  <div className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-xl">
                    <span className="text-xs text-gray-400 block">Type</span>
                    <span className="text-white font-bold">{p.type}</span>
                  </div>
                  <div className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-xl">
                    <span className="text-xs text-gray-400 block">Cote</span>
                    <span className="text-purple-400 font-black text-lg">{p.cote}</span>
                  </div>
                  <div className="px-4 py-2 bg-black/50 border border-purple-500/30 rounded-xl">
                    <span className="text-xs text-gray-400 block">Confiance</span>
                    <span className="text-emerald-400 font-bold">{p.confiance}%</span>
                  </div>
                </div>

                {p.analyse && (
                  <p className='text-gray-300 text-sm leading-relaxed bg-black/30 p-4 rounded-xl border border-purple-500/20'>
                    {p.analyse}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FeaturePreview({ icon, title, desc }) {
  return (
    <div className="group bg-gradient-to-br from-purple-500/10 to-pink-500/5 border-2 border-purple-500/30 rounded-2xl p-6 text-center hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 cursor-pointer">
      <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">{icon}</div>
      <h3 className="text-white font-bold mb-2 text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
