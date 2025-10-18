// frontend/src/pages/Pronostics.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { isSubscriptionActive } from "../hooks/useAuth";

export default function Pronostics() {
  const [loading, setLoading] = useState(true);
  const [pronos, setPronos] = useState([]);
  const [error, setError] = useState("");
  const active = isSubscriptionActive();

  const fetchPronos = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`${API_BASE}/api/pronostics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const sorted = (data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      setPronos(sorted);
    } catch (e) {
      setError(e?.response?.data?.message || "Erreur lors du chargement des pronostics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }
    fetchPronos();
    const iv = setInterval(fetchPronos, 30000);
    return () => clearInterval(iv);
  }, [active]);

  if (!active) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Pronostics du jour</h1>
        <p className="text-gray-300 mb-6">🔒 Cette section affichera vos pronostics une fois connecté et abonné.</p>
        <a href="/abonnements" className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition">Voir les abonnements</a>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Pronostics du jour</h1>
        <p className="text-gray-300">Chargement des pronostics…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Pronostics du jour</h1>
        <p className="text-red-400">{error}</p>
      </section>
    );
  }

  return (
    <section className="py-20">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Pronostics du jour</h1>
      {pronos.length === 0 ? (
        <p className="text-center text-gray-400">Aucun pronostic pour l’instant.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {pronos.map((p) => (
            <div key={p._id} className="bg-black p-5 rounded-xl border border-primary">
              <div className="flex justify-between items-center mb-2">
                <span className="text-primary font-semibold">{p.sport}</span>
                <div className="flex items-center gap-2">
                  <LabelBadge label={p.label} />
                  <StatusBadge status={p.status} />
                  <span className="text-gray-400">{p.date ? new Date(p.date).toLocaleString() : "—"}</span>
                </div>
              </div>

              <h3 className="text-xl text-white mb-1">{p.equipe1} vs {p.equipe2}</h3>

              {(p.status && p.status !== "NS") && (
                <p className="text-lg mt-1">
                  Score : <b className="text-white">{p.scoreHome ?? 0} - {p.scoreAway ?? 0}</b>
                </p>
              )}

              <p className="text-gray-300">Type : {p.type} • Cote : <b className="text-primary">{p.cote}</b></p>

              {p.resultat && (
                <p className="mt-2"><ResultBadge resultat={p.resultat} /></p>
              )}

              {p.details && (<p className="text-gray-300 mt-3 whitespace-pre-line">{p.details}</p>)}

              {p.audioUrl && (
                <audio controls className="mt-3 w-full"><source src={`${API_BASE}${p.audioUrl}`} /></audio>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LabelBadge({ label }) {
  if (label === "prono_en_or") {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/20 text-yellow-300 border border-yellow-400/50">🟡 Prono en or</span>;
  }
  if (label === "strategie_bankroll") {
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-300 border border-blue-400/50">🧠 Stratégie bankroll</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/50">✅ Standard</span>;
}

function StatusBadge({ status }) {
  const map = {
    NS: { txt: "À venir", cls: "bg-gray-500/20 text-gray-300 border-gray-500/40" },
    "1H": { txt: "1ère mi-temps", cls: "bg-green-500/20 text-green-300 border-green-500/40" },
    HT: { txt: "Mi-temps", cls: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" },
    "2H": { txt: "2ème mi-temps", cls: "bg-green-500/20 text-green-300 border-green-500/40" },
    FT: { txt: "Terminé", cls: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  };
  const s = map[status] || map.NS;
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>{s.txt}</span>;
}

function ResultBadge({ resultat }) {
  const m = {
    "Gagnant": "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    "Perdant": "bg-red-500/20 text-red-300 border-red-500/40",
    "Nul": "bg-gray-500/20 text-gray-300 border-gray-500/40",
    "En attente": "bg-gray-500/20 text-gray-300 border-gray-500/40",
  };
  const cls = m[resultat] || m["En attente"];
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>{resultat}</span>;
}
