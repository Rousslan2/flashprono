import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function Scores() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [tomorrowMatches, setTomorrowMatches] = useState([]);
  const [myPronosMatches, setMyPronosMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("my-pronos"); // my-pronos | live | today | tomorrow
  const [selectedDate, setSelectedDate] = useState("");
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    loadScores();
    
    // Actualiser toutes les 30 secondes pour les matchs en direct
    if (tab === "live") {
      const interval = setInterval(loadScores, 30000);
      return () => clearInterval(interval);
    }
  }, [tab, selectedDate]);

  const loadScores = async () => {
    try {
      setLoading(true);
      let endpoint = "";
      
      if (selectedDate) {
        endpoint = `/api/scores/by-date/${selectedDate}`;
      } else {
        switch (tab) {
          case "my-pronos":
            endpoint = "/api/scores/my-pronos";
            break;
          case "live":
            endpoint = "/api/scores/live";
            break;
          case "today":
            endpoint = "/api/scores/today";
            break;
          case "tomorrow":
            endpoint = "/api/scores/tomorrow";
            break;
          default:
            endpoint = "/api/scores/my-pronos";
        }
      }
      
      const { data } = await axios.get(`${API_BASE}${endpoint}`);
      
      if (selectedDate) {
        setTodayMatches(data.matches || []);
      } else {
        if (tab === "my-pronos") {
          setMyPronosMatches(data.matches || []);
        } else if (tab === "live") {
          setLiveMatches(data.matches || []);
        } else if (tab === "today") {
          setTodayMatches(data.matches || []);
        } else if (tab === "tomorrow") {
          setTomorrowMatches(data.matches || []);
        }
      }
    } catch (err) {
      console.error("❌ Erreur chargement scores:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setTab("today"); // Basculer sur l'onglet "today" lors de la sélection d'une date
  };

  const clearDate = () => {
    setSelectedDate("");
  };

  const testApiConnection = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/scores/test`);
      setApiStatus(data);
      alert(
        data.success
          ? `✅ API connectée!\n\nRequests restantes: ${data.subscription?.requests?.current || "N/A"}/${data.subscription?.requests?.limit_day || "N/A"}`
          : `❌ ${data.message}`
      );
    } catch (err) {
      setApiStatus({ success: false, message: err.message });
      alert(`❌ Erreur: ${err.response?.data?.message || err.message}`);
    }
  };

  const matches = selectedDate 
    ? todayMatches 
    : tab === "my-pronos"
      ? myPronosMatches
      : tab === "live" 
        ? liveMatches 
        : tab === "today" 
          ? todayMatches 
          : tomorrowMatches;

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

        {/* Sélecteur de date */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3 bg-black border-2 border-primary/30 rounded-xl p-3">
            <label htmlFor="date-picker" className="text-sm font-semibold text-gray-300">
              📅 Date personnalisée :
            </label>
            <input
              id="date-picker"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="px-3 py-2 bg-gray-900 border border-primary/40 rounded-lg text-white focus:outline-none focus:border-primary"
            />
            {selectedDate && (
              <button
                onClick={clearDate}
                className="px-3 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all font-medium text-sm"
              >
                ✕ Effacer
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {!selectedDate && (
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <button
              onClick={() => setTab("my-pronos")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                tab === "my-pronos"
                  ? "bg-gradient-to-r from-primary to-yellow-400 text-black"
                  : "bg-black border-2 border-primary/30 text-white hover:bg-gray-900"
              }`}
            >
              🎯 Mes Pronos ({myPronosMatches.length})
            </button>
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
            <button
              onClick={() => setTab("tomorrow")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                tab === "tomorrow"
                  ? "bg-gradient-to-r from-primary to-yellow-400 text-black"
                  : "bg-black border-2 border-primary/30 text-white hover:bg-gray-900"
              }`}
            >
              🗓️ Demain ({tomorrowMatches.length})
            </button>
          </div>
        )}

        {selectedDate && (
          <div className="text-center mb-6">
            <p className="text-lg text-primary font-semibold">
              📅 Matchs du {new Date(selectedDate).toLocaleDateString("fr-FR", { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        )}

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
              {tab === "my-pronos" ? "Aucun match avec pronostic" : tab === "live" ? "Aucun match en direct" : "Aucun match prévu"}
            </h3>
            <p className="text-gray-400">
              {tab === "my-pronos"
                ? "Aucun pronostic en attente pour le moment"
                : tab === "live" 
                  ? "Reviens plus tard pour suivre les matchs en direct !" 
                  : "Aucun match trouvé pour cette période"}
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
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-500">
            {tab === "live" ? "🔄 Actualisation automatique toutes les 30 secondes" : "💡 Sélectionnez une date personnalisée pour voir les matchs"}
          </p>
          
          {/* Bouton test API */}
          <button
            onClick={testApiConnection}
            className="px-4 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm font-medium"
          >
            🧪 Tester la connexion API
          </button>
          
          {apiStatus && (
            <div className={`inline-block px-4 py-2 rounded-lg text-sm ${
              apiStatus.success 
                ? "bg-green-500/20 border border-green-500 text-green-400" 
                : "bg-red-500/20 border border-red-500 text-red-400"
            }`}>
              {apiStatus.message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function MatchCard({ match }) {
  const isLive = ["1H", "HT", "2H", "ET", "BT", "P"].includes(match.status);
  const isFinished = match.status === "FT";
  const isPending = ["TBD", "NS", "SUSP", "INT"].includes(match.status);
  const hasProno = !!match.pronostic;

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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
            {match.league}
          </span>
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              LIVE
            </span>
          )}
          {hasProno && (
            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 font-semibold">
              🎯 Prono actif
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

      {/* Infos du pronostic */}
      {hasProno && (
        <div className="mt-4 pt-4 border-t-2 border-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-primary">🎯 {match.pronostic.type}</span>
              <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                Cote {match.pronostic.cote}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Confiance:</span>
              <span className={`text-xs font-bold ${
                match.pronostic.confiance >= 75 ? "text-green-400" :
                match.pronostic.confiance >= 50 ? "text-yellow-400" : "text-orange-400"
              }`}>
                {match.pronostic.confiance}%
              </span>
            </div>
          </div>
          {match.pronostic.details && (
            <p className="text-xs text-gray-400 mt-2 italic">
              {match.pronostic.details}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
