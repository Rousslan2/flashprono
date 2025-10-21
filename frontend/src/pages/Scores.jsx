import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { isSubscriptionActive } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Scores() {
  const active = isSubscriptionActive();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }
    loadScores();
  }, [active]);
  
  useEffect(() => {
    if (!active) return;
    
    const interval = setInterval(() => {
      const hasLiveMatches = matches.some(m => 
        ["1H", "HT", "2H", "ET", "BT", "P"].includes(m.status)
      );
      
      if (hasLiveMatches) {
        console.log('🔴 Matchs LIVE détectés - actualisation');
        loadScores();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [matches, active]);

  const loadScores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await axios.get(`${API_BASE}/api/scores/my-matches`);
      
      if (!data.success) {
        setError(data.message || "Erreur inconnue");
        setMatches([]);
      } else {
        setMatches(data.matches || []);
        setLastUpdate(new Date());
        
        if (data.message) {
          setError(data.message);
        }
      }
      
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err.response?.data?.message || err.message || "Erreur de connexion au serveur");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔒 BLOQUER ACCÈS SI NON ABONNÉ
  if (!active) {
    return (
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-green-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-lime-400/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-8 animate-float">
            <div className="inline-block w-24 h-24 bg-gradient-to-br from-green-500/30 to-lime-400/30 rounded-3xl flex items-center justify-center mb-6 text-5xl border-2 border-green-500/40 shadow-2xl backdrop-blur-sm transform hover:scale-110 transition-all duration-500">
              🔒
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-green-400 via-lime-300 to-green-500 bg-clip-text text-transparent animate-gradient">
                Scores en Direct
              </span>
              <br />
              <span className="text-white drop-shadow-glow">Réservés aux membres</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Suis en <span className="text-green-400 font-semibold">temps réel</span> tous les matchs de tes pronos avec actualisation automatique !
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FeaturePreview icon="🔴" title="Live en direct" desc="Actualisation auto toutes les 1 min" delay="0" />
            <FeaturePreview icon="⚽" title="Tes pronos" desc="Uniquement les matchs que tu suis" delay="100" />
            <FeaturePreview icon="📊" title="Statistiques" desc="Scores et statuts en temps réel" delay="200" />
          </div>

          <Link
            to="/abonnements"
            className="inline-block bg-gradient-to-r from-green-500 via-lime-400 to-green-500 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-2xl hover:shadow-green-500/60 animate-gradient-slow"
          >
            🚀 Voir les abonnements
          </Link>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-gradient {
            background-size: 200% auto;
            animation: gradient 3s linear infinite;
          }
          .animate-gradient-slow {
            background-size: 200% auto;
            animation: gradient 5s linear infinite;
          }
          .drop-shadow-glow {
            filter: drop-shadow(0 0 20px rgba(74, 222, 128, 0.3));
          }
        `}</style>
      </section>
    );
  }

  const liveMatches = matches.filter(m => 
    ["1H", "HT", "2H", "ET", "BT", "P"].includes(m.status)
  );
  
  const upcomingMatches = matches.filter(m => 
    ["TBD", "NS"].includes(m.status)
  );
  
  const finishedMatches = matches.filter(m => 
    ["FT", "AET", "PEN"].includes(m.status)
  );

  return (
    <section className="pt-16 pb-12 px-4 relative overflow-hidden">
      {/* Particules animées */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-lime-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }}></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "6s" }}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-500/20 to-lime-400/20 border-2 border-green-500 rounded-full mb-6 hover:scale-110 transition-all duration-300 cursor-pointer group">
            <span className="text-green-400 font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              ⚽ Scores de Mes Pronos
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 perspective-text">
            <span className="bg-gradient-to-r from-green-400 via-lime-300 to-green-500 bg-clip-text text-transparent drop-shadow-glow-green animate-gradient">
              Suivi en Direct
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-6">
            Uniquement les matchs de tes pronostics du jour
          </p>
          
          {lastUpdate && (
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="px-4 py-2 bg-black/50 border border-green-500/30 rounded-lg text-gray-300">
                🕐 Dernière mise à jour : {lastUpdate.toLocaleTimeString("fr-FR")}
              </div>
              <button
                onClick={loadScores}
                className="px-4 py-2 bg-green-500/20 border-2 border-green-500/40 text-green-400 rounded-lg hover:bg-green-500/30 hover:scale-105 transition-all text-xs font-bold hover:shadow-lg hover:shadow-green-500/30"
              >
                🔄 Actualiser
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards avec effet 3D */}
        {!loading && !error && matches.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto animate-slide-up">
            <StatCard 
              icon="🔴" 
              label="En Direct" 
              value={liveMatches.length}
              color="red"
              gradient="from-red-500/20 to-orange-500/20"
            />
            <StatCard 
              icon="⏰" 
              label="À venir" 
              value={upcomingMatches.length}
              color="blue"
              gradient="from-blue-500/20 to-cyan-500/20"
            />
            <StatCard 
              icon="✅" 
              label="Terminés" 
              value={finishedMatches.length}
              color="green"
              gradient="from-green-500/20 to-emerald-500/20"
            />
          </div>
        )}

        {/* Loading */}
        {loading && matches.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-7xl mb-6 animate-bounce">⚽</div>
            <p className="text-gray-400 text-lg">Chargement des scores...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 animate-shake">
            <div className="text-7xl mb-6">⚠️</div>
            <h3 className="text-3xl font-bold text-yellow-400 mb-4">
              Information
            </h3>
            <p className="text-gray-300 mb-6 max-w-lg mx-auto text-lg bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">{error}</p>
            <button
              onClick={loadScores}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-lime-400 text-white rounded-xl font-bold hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-green-500/50"
            >
              🔄 Réessayer
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-7xl mb-6 animate-bounce">📭</div>
            <h3 className="text-3xl font-bold text-white mb-4">
              Aucun match aujourd'hui
            </h3>
            <p className="text-gray-400 text-lg mb-6">
              Ajoute des pronos football pour aujourd'hui pour voir les scores en direct !
            </p>
            <Link
              to="/pronostics"
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-lime-400 text-white rounded-xl font-bold hover:scale-110 transition-all duration-300 shadow-xl"
            >
              Voir les pronostics
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {liveMatches.length > 0 && (
              <Section title="🔴 En Direct" matches={liveMatches} type="live" />
            )}
            
            {upcomingMatches.length > 0 && (
              <Section title="⏰ À venir" matches={upcomingMatches} type="upcoming" />
            )}
            
            {finishedMatches.length > 0 && (
              <Section title="✅ Terminés" matches={finishedMatches} type="finished" />
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-10 bg-gradient-to-r from-green-500/10 to-lime-400/10 border-2 border-green-500/30 rounded-xl p-6 group hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 animate-slide-up">
          <div className="flex items-center justify-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-green-300 text-center font-semibold">
              <strong>LIVE EN DIRECT</strong> : Actualisation automatique toutes les 1 minute si matchs LIVE
            </p>
          </div>
        </div>
      </div>

      {/* Styles CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-25px) rotate(3deg); }
          66% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.3); }
          50% { box-shadow: 0 0 40px rgba(74, 222, 128, 0.6); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
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
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.7s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.7s ease-out;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-twinkle-1 {
          animation: twinkle-1 1s ease-in-out infinite;
        }
        .animate-twinkle-2 {
          animation: twinkle-2 1.2s ease-in-out infinite 0.3s;
        }
        .animate-twinkle-3 {
          animation: twinkle-3 1.4s ease-in-out infinite 0.6s;
        }
        .drop-shadow-glow-green {
          filter: drop-shadow(0 0 30px rgba(74, 222, 128, 0.6));
        }
        .perspective-text {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}</style>
    </section>
  );
}

function FeaturePreview({ icon, title, desc, delay }) {
  return (
    <div 
      className="bg-gradient-to-br from-green-500/10 to-lime-400/5 border-2 border-green-500/30 rounded-2xl p-6 text-center transform hover:scale-110 hover:-rotate-2 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/30 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-5xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-white font-bold mb-2 text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function Section({ title, matches, type }) {
  return (
    <div className="animate-slide-up">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-4xl">{title.split(" ")[0]}</span>
        <span className="bg-gradient-to-r from-green-400 to-lime-400 bg-clip-text text-transparent">
          {title.split(" ").slice(1).join(" ")}
        </span>
        <span className="text-gray-500 text-xl">({matches.length})</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {matches.map((match, index) => (
          <MatchCard key={match.id} match={match} type={type} delay={index * 100} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, gradient }) {
  const colorClasses = {
    red: "border-red-500/40 hover:shadow-red-500/50",
    blue: "border-blue-500/40 hover:shadow-blue-500/50",
    green: "border-green-500/40 hover:shadow-green-500/50",
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} border-2 ${colorClasses[color]} rounded-2xl p-6 text-center hover:scale-110 transition-all duration-500 shadow-xl hover:shadow-2xl group cursor-pointer`}>
      {/* Étoiles scintillantes */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-3 right-5 w-1 h-1 bg-white rounded-full animate-twinkle-1"></div>
        <div className="absolute bottom-4 left-6 w-1 h-1 bg-green-300 rounded-full animate-twinkle-2"></div>
        <div className="absolute top-1/2 right-8 w-1 h-1 bg-lime-300 rounded-full animate-twinkle-3"></div>
      </div>
      <div className="relative z-10">
        <div className="text-4xl mb-3 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{icon}</div>
        <div className="text-3xl font-extrabold text-white mb-2">{value}</div>
        <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function MatchCard({ match, type, delay }) {
  const isLive = ["1H", "HT", "2H", "ET", "BT", "P"].includes(match.status);
  const isFinished = ["FT", "AET", "PEN"].includes(match.status);

  const getStatusLabel = () => {
    if (match.status === "1H") return `${match.elapsed}'`;
    if (match.status === "HT") return "Mi-temps";
    if (match.status === "2H") return `${match.elapsed}'`;
    if (match.status === "FT") return "Terminé";
    if (match.status === "NS") return new Date(match.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return match.status;
  };

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-black/80 via-gray-900/80 to-black p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-[1.03] group backdrop-blur-xl shadow-xl animate-slide-up ${
        isLive
          ? "border-red-500/60 hover:shadow-2xl hover:shadow-red-500/40 animate-pulse-glow"
          : isFinished
          ? "border-gray-600 hover:shadow-xl"
          : "border-green-500/30 hover:shadow-xl hover:shadow-green-500/20"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Effet brillance */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-4 left-8 w-1 h-1 bg-green-300 rounded-full animate-twinkle-1"></div>
        <div className="absolute bottom-8 right-10 w-1 h-1 bg-lime-300 rounded-full animate-twinkle-2"></div>
        <div className="absolute top-1/3 right-12 w-1 h-1 bg-emerald-300 rounded-full animate-twinkle-3"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs px-3 py-1.5 bg-green-500/20 text-green-400 rounded-full border border-green-500/40 font-semibold">
            {match.league}
          </span>
          {isLive && (
            <span className="flex items-center gap-2 text-sm text-red-400 font-bold px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-full">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
              LIVE {getStatusLabel()}
            </span>
          )}
          {!isLive && (
            <span className="text-sm text-gray-400 font-medium px-3 py-1 bg-gray-800/50 rounded-full">{getStatusLabel()}</span>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-4">
          <div className="flex items-center justify-between group/team hover:bg-white/5 p-2 rounded-lg transition-all">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden group-hover/team:scale-110 transition-transform">
                <img src={match.homeLogo} alt={match.homeTeam} className="w-8 h-8 object-contain" />
              </div>
              <span className="text-white font-bold text-lg">{match.homeTeam}</span>
            </div>
            <span className={`text-3xl font-extrabold ${isLive ? "text-green-400 drop-shadow-glow-green" : "text-white"} min-w-[3rem] text-right`}>
              {match.homeScore ?? "-"}
            </span>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent"></div>

          <div className="flex items-center justify-between group/team hover:bg-white/5 p-2 rounded-lg transition-all">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden group-hover/team:scale-110 transition-transform">
                <img src={match.awayLogo} alt={match.awayTeam} className="w-8 h-8 object-contain" />
              </div>
              <span className="text-white font-bold text-lg">{match.awayTeam}</span>
            </div>
            <span className={`text-3xl font-extrabold ${isLive ? "text-green-400 drop-shadow-glow-green" : "text-white"} min-w-[3rem] text-right`}>
              {match.awayScore ?? "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
