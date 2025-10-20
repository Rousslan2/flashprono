// frontend/src/pages/Pronostics.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { isSubscriptionActive } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import socket from "../services/socket";

export default function Pronostics() {
  const [loading, setLoading] = useState(true);
  const [pronos, setPronos] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [now, setNow] = useState(new Date());
  const active = isSubscriptionActive();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }

    const loadPronos = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/pronostics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const onlyFootball = (data || []).filter((p) =>
          (p.sport || "").toLowerCase().includes("foot")
        );

        const sorted = onlyFootball.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setPronos(sorted);
      } catch (e) {
        setError(
          e?.response?.data?.message ||
            "Erreur lors du chargement des pronostics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPronos();

    // 🔥 Écouter les événements Socket.io
    socket.on('prono:created', (newProno) => {
      console.log('🎉 Nouveau prono reçu:', newProno);
      if ((newProno.sport || "").toLowerCase().includes("foot")) {
        setPronos(prev => [newProno, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date)));
      }
    });

    socket.on('prono:updated', (updatedProno) => {
      console.log('✏️ Prono mis à jour:', updatedProno);
      setPronos(prev => prev.map(p => p._id === updatedProno._id ? updatedProno : p));
    });

    socket.on('prono:deleted', ({ _id }) => {
      console.log('🗑️ Prono supprimé:', _id);
      setPronos(prev => prev.filter(p => p._id !== _id));
    });

    // Nettoyage
    return () => {
      socket.off('prono:created');
      socket.off('prono:updated');
      socket.off('prono:deleted');
    };
  }, [active]);

  const filtered = useMemo(() => {
    const f = (p) => {
      const res = (p.resultat || "").toLowerCase();
      if (filter === "pending") return !res || res.includes("attente");
      if (filter === "win") return res.includes("gagnant") || res.includes("win");
      if (filter === "lose") return res.includes("perdu") || res.includes("lose");
      return true;
    };
    return pronos.filter(f);
  }, [pronos, filter]);

  const groups = useMemo(() => {
    const today = [];
    const future = [];
    const past = [];

    const y = now.getFullYear(),
      m = now.getMonth(),
      d = now.getDate();
    const start = new Date(y, m, d, 0, 0, 0);
    const end = new Date(y, m, d, 23, 59, 59);

    for (const p of filtered) {
      const dt = p.date ? new Date(p.date) : null;
      if (!dt) {
        past.push(p);
        continue;
      }
      if (dt >= start && dt <= end) today.push(p);
      else if (dt > end) future.push(p);
      else past.push(p);
    }
    return { today, future, past };
  }, [filtered, now]);

  if (!active) {
    return (
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-8 animate-bounce-slow">
            <div className="inline-block w-24 h-24 bg-gradient-to-br from-primary to-yellow-400 rounded-full flex items-center justify-center mb-6 text-5xl border-4 border-white/20 shadow-2xl">
              🔒
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-gradient-x">
                Pronostics Football
              </span>
              <br />
              <span className="text-white drop-shadow-lg">Réservés aux membres VIP</span>
            </h1>
            <p className="text-2xl text-gray-300 leading-relaxed mb-8">
              Débloque l'accès aux <span className="text-primary font-bold">pronos quotidiens</span>,
              analyses détaillées et suivi en temps réel.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FeaturePreview icon="⚽" title="Pronos vérifiés" desc="Sélection quotidienne analysée" />
            <FeaturePreview icon="🏆" title="Pronos en or" desc="Les meilleures values" />
            <FeaturePreview icon="📊" title="Scores live" desc="Suivi en temps réel" />
          </div>

          <Link
            to="/abonnements"
            className="group inline-block relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-primary to-yellow-400 text-black px-12 py-5 rounded-2xl font-bold text-xl hover:scale-110 transition-all duration-300 shadow-2xl">
              ✨ Devenir membre VIP
            </div>
          </Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-16 px-4">
        <HeaderIntro />
        <FilterBar
          filter={filter}
          setFilter={setFilter}
          stats={{ today: 0, future: 0, past: 0 }}
          loading
        />
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-primary mb-4">Une erreur est survenue</h1>
          <p className="text-red-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Réessayer
          </button>
        </div>
      </section>
    );
  }

  const hasAny = groups.today.length || groups.future.length || groups.past.length;

  return (
    <section className="pt-16 pb-12 px-4">
      <HeaderIntro />
      <FilterBar
        filter={filter}
        setFilter={setFilter}
        stats={{
          today: groups.today.length,
          future: groups.future.length,
          past: groups.past.length,
        }}
      />

      {!hasAny ? (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-2xl font-bold text-white mb-3">Aucun pronostic pour le moment</h3>
          <p className="text-gray-400">
            Les nouveaux pronos arrivent bientôt. Reviens plus tard !
          </p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-12 mt-8">
          {groups.today.length > 0 && (
            <Group title="Aujourd'hui" icon="🔥" items={groups.today} now={now} />
          )}
          {groups.future.length > 0 && (
            <Group title="À venir" icon="📅" items={groups.future} now={now} />
          )}
          {groups.past.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span>📚</span>
                Anciens{" "}
                <span className="text-gray-500 text-lg">({groups.past.length})</span>
              </h2>
              <CardGrid items={groups.past} now={now} />
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ---------- Composants ---------- */

function FeaturePreview({ icon, title, desc }) {
  return (
    <div className="group bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 rounded-2xl p-6 text-center hover:scale-110 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-500 cursor-pointer">
      <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">{icon}</div>
      <h3 className="text-white font-bold mb-2 text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

function HeaderIntro() {
  return (
    <div className="text-center mb-12 max-w-5xl mx-auto relative z-10">
      <div className="inline-block px-6 py-3 bg-gradient-to-r from-primary/20 to-yellow-400/20 border-2 border-primary rounded-full mb-6 animate-pulse-slow">
        <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent font-bold text-sm">⚽ SECTION PRONOSTICS VIP</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
        <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-gradient-x drop-shadow-2xl">
          Pronostics Football
        </span>
      </h1>
      <p className="text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
        Sélection de paris <span className="text-primary font-bold">simples & rentables</span>,
        analyses courtes et mises à jour en continu.
      </p>
    </div>
  );
}

function FilterBar({ filter, setFilter, stats, loading = false }) {
  const Btn = ({ id, label, count }) => {
    const active = filter === id;
    return (
      <button
        onClick={() => setFilter(id)}
        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
          active
            ? "bg-gradient-to-r from-primary to-yellow-400 text-black border-primary shadow-lg"
            : "border-primary/30 text-gray-300 hover:bg-primary/10 hover:border-primary/50"
        }`}
      >
        {label}
        {count !== undefined && <span className="ml-1.5 opacity-75">({count})</span>}
      </button>
    );
  };

  const totalFiltered = stats.today + stats.future + stats.past;

  return (
    <div className="sticky top-16 z-20 bg-dark/95 backdrop-blur-xl border-y-2 border-primary/20 shadow-xl">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 py-4 px-2">
        <div className="flex items-center flex-wrap gap-2">
          <Btn id="all" label="Tous" count={loading ? undefined : totalFiltered} />
          <Btn id="pending" label="En attente" />
          <Btn id="win" label="Gagnés" />
          <Btn id="lose" label="Perdus" />
        </div>
        {!loading && (
          <div className="hidden md:flex items-center gap-4 text-sm">
            <StatBadge icon="🔥" label="Aujourd'hui" value={stats.today} />
            <StatBadge icon="📅" label="À venir" value={stats.future} />
            <StatBadge icon="📚" label="Archives" value={stats.past} />
          </div>
        )}
      </div>
    </div>
  );
}

function StatBadge({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-primary/30 rounded-lg">
      <span>{icon}</span>
      <span className="text-gray-400">{label}:</span>
      <span className="text-primary font-bold">{value}</span>
    </div>
  );
}

function Group({ title, icon, items, now }) {
  return (
    <div>
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <span>{icon}</span>
        {title}
        <span className="text-gray-500 text-xl">({items.length})</span>
      </h2>
      <CardGrid items={items} now={now} />
    </div>
  );
}

function CardGrid({ items, now }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {items.map((p) => (
        <PronoCard key={p._id} p={p} now={now} />
      ))}
    </div>
  );
}

function PronoCard({ p, now }) {
  const [open, setOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(true);
  const [showMiseModal, setShowMiseModal] = useState(false);
  const [customMise, setCustomMise] = useState("");
  const color = borderColorFor(p.resultat);
  const status = computeMatchStatus(p.date, now);
  
  // Vérifier si le prono est suivi
  useEffect(() => {
    const checkFollowing = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const { data } = await axios.get(
          `${API_BASE}/api/stats/is-following/${p._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFollowing(data.isFollowing);
      } catch (err) {
        console.error('Erreur vérif suivi:', err);
      } finally {
        setLoadingFollow(false);
      }
    };
    
    checkFollowing();
  }, [p._id]);
  
  const handleFollow = async (mise = 10) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/api/stats/follow/${p._id}`,
        { mise },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFollowing(true);
      setShowMiseModal(false);
      setCustomMise("");
      alert(`✅ Prono suivi avec ${mise}€ !`);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };
  
  const handleCustomFollow = () => {
    const amount = parseFloat(customMise);
    if (!amount || amount <= 0) {
      alert("⚠️ Entre un montant valide");
      return;
    }
    handleFollow(amount);
  };
  
  const handleUnfollow = async () => {
    if (!confirm('Ne plus suivre ce prono ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_BASE}/api/stats/unfollow/${p._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFollowing(false);
      alert('❌ Prono retiré de tes suivis');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <article
      className={`group relative bg-gradient-to-br from-black via-gray-900 to-black p-6 rounded-2xl border-2 ${color} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            ⚽ Football
          </span>
          <LabelBadge label={p.label} />
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-sm font-medium">
            {p.date ? new Date(p.date).toLocaleString("fr-FR", { 
              day: "2-digit", 
              month: "short", 
              hour: "2-digit", 
              minute: "2-digit" 
            }) : "—"}
          </div>
          <div className="text-xs mt-1">{renderStatus(status)}</div>
        </div>
      </div>

      {/* Match Teams */}
      <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
        {p.equipe1} <span className="text-primary mx-2">VS</span> {p.equipe2}
      </h3>

      {/* Prono Info */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-xl">
          <span className="text-xs text-gray-400 block mb-1">Type de pari</span>
          <span className="text-white font-bold">{p.type}</span>
        </div>
        <div className="px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl">
          <span className="text-xs text-gray-400 block mb-1">Cote</span>
          <span className="text-yellow-400 font-bold text-lg">{p.cote}</span>
        </div>
      </div>
      
      {/* Score Live */}
      {p.scoreLive && (
        <div className="mb-4">
          <div className="px-4 py-3 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl inline-flex items-center gap-2">
            <span className="text-xs text-gray-400 font-semibold">📊 Score:</span>
            <span className="text-blue-300 font-bold text-xl">{p.scoreLive}</span>
          </div>
        </div>
      )}
      
      {/* Résultat du Pari */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-semibold">Résultat du pari:</span>
          <ResultPill value={p.resultat} />
        </div>
      </div>
      
      {/* Bouton Suivre */}
      {!loadingFollow && (
        <div className="mb-4">
          {isFollowing ? (
            <button
              onClick={handleUnfollow}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border-2 border-red-500/40 text-red-300 rounded-xl hover:bg-red-500/30 transition-all font-semibold text-sm"
            >
              <span>✔️</span>
              Suivi - Retirer
            </button>
          ) : (
            <button
              onClick={() => setShowMiseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 border-2 border-primary/40 text-primary rounded-xl hover:bg-primary/30 transition-all font-semibold text-sm hover:scale-105"
            >
              <span>🎯</span>
              Suivre ce prono
            </button>
          )}
        </div>
      )}
      
      {/* Modal Mise */}
      {showMiseModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-primary rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">💰 Quelle mise ?</h3>
            <p className="text-gray-400 text-sm mb-4">Choisis un montant prédéfini ou entre le tien</p>
            
            {/* Boutons prédéfinis */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[5, 10, 20, 50, 100, 200].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleFollow(amount)}
                  className="px-4 py-3 bg-primary/20 border border-primary/40 text-primary rounded-xl hover:bg-primary hover:text-black transition-all font-bold"
                >
                  {amount}€
                </button>
              ))}
            </div>
            
            {/* Input personnalisé */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">🖊️ Autre montant</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Ex: 15"
                  value={customMise}
                  onChange={(e) => setCustomMise(e.target.value)}
                  className="flex-1 px-4 py-2 bg-black border border-primary/40 rounded-xl text-white focus:outline-none focus:border-primary"
                  min="0.01"
                  step="0.01"
                />
                <button
                  onClick={handleCustomFollow}
                  className="px-4 py-2 bg-primary text-black rounded-xl hover:scale-105 transition-all font-bold"
                >
                  OK
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowMiseModal(false);
                setCustomMise("");
              }}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Analyse */}
      {(p.details || p.audioUrl) && (
        <div className="mt-4">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary/30 rounded-xl hover:bg-primary/10 transition-all font-semibold text-sm group"
          >
            <span className="group-hover:scale-110 transition-transform">
              {open ? "📖" : "🔍"}
            </span>
            {open ? "Masquer l'analyse" : "Voir l'analyse détaillée"}
          </button>
          {open && (
            <div className="mt-4 p-4 bg-black/50 border border-primary/20 rounded-xl space-y-3">
              {p.details && (
                <div>
                  <h4 className="text-primary font-semibold mb-2 flex items-center gap-2">
                    <span>📝</span> Analyse
                  </h4>
                  <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                    {p.details}
                  </p>
                </div>
              )}
              {p.audioUrl && (
                <div>
                  <h4 className="text-primary font-semibold mb-2 flex items-center gap-2">
                    <span>🎧</span> Audio
                  </h4>
                  <audio controls className="w-full">
                    <source src={`${API_BASE}${p.audioUrl}`} />
                  </audio>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function LabelBadge({ label }) {
  if (label === "strategie_bankroll") {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-gradient-to-r from-blue-400/20 to-cyan-400/20 text-blue-300 border-2 border-blue-500/40 shadow-lg animate-pulse-slow">
        🧠 Stratégie
      </span>
    );
  }
  if (label === "prono_en_or") {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-gradient-to-r from-yellow-400/30 to-orange-400/30 text-yellow-300 border-2 border-yellow-500/50 animate-shimmer shadow-2xl shadow-yellow-500/50">
        <span className="animate-spin-slow">👑</span> PRONO EN OR
      </span>
    );
  }
  return null;
}

function ResultPill({ value }) {
  const val = (value || "En attente").toLowerCase();
  let cls = "bg-gray-500/15 text-gray-300 border border-gray-600/40";
  let icon = "⏳";
  let label = value || "En attente";

  if (val.includes("gagnant") || val.includes("win")) {
    cls = "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
    icon = "✅";
  } else if (val.includes("perdu") || val.includes("lose")) {
    cls = "bg-red-500/15 text-red-300 border border-red-500/30";
    icon = "❌";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${cls}`}>
      <span>{icon}</span>
      {label}
    </span>
  );
}

function borderColorFor(result) {
  const val = (result || "").toLowerCase();
  if (val.includes("gagnant") || val.includes("win")) return "border-emerald-400";
  if (val.includes("perdu") || val.includes("lose")) return "border-red-500";
  return "border-gray-600";
}

function computeMatchStatus(dateStr, now = new Date()) {
  if (!dateStr) return { kind: "unknown" };
  const start = new Date(dateStr);
  if (isNaN(start.getTime())) return { kind: "unknown" };

  const diffMs = now.getTime() - start.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 0) {
    const mins = Math.abs(diffMin);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return { kind: "upcoming", hours: h, mins: m };
  }

  if (diffMin < 45) return { kind: "live", minutes: diffMin };
  if (diffMin < 60) return { kind: "halftime", minutes: diffMin };
  if (diffMin < 120) return { kind: "live", minutes: diffMin - 15 };
  return { kind: "finished" };
}

function renderStatus(st) {
  if (!st || st.kind === "unknown")
    return <span className="text-gray-500">—</span>;
  if (st.kind === "upcoming") {
    if (st.hours <= 0)
      return <span className="text-emerald-300 font-semibold">📍 Dans {st.mins} min</span>;
    return (
      <span className="text-emerald-300 font-semibold">
        📍 Dans {st.hours}h {st.mins}m
      </span>
    );
  }
  if (st.kind === "halftime")
    return <span className="text-sky-300 font-semibold">⏸️ Mi-temps</span>;
  if (st.kind === "live")
    return (
      <span className="text-amber-300 font-semibold flex items-center gap-1">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        LIVE {st.minutes}'
      </span>
    );
  if (st.kind === "finished")
    return <span className="text-gray-500">🏁 Terminé</span>;
  return <span className="text-gray-500">—</span>;
}

function SkeletonCard() {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black p-6 rounded-2xl border-2 border-gray-700 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-24 bg-gray-800 rounded-full" />
        <div className="h-4 w-36 bg-gray-800 rounded" />
      </div>
      <div className="h-7 w-64 bg-gray-800 rounded mb-4" />
      <div className="flex gap-3 mb-4">
        <div className="h-16 w-28 bg-gray-800 rounded-xl" />
        <div className="h-16 w-28 bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}
