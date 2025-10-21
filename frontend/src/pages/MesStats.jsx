import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { Link } from "react-router-dom";
import socket from "../services/socket";
import { isSubscriptionActive } from "../hooks/useAuth";

export default function MesStats() {
  const active = isSubscriptionActive();
  const [stats, setStats] = useState({
    pronosSuivis: 0,
    tauxReussite: 0,
    roi: 0,
    gains: 0,
  });
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        const { data: statsData } = await axios.get(
          `${API_BASE}/api/stats/my-stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(statsData);

        const { data: betsData } = await axios.get(
          `${API_BASE}/api/stats/my-bets`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBets(betsData);
      } catch (err) {
        console.error("❌ Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    socket.on("prono:updated", loadData);
    socket.on("prono:created", loadData);

    return () => {
      socket.off("prono:updated");
      socket.off("prono:created");
    };
  }, [active]);

  const removeBet = async (pronoId) => {
    if (!confirm("Retirer ce prono de tes stats ?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/stats/unfollow/${pronoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBets((prev) => prev.filter((b) => b.pronoId !== pronoId));
      
      const { data: statsData } = await axios.get(
        `${API_BASE}/api/stats/my-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(statsData);
      
      alert("✅ Prono retiré de tes stats");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur");
    }
  };

  // 🔄 Synchroniser les résultats manuellement
  const syncResults = async () => {
    if (syncing) return;
    try {
      setSyncing(true);
      const token = localStorage.getItem("token");
      
      const { data } = await axios.post(
        `${API_BASE}/api/stats/sync-results`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data: statsData } = await axios.get(
        `${API_BASE}/api/stats/my-stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(statsData);

      const { data: betsData } = await axios.get(
        `${API_BASE}/api/stats/my-bets`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBets(betsData);

      alert(`✅ ${data.updated || 0} résultat(s) synchronisé(s) !`);
    } catch (err) {
      console.error(err);
      alert("Erreur de synchronisation");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-gray-400">Chargement de tes stats...</p>
        </div>
      </section>
    );
  }

  // 🔒 BLOQUER ACCÈS SI NON ABONNÉ
  if (!active) {
    return (
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-8 animate-float">
            <div className="inline-block w-24 h-24 bg-gradient-to-br from-blue-500/30 to-indigo-400/30 rounded-3xl flex items-center justify-center mb-6 text-5xl border-2 border-blue-500/40 shadow-2xl backdrop-blur-sm transform hover:scale-110 transition-all duration-500">
              🔒
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Mes Statistiques
              </span>
              <br />
              <span className="text-white drop-shadow-glow">Réservées aux membres</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Suis tous tes <span className="text-blue-400 font-semibold">pronos</span>, analyse ton{" "}
              <span className="text-indigo-400 font-semibold">taux de réussite</span> et optimise tes{" "}
              <span className="text-yellow-400 font-semibold">gains</span> !
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FeaturePreviewLock icon="🎯" title="Taux de réussite" desc="Analyse tes performances" delay="0" />
            <FeaturePreviewLock icon="📈" title="ROI en temps réel" desc="Suivi de ta rentabilité" delay="100" />
            <FeaturePreviewLock icon="💰" title="Gains totaux" desc="Vue d'ensemble de tes profits" delay="200" />
          </div>

          <Link
            to="/abonnements"
            className="inline-block bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-500 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-2xl hover:shadow-blue-500/60 animate-gradient-slow"
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
            filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.3));
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto relative overflow-hidden">
      {/* Particules */}
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="text-center mb-10 relative z-10 animate-slide-in-up">
        <div className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border-2 border-emerald-500 rounded-full mb-6 animate-pulse-slow relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative z-10 text-emerald-400 font-bold text-sm flex items-center gap-2">
            <span className="animate-bounce-slow">📊</span> STATISTIQUES
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x drop-shadow-2xl">
            Mes Performances
          </span>
        </h1>
        <p className="text-xl text-gray-300">
          Suis tes pronos et analyse tes résultats
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-12 relative z-10">
        <StatCard
          icon="⚽"
          label="Pronos suivis"
          value={stats.pronosSuivis}
          gradient="from-blue-500/20 to-cyan-500/20"
          delay="0"
        />
        <StatCard
          icon="🎯"
          label="Taux de réussite"
          value={`${stats.tauxReussite}%`}
          gradient={
            stats.tauxReussite >= 60
              ? "from-emerald-500/20 to-green-500/20"
              : stats.tauxReussite >= 50
              ? "from-amber-500/20 to-yellow-500/20"
              : "from-red-500/20 to-rose-500/20"
          }
          valueColor={
            stats.tauxReussite >= 60
              ? "text-emerald-400"
              : stats.tauxReussite >= 50
              ? "text-amber-400"
              : "text-red-400"
          }
          delay="100"
        />
        <StatCard
          icon="📈"
          label="ROI"
          value={`${stats.roi > 0 ? "+" : ""}${stats.roi}%`}
          gradient={
            stats.roi > 0
              ? "from-emerald-500/20 to-green-500/20"
              : "from-red-500/20 to-rose-500/20"
          }
          valueColor={stats.roi > 0 ? "text-emerald-400" : "text-red-400"}
          delay="200"
        />
        <StatCard
          icon="💰"
          label="Gains totaux"
          value={`${stats.gains > 0 ? "+" : ""}${stats.gains.toFixed(2)}€`}
          gradient={
            stats.gains > 0
              ? "from-emerald-500/20 to-green-500/20"
              : "from-red-500/20 to-rose-500/20"
          }
          valueColor={stats.gains > 0 ? "text-emerald-400" : "text-red-400"}
          delay="300"
        />
      </div>

      {/* Liste des paris */}
      <div className="relative bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary/30 rounded-3xl p-6 sm:p-8 overflow-hidden group animate-slide-in-up delay-200">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>🎯</span>
            Mes pronos suivis
            <span className="text-gray-500 text-lg">({bets.length})</span>
          </h2>
          <div className="flex gap-3">
            <button
              onClick={syncResults}
              disabled={syncing}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-all font-semibold text-sm hover:scale-105 disabled:opacity-50"
            >
              {syncing ? "⏳ Synchro..." : "🔄 Actualiser"}
            </button>
            <Link
              to="/pronostics"
              className="px-4 py-2 bg-primary/20 border border-primary rounded-xl text-primary hover:bg-primary hover:text-black transition-all font-semibold text-sm hover:scale-105"
            >
              + Suivre des pronos
            </Link>
          </div>
        </div>

        {bets.length === 0 ? (
          <div className="text-center py-20 relative z-10">
            <div className="text-8xl mb-6 animate-bounce">📭</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Aucun prono suivi pour le moment
            </h3>
            <p className="text-gray-400 mb-6 text-lg">
              Va sur la page Pronostics et clique sur "Suivre" pour commencer à tracker tes paris !
            </p>
            <Link
              to="/pronostics"
              className="group relative inline-block"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-primary to-yellow-400 text-black px-8 py-4 rounded-2xl font-bold hover:scale-110 transition-all duration-300 shadow-2xl">
                Voir les pronostics
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 relative z-10">
            {bets.map((bet, index) => (
              <div key={bet._id} className="animate-slide-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <BetCard bet={bet} onRemove={removeBet} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="mt-10 relative bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-6 overflow-hidden group animate-slide-in-up delay-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3 relative z-10">
          <span className="text-3xl">💡</span>
          Conseils pour améliorer tes stats
        </h3>
        <ul className="space-y-3 text-gray-300 relative z-10">
          <li className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform">
            <span className="text-primary text-lg flex-shrink-0 mt-0.5 group-hover/item:scale-125 transition-transform">✓</span>
            <span>Suis uniquement les pronos qui correspondent à ta stratégie</span>
          </li>
          <li className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform">
            <span className="text-primary text-lg flex-shrink-0 mt-0.5 group-hover/item:scale-125 transition-transform">✓</span>
            <span>Adapte tes mises selon ton bankroll (max 5% par pari)</span>
          </li>
          <li className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform">
            <span className="text-primary text-lg flex-shrink-0 mt-0.5 group-hover/item:scale-125 transition-transform">✓</span>
            <span>Vise un taux de réussite minimum de 55% pour être rentable</span>
          </li>
          <li className="flex items-start gap-3 group/item hover:translate-x-2 transition-transform">
            <span className="text-primary text-lg flex-shrink-0 mt-0.5 group-hover/item:scale-125 transition-transform">✓</span>
            <span>Analyse tes résultats régulièrement pour ajuster ta stratégie</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

{/* Styles CSS pour toutes les animations */}
<style>{`
  @keyframes win-flash {
    0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
    50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8), 0 0 60px rgba(16, 185, 129, 0.4); }
  }
  @keyframes lose-shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
  @keyframes pulse-win {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes confetti-1 {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(300px) rotate(360deg); opacity: 0; }
  }
  @keyframes confetti-2 {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(320px) rotate(-360deg); opacity: 0; }
  }
  @keyframes confetti-3 {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(280px) rotate(180deg); opacity: 0; }
  }
  @keyframes confetti-4 {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(310px) rotate(-180deg); opacity: 0; }
  }
  @keyframes confetti-5 {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(290px) rotate(270deg); opacity: 0; }
  }
  @keyframes confetti-6 {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(330px) rotate(-270deg); opacity: 0; }
  }
  @keyframes flame-1 {
    0%, 100% { opacity: 0.3; transform: translateY(0) scaleY(1); }
    50% { opacity: 0.6; transform: translateY(-10px) scaleY(1.2); }
  }
  @keyframes flame-2 {
    0%, 100% { opacity: 0.4; transform: translateY(0) scaleY(1); }
    50% { opacity: 0.7; transform: translateY(-15px) scaleY(1.3); }
  }
  @keyframes flame-3 {
    0%, 100% { opacity: 0.3; transform: translateY(0) scaleY(1); }
    50% { opacity: 0.5; transform: translateY(-8px) scaleY(1.1); }
  }
  .animate-win-flash {
    animation: win-flash 2s ease-in-out infinite;
  }
  .animate-lose-shake {
    animation: lose-shake 0.5s ease-in-out;
  }
  .animate-pulse-win {
    animation: pulse-win 1.5s ease-in-out infinite;
  }
  .animate-confetti-1 {
    animation: confetti-1 2s ease-out infinite;
  }
  .animate-confetti-2 {
    animation: confetti-2 2.2s ease-out infinite 0.2s;
  }
  .animate-confetti-3 {
    animation: confetti-3 2.1s ease-out infinite 0.4s;
  }
  .animate-confetti-4 {
    animation: confetti-4 2.3s ease-out infinite 0.6s;
  }
  .animate-confetti-5 {
    animation: confetti-5 2s ease-out infinite 0.8s;
  }
  .animate-confetti-6 {
    animation: confetti-6 2.4s ease-out infinite 1s;
  }
  .animate-flame-1 {
    animation: flame-1 1.5s ease-in-out infinite;
  }
  .animate-flame-2 {
    animation: flame-2 1.8s ease-in-out infinite 0.3s;
  }
  .animate-flame-3 {
    animation: flame-3 1.6s ease-in-out infinite 0.6s;
  }
`}</style>

function FeaturePreview({ icon, title, desc }) {
  return (
    <div className="group bg-gradient-to-br from-emerald-500/10 to-blue-500/5 border-2 border-emerald-500/30 rounded-2xl p-6 text-center hover:scale-110 hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 cursor-pointer">
      <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">{icon}</div>
      <h3 className="text-white font-bold mb-2 text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function FeaturePreviewLock({ icon, title, desc, delay }) {
  return (
    <div 
      className="bg-gradient-to-br from-blue-500/10 to-indigo-400/5 border-2 border-blue-500/30 rounded-2xl p-6 text-center transform hover:scale-110 hover:-rotate-2 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-5xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-white font-bold mb-2 text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function StatCard({ icon, label, value, gradient, valueColor = "text-white", delay }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} border-2 border-primary/30 rounded-2xl p-4 sm:p-6 hover:scale-105 sm:hover:scale-110 transition-all duration-500 shadow-xl hover:shadow-2xl group animate-slide-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <div className="relative z-10">
        <div className="text-3xl sm:text-4xl mb-3 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{icon}</div>
        <div className={`text-3xl sm:text-4xl font-black ${valueColor} mb-2`}>{value}</div>
        <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

function BetCard({ bet, onRemove }) {
  const resultat = (bet.resultat || "").toLowerCase();
  const isWin = resultat.includes("gagnant") || resultat.includes("win");
  const isLose = resultat.includes("perdu") || resultat.includes("lose");
  const isPending = !isWin && !isLose;

  const bgColor = isWin
    ? "border-emerald-500/60 bg-gradient-to-br from-emerald-500/20 to-green-500/10"
    : isLose
    ? "border-red-500/60 bg-gradient-to-br from-red-500/20 to-orange-500/10"
    : "border-gray-600 bg-gray-900/50";

  const gain = isWin ? (bet.mise * bet.cote - bet.mise).toFixed(2) : isLose ? -bet.mise : 0;

  return (
    <div className={`relative border-2 ${bgColor} rounded-xl p-4 sm:p-5 hover:scale-[1.02] transition-all duration-300 overflow-hidden group ${
      isWin ? 'animate-win-flash shadow-2xl shadow-emerald-500/40' : 
      isLose ? 'animate-lose-shake' : ''
    }`}>
      {/* Effet confettis pour les paris gagnants */}
      {isWin && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-2 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-confetti-1"></div>
          <div className="absolute top-3 right-1/3 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-confetti-2"></div>
          <div className="absolute top-4 left-1/2 w-2 h-2 bg-green-300 rounded-full animate-confetti-3"></div>
          <div className="absolute top-2 right-1/4 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-confetti-4"></div>
          <div className="absolute top-5 left-1/3 w-1 h-1 bg-lime-400 rounded-full animate-confetti-5"></div>
          <div className="absolute top-3 right-1/2 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-confetti-6"></div>
        </div>
      )}
      
      {/* Effet flammes pour les paris perdants */}
      {isLose && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-1/4 w-8 h-12 bg-gradient-to-t from-red-500/30 to-transparent blur-sm animate-flame-1"></div>
          <div className="absolute bottom-0 right-1/3 w-10 h-16 bg-gradient-to-t from-orange-500/30 to-transparent blur-sm animate-flame-2"></div>
          <div className="absolute bottom-0 left-1/2 w-6 h-10 bg-gradient-to-t from-red-400/30 to-transparent blur-sm animate-flame-3"></div>
        </div>
      )}
      
      {/* Brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 relative z-10">
        <div className="flex-1 w-full">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-white">
              {bet.equipe1} <span className="text-primary">vs</span> {bet.equipe2}
            </h3>
            {isPending && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
                En cours
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Prono:</span>
              <span className="text-white font-semibold">{bet.type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Cote:</span>
              <span className="text-yellow-400 font-bold">{bet.cote}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Mise:</span>
              <span className="text-primary font-bold">{bet.mise}€</span>
            </div>
            {!isPending && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Gain/Perte:</span>
                <span
                  className={`font-bold ${
                    gain > 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {gain > 0 ? "+" : ""}
                  {gain}€
                </span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                isWin
                  ? "bg-gradient-to-r from-emerald-500 to-green-400 text-white border-2 border-emerald-300 animate-pulse-win"
                  : isLose
                  ? "bg-gradient-to-r from-red-500 to-orange-500 text-white border-2 border-red-300"
                  : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
              }`}
            >
              {isWin ? (
                <>
                  <span className="text-2xl animate-bounce">🎉</span>
                  <span>Gagnant !</span>
                  <span className="text-2xl animate-bounce" style={{ animationDelay: "0.2s" }}>🎊</span>
                </>
              ) : isLose ? (
                <>
                  <span className="text-xl">💔</span>
                  <span>Perdu</span>
                </>
              ) : (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>En attente</span>
                </>
              )}
            </span>
          </div>
        </div>

        <button
          onClick={() => onRemove(bet.pronoId)}
          className="w-full sm:w-auto px-3 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold hover:scale-105"
        >
          🗑️ Retirer
        </button>
      </div>
    </div>
  );
}
