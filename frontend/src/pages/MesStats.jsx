import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { Link } from "react-router-dom";
import socket from "../services/socket";

export default function MesStats() {
  const [stats, setStats] = useState({
    pronosSuivis: 0,
    tauxReussite: 0,
    roi: 0,
    gains: 0,
  });
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Charger les stats
        const { data: statsData } = await axios.get(
          `${API_BASE}/api/stats/my-stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStats(statsData);

        // Charger les paris suivis
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

    // 🔥 Actualisation auto quand un prono est modifié
    socket.on("prono:updated", loadData);
    socket.on("prono:created", loadData);

    return () => {
      socket.off("prono:updated");
      socket.off("prono:created");
    };
  }, []);

  const removeBet = async (pronoId) => {
    if (!confirm("Retirer ce prono de tes stats ?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/api/stats/unfollow/${pronoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBets((prev) => prev.filter((b) => b.pronoId !== pronoId));
      
      // Recharger les stats
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

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-block px-4 py-2 bg-primary/20 border border-primary rounded-full mb-4">
          <span className="text-primary font-semibold text-sm">📊 Statistiques</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
            Mes Performances
          </span>
        </h1>
        <p className="text-xl text-gray-300">
          Suis tes pronos et analyse tes résultats
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon="⚽"
          label="Pronos suivis"
          value={stats.pronosSuivis}
          gradient="from-blue-500/20 to-cyan-500/20"
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
        />
      </div>

      {/* Liste des paris */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary/30 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span>🎯</span>
            Mes pronos suivis
            <span className="text-gray-500 text-lg">({bets.length})</span>
          </h2>
          <Link
            to="/pronostics"
            className="px-4 py-2 bg-primary/20 border border-primary rounded-xl text-primary hover:bg-primary hover:text-black transition-all font-semibold text-sm"
          >
            + Suivre des pronos
          </Link>
        </div>

        {bets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-white mb-3">
              Aucun prono suivi pour le moment
            </h3>
            <p className="text-gray-400 mb-6">
              Va sur la page Pronostics et clique sur "Suivre" pour commencer à tracker tes paris !
            </p>
            <Link
              to="/pronostics"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-yellow-400 text-black rounded-xl font-bold hover:scale-105 transition-all"
            >
              Voir les pronostics
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bets.map((bet) => (
              <BetCard key={bet._id} bet={bet} onRemove={removeBet} />
            ))}
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="mt-10 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
          <span>💡</span>
          Conseils pour améliorer tes stats
        </h3>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-primary text-lg flex-shrink-0 mt-0.5">✓</span>
            <span>Suis uniquement les pronos qui correspondent à ta stratégie</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary text-lg flex-shrink-0 mt-0.5">✓</span>
            <span>Adapte tes mises selon ton bankroll (max 5% par pari)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary text-lg flex-shrink-0 mt-0.5">✓</span>
            <span>Vise un taux de réussite minimum de 55% pour être rentable</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-primary text-lg flex-shrink-0 mt-0.5">✓</span>
            <span>Analyse tes résultats régulièrement pour ajuster ta stratégie</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

/* ========== COMPOSANTS ========== */

function StatCard({ icon, label, value, gradient, valueColor = "text-white" }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} border-2 border-primary/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <div className={`text-4xl font-extrabold ${valueColor} mb-2`}>{value}</div>
      <div className="text-sm text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function BetCard({ bet, onRemove }) {
  const resultat = (bet.resultat || "").toLowerCase();
  const isWin = resultat.includes("gagnant") || resultat.includes("win");
  const isLose = resultat.includes("perdu") || resultat.includes("lose");
  const isPending = !isWin && !isLose;

  const bgColor = isWin
    ? "border-emerald-500/40 bg-emerald-500/10"
    : isLose
    ? "border-red-500/40 bg-red-500/10"
    : "border-gray-600 bg-gray-900/50";

  const gain = isWin ? (bet.mise * bet.cote - bet.mise).toFixed(2) : isLose ? -bet.mise : 0;

  return (
    <div className={`border-2 ${bgColor} rounded-xl p-5 hover:scale-[1.01] transition-all`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-bold text-white">
              {bet.equipe1} <span className="text-primary">vs</span> {bet.equipe2}
            </h3>
            {isPending && (
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
                En cours
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
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
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                isWin
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : isLose
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
              }`}
            >
              {isWin ? "✅ Gagnant" : isLose ? "❌ Perdu" : "⏳ En attente"}
            </span>
          </div>
        </div>

        <button
          onClick={() => onRemove(bet.pronoId)}
          className="px-3 py-2 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold"
        >
          🗑️ Retirer
        </button>
      </div>
    </div>
  );
}
