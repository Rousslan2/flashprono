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
        {/* Particules animées */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-primary rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-8 animate-bounce-slow">
            <div className="inline-block w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mb-6 text-5xl border-4 border-white/20 shadow-2xl">
              🔒
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient-x">
                Scores en Direct
              </span>
              <br />
              <span className="text-white drop-shadow-lg">Réservés aux membres VIP</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed mb-8">
              Suis en <span className="text-blue-400 font-bold">temps réel</span> tous les matchs de tes pronos avec actualisation automatique !
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FeaturePreview icon="🔴" title="Live en direct" desc="Actualisation auto toutes les 1 min" />
            <FeaturePreview icon="⚽" title="Tes pronos" desc="Uniquement les matchs que tu suis" />
            <FeaturePreview icon="📊" title="Statistiques" desc="Scores et statuts en temps réel" />
          </div>

          <Link
            to="/abonnements"
            className="group relative inline-block"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-110 transition-all duration-300 shadow-2xl">
              ✨ Devenir membre VIP
            </div>
          </Link>
        </div>
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
    <section className="pt-16 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary rounded-full mb-4">
            <span className="text-primary font-semibold text-sm">⚽ Scores de Mes Pronos</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
              Suivi en Direct
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Uniquement les matchs de tes pronostics du jour
          </p>
          
          {lastUpdate && (
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-gray-400">
                🕐 Dernière mise à jour : {lastUpdate.toLocaleTimeString("fr-FR")}
              </div>
              <button
                onClick={loadScores}
                className="px-3 py-1.5 bg-primary/20 border border-primary/40 text-primary rounded-lg hover:bg-primary/30 transition-all text-xs font-semibold"
              >
                🔄 Actualiser
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        {!loading && !error && matches.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
            <StatCard icon="🔴" label="En Direct" value={liveMatches.length} />
            <StatCard icon="⏰" label="À venir" value={upcomingMatches.length} />
            <StatCard icon="✅" label="Terminés" value={finishedMatches.length} />
          </div>
        )}

        {/* Loading */}
        {loading && matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-bounce">⚽</div>
            <p className="text-gray-400">Chargement des scores...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-3">
              Information
            </h3>
            <p className="text-gray-300 mb-4 max-w-lg mx-auto">{error}</p>
            <button
              onClick={loadScores}
              className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:scale-105 transition"
            >
              🔄 Réessayer
            </button>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Aucun match aujourd'hui
            </h3>
            <p className="text-gray-400">
              Ajoute des pronos football pour aujourd'hui pour voir les scores en direct !
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {liveMatches.length > 0 && (
              <Section title="🔴 En Direct" matches={liveMatches} />
            )}
            
            {upcomingMatches.length > 0 && (
              <Section title="⏰ À venir" matches={upcomingMatches} />
            )}
            
            {finishedMatches.length > 0 && (
              <Section title="✅ Terminés" matches={finishedMatches} />
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-sm text-blue-300 text-center">
            🔴 <strong>LIVE EN DIRECT</strong> : Actualisation automatique toutes les 1 minute si matchs LIVE
          </p>
        </div>
      </div>
    </section>
  );
}

function FeaturePreview({ icon, title, desc }) {
  return (
    <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-2 border-blue-500/30 rounded-2xl p-6 text-center hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-500 cursor-pointer">
      <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">{icon}</div>
      <h3 className="text-white font-bold mb-2 text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function Section({ title, matches }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        {title}
        <span className="text-gray-500 text-lg">({matches.length})</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-primary mb-1">{value}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}

function MatchCard({ match }) {
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
      className={`bg-gradient-to-br from-black via-gray-900 to-black p-6 rounded-2xl border-2 transition-all hover:scale-[1.02] ${
        isLive
          ? "border-red-500 shadow-lg shadow-red-500/20"
          : isFinished
          ? "border-gray-600"
          : "border-primary/30"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
          {match.league}
        </span>
        {isLive && (
          <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            LIVE {getStatusLabel()}
          </span>
        )}
        {!isLive && (
          <span className="text-sm text-gray-400 font-medium">{getStatusLabel()}</span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img src={match.homeLogo} alt={match.homeTeam} className="w-8 h-8 object-contain" />
            <span className="text-white font-semibold">{match.homeTeam}</span>
          </div>
          <span className={`text-2xl font-bold ${isLive ? "text-primary" : "text-white"}`}>
            {match.homeScore ?? "-"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img src={match.awayLogo} alt={match.awayTeam} className="w-8 h-8 object-contain" />
            <span className="text-white font-semibold">{match.awayTeam}</span>
          </div>
          <span className={`text-2xl font-bold ${isLive ? "text-primary" : "text-white"}`}>
            {match.awayScore ?? "-"}
          </span>
        </div>
      </div>
    </div>
  );
}
