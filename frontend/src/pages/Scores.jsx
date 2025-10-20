import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function Scores() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("live"); // live | today

  useEffect(() => {
    loadScores();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadScores, 30000);
    return () => clearInterval(interval);
  }, [tab]);

  const loadScores = async () => {
    try {
      setLoading(true);
      const endpoint = tab === "live" ? "/api/scores/live" : "/api/scores/today";
      const { data } = await axios.get(`${API_BASE}${endpoint}`);
      
      if (tab === "live") {
        setLiveMatches(data.matches || []);
      } else {
        setTodayMatches(data.matches || []);
      }
    } catch (err) {
      console.error("❌ Erreur chargement scores:", err);
    } finally {
      setLoading(false);
    }
  };

  const matches = tab === "live" ? liveMatches : todayMatches;

  return (
    <section className="pt-16 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary rounded-full mb-4">
            <span className="text-primary font-semibold text-sm">⚽ Scores en Direct</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
              Résultats Live
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Suivez les matchs en temps réel
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => setTab("live")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              tab === "live"
                ? "bg-gradient-to-r from-primary to-yellow-400 text-black"
                : "bg-black border-2 border-primary/30 text-white hover:bg-gray-900"
            }`}
          >
            🔴 En Direct ({liveMatches.length})
          </button>
          <button
            onClick={() => setTab("today")}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              tab === "today"
                ? "bg-gradient-to-r from-primary to-yellow-400 text-black"
                : "bg-black border-2 border-primary/30 text-white hover:bg-gray-900"
            }`}
          >
            📅 Aujourd'hui ({todayMatches.length})
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 animate-bounce">⚽</div>
            <p className="text-gray-400">Chargement des scores...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {tab === "live" ? "Aucun match en direct" : "Aucun match aujourd'hui"}
            </h3>
            <p className="text-gray-400">
              {tab === "live" 
                ? "Reviens plus tard pour suivre les matchs en direct !" 
                : "Aucun match prévu pour aujourd'hui"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🔄 Actualisation automatique toutes les 30 secondes
          </p>
        </div>
      </div>
    </section>
  );
}

function MatchCard({ match }) {
  const isLive = ["1H", "HT", "2H", "ET", "BT", "P"].includes(match.status);
  const isFinished = match.status === "FT";
  const isPending = ["TBD", "NS", "SUSP", "INT"].includes(match.status);

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
      {/* League */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
            {match.league}
          </span>
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          )}
        </div>
        <span className="text-sm text-gray-400 font-medium">{getStatusLabel()}</span>
      </div>

      {/* Teams */}
      <div className="space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <img src={match.homeLogo} alt={match.homeTeam} className="w-8 h-8 object-contain" />
            <span className="text-white font-semibold">{match.homeTeam}</span>
          </div>
          <span className={`text-2xl font-bold ${isLive ? "text-primary" : "text-white"}`}>
            {match.homeScore ?? "-"}
          </span>
        </div>

        {/* Away Team */}
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
