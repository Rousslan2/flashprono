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

    socket.on('prono:live', (liveData) => {
      console.log('🔴 Score LIVE reçu:', liveData);
      setPronos(prev => prev.map(p => {
        if (p._id === liveData.pronosticId) {
          return {
            ...p,
            scoreLive: liveData.scoreLive,
            resultat: liveData.resultat,
            statut: liveData.statut
          };
        }
        return p;
      }));
    });

    socket.on('prono:deleted', ({ _id }) => {
      console.log('🗑️ Prono supprimé:', _id);
      setPronos(prev => prev.filter(p => p._id !== _id));
    });

    // Nettoyage
    return () => {
      socket.off('prono:created');
      socket.off('prono:updated');
      socket.off('prono:live');
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
    <section className="pt-16 pb-12 px-4 relative overflow-hidden">
      {/* Particules animées en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-float"></div>
        <div className="absolute top-40 right-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-primary rounded-full animate-float-slow"></div>
        <div className="absolute top-60 right-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-float"></div>
        <div className="absolute bottom-60 left-1/2 w-3 h-3 bg-primary rounded-full animate-float-delayed"></div>
      </div>

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
          <div className="text-8xl mb-6 animate-bounce">⚽</div>
          <h3 className="text-3xl font-bold text-white mb-4">Aucun pronostic pour le moment</h3>
          <p className="text-gray-400 text-lg">
            Les nouveaux pronos arrivent bientôt. Reviens plus tard !
          </p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-12 mt-8">
          {groups.today.length > 0 && (
            <Group title="Aujourd'hui" icon="🔥" items={groups.today} now={now} gradient="from-red-500/20 to-orange-500/20" />
          )}
          {groups.future.length > 0 && (
            <Group title="À venir" icon="📅" items={groups.future} now={now} gradient="from-blue-500/20 to-cyan-500/20" />
          )}
          {groups.past.length > 0 && (
            <Group title="Archives" icon="📚" items={groups.past} now={now} gradient="from-gray-500/20 to-gray-600/20" />
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
      {/* Badge animé */}
      <div className="inline-block px-6 py-3 bg-gradient-to-r from-primary/20 to-yellow-400/20 border-2 border-primary rounded-full mb-6 animate-pulse-slow relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent font-bold text-sm relative z-10">⚽ SECTION PRONOSTICS VIP</span>
      </div>
      
      {/* Titre principal avec particles */}
      <div className="relative">
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight relative">
          <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-gradient-x drop-shadow-2xl inline-block hover:scale-105 transition-transform duration-300">
            Pronostics Football
          </span>
          {/* Étoiles décoratives */}
          <span className="absolute -top-4 -right-4 text-4xl animate-spin-slow">⭐</span>
          <span className="absolute -bottom-4 -left-4 text-3xl animate-bounce-slow">🔥</span>
        </h1>
      </div>
      
      {/* Description */}
      <p className="text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
        Sélection de paris <span className="text-primary font-bold relative inline-block group">
          <span className="relative z-10">simples & rentables</span>
          <span className="absolute inset-0 bg-primary/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        </span>,
        analyses courtes et mises à jour en continu.
      </p>
      
      {/* Séparateur animé */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <div className="h-1 w-12 bg-gradient-to-r from-transparent to-primary rounded-full animate-pulse"></div>
        <div className="h-2 w-2 bg-primary rounded-full animate-ping"></div>
        <div className="h-1 w-12 bg-gradient-to-l from-transparent to-primary rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

function FilterBar({ filter, setFilter, stats, loading = false }) {
  const Btn = ({ id, label, count }) => {
    const active = filter === id;
    return (
      <button
        onClick={() => setFilter(id)}
        className={`relative px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-300 overflow-hidden group ${
          active
            ? "bg-gradient-to-r from-primary to-yellow-400 text-black border-primary shadow-lg shadow-primary/50 scale-110"
            : "border-primary/30 text-gray-300 hover:bg-primary/10 hover:border-primary/50 hover:scale-105"
        }`}
      >
        {/* Effet brillance au hover */}
        {!active && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
        )}
        <span className="relative z-10">
          {label}
          {count !== undefined && <span className="ml-1.5 opacity-75">({count})</span>}
        </span>
      </button>
    );
  };

  const totalFiltered = stats.today + stats.future + stats.past;

  return (
    <div className="sticky top-16 z-20 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 backdrop-blur-xl border-y-2 border-primary/20 shadow-2xl">
      {/* Ligne lumineuse animée en haut */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
      
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 py-4 px-2">
        <div className="flex items-center flex-wrap gap-2">
          <Btn id="all" label="Tous" count={loading ? undefined : totalFiltered} />
          <Btn id="pending" label="⏳ En attente" />
          <Btn id="win" label="✅ Gagnés" />
          <Btn id="lose" label="❌ Perdus" />
        </div>
        {!loading && (
          <div className="hidden md:flex items-center gap-4 text-sm">
            <StatBadge icon="🔥" label="Aujourd'hui" value={stats.today} color="red" />
            <StatBadge icon="📅" label="À venir" value={stats.future} color="blue" />
            <StatBadge icon="📚" label="Archives" value={stats.past} color="gray" />
          </div>
        )}
      </div>
      
      {/* Ligne lumineuse animée en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse delay-500"></div>
    </div>
  );
}

function StatBadge({ icon, label, value, color = "gray" }) {
  const colorClasses = {
    red: "from-red-500/20 to-orange-500/20 border-red-500/40 text-red-300 shadow-red-500/30",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/40 text-blue-300 shadow-blue-500/30",
    gray: "from-gray-500/20 to-gray-600/20 border-gray-500/40 text-gray-300 shadow-gray-500/30",
  };
  
  return (
    <div className={`group flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br ${colorClasses[color]} border-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer`}>
      <span className="text-lg group-hover:scale-125 transition-transform">{icon}</span>
      <span className="text-gray-400 text-xs">{label}:</span>
      <span className="font-bold text-base group-hover:text-white transition-colors">{value}</span>
    </div>
  );
}

function Group({ title, icon, items, now, gradient }) {
  return (
    <div className="relative group/section">
      {/* Halo coloré en arrière-plan */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} blur-3xl opacity-20 group-hover/section:opacity-30 transition-opacity duration-500 -z-10`}></div>
      
      {/* Header de section amélioré */}
      <div className="relative mb-8">
        {/* Ligne décorative gauche */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-b ${gradient} rounded-full"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 ml-6">
          {/* Icône animée */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
            <div className="relative text-4xl md:text-5xl animate-bounce-slow transform group-hover/section:scale-125 transition-transform duration-500">
              {icon}
            </div>
          </div>
          
          {/* Titre et badge */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-black text-white group-hover/section:text-primary transition-colors duration-300">
                {title}
              </h2>
              {/* Badge compteur animé */}
              <div className="relative">
                <div className="absolute inset-0 bg-primary blur-lg opacity-50 animate-pulse"></div>
                <span className="relative px-4 py-1 bg-gradient-to-r from-primary to-yellow-400 text-black rounded-full text-lg md:text-xl font-black shadow-lg transform group-hover/section:scale-110 transition-transform duration-300">
                  {items.length}
                </span>
              </div>
            </div>
            {/* Ligne de progression */}
            <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-yellow-400 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      <CardGrid items={items} now={now} />
    </div>
  );
}

function CardGrid({ items, now }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {items.map((p, index) => (
        <div
          key={p._id}
          className="animate-slide-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <PronoCard p={p} now={now} />
        </div>
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
  
  const resultat = (p.resultat || "").toLowerCase();
  const isWin = resultat.includes("gagnant") || resultat.includes("win");
  const isLose = resultat.includes("perdu") || resultat.includes("lose");
  
  const color = isWin ? "border-emerald-400 shadow-2xl shadow-emerald-500/40 animate-win-flash" : 
                isLose ? "border-red-500 shadow-xl shadow-red-500/30" : 
                borderColorFor(p.resultat);
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
      className={`group relative bg-gradient-to-br from-black via-gray-900 to-black p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl border-2 ${color} transition-all duration-500 hover:scale-[1.02] md:hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/30 overflow-hidden transform-gpu`}
      style={{
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={(e) => {
        if (window.innerWidth < 768) return; // Pas d'effet 3D sur mobile
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
      }}
      onMouseLeave={(e) => {
        if (window.innerWidth < 768) return;
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
      }}
    >
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
      </div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-start justify-between gap-3 mb-6 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            ⚽ Football
          </span>
          <LabelBadge label={p.label} />
        </div>
        <div className="text-left md:text-right">
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

      {/* Match Teams - PLUS GROS */}
      <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-4 md:mb-6 relative z-10 leading-tight break-words">
        <span className="hover:text-primary transition-colors">{p.equipe1}</span>
        <span className="text-primary mx-2 md:mx-3 animate-pulse">VS</span>
        <span className="hover:text-primary transition-colors">{p.equipe2}</span>
      </h3>

      {/* Prono Info - Style carte */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6 relative z-10">
        <div className="px-3 md:px-5 py-2 md:py-3 bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/40 rounded-xl md:rounded-2xl hover:scale-110 transition-transform shadow-lg">
          <span className="text-xs text-gray-400 block mb-1 font-semibold">Pronostic</span>
          <span className="text-white font-black text-base md:text-lg">{p.type}</span>
        </div>
        <div className="px-3 md:px-5 py-2 md:py-3 bg-gradient-to-br from-yellow-400/20 to-yellow-400/10 border-2 border-yellow-400/40 rounded-xl md:rounded-2xl hover:scale-110 transition-transform shadow-lg">
          <span className="text-xs text-gray-400 block mb-1 font-semibold">Cote</span>
          <span className="text-yellow-400 font-black text-lg md:text-xl">{p.cote}</span>
        </div>
        <ResultPill value={p.resultat} />
      </div>
      
      {/* Score Live - Toujours affiché */}
      <div className="mb-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 rounded-2xl shadow-lg">
          <span className="text-xs text-gray-400 font-semibold">📊 Score :</span>
          {p.scoreLive ? (
            <>
              <span className="text-blue-300 font-black text-xl">{p.scoreLive}</span>
              {(p.resultat?.toLowerCase().includes("gagnant") || p.resultat?.toLowerCase().includes("perdu")) && (
                <span className="text-xs text-gray-500 ml-1">(Terminé)</span>
              )}
            </>
          ) : (
            <span className="text-gray-500 font-bold text-lg flex items-center gap-2">
              <span className="animate-pulse">---</span>
              <span className="text-xs">(En attente)</span>
            </span>
          )}
        </div>
      </div>
      
      {/* Bouton Suivre */}
      {!loadingFollow && (
        <div className="mb-4 relative z-10">
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
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-primary rounded-2xl p-6 max-w-md w-full relative z-[10000] shadow-2xl">
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
        <div className="mt-4 relative z-10">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary/30 rounded-xl hover:bg-primary/10 transition-all font-semibold text-sm group w-full justify-center"
          >
            <span className="group-hover:scale-110 transition-transform">
              {open ? "📖" : "🔍"}
            </span>
            {open ? "Masquer l'analyse" : "Voir l'analyse détaillée"}
          </button>
          {open && (
            <div className="mt-4 p-4 bg-black/50 border border-primary/20 rounded-xl space-y-3 relative z-10">
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
      <span className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black overflow-hidden group">
        {/* Background animé */}
        <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 group-hover:from-blue-400/30 group-hover:to-cyan-400/30 transition-all"></span>
        <span className="absolute inset-0 border-2 border-blue-500/40 rounded-full group-hover:border-blue-500/60 transition-colors"></span>
        {/* Effet brillance */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
        {/* Contenu */}
        <span className="relative z-10 text-2xl group-hover:scale-125 transition-transform">🧠</span>
        <span className="relative z-10 text-blue-300 group-hover:text-blue-200 transition-colors">Stratégie</span>
      </span>
    );
  }
  if (label === "prono_en_or") {
    return (
      <span className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black overflow-hidden group">
        {/* Background shimmer */}
        <span className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 animate-shimmer"></span>
        <span className="absolute inset-0 border-2 border-yellow-500/50 rounded-full shadow-2xl shadow-yellow-500/50"></span>
        {/* Particules dorées */}
        <span className="absolute top-0 right-2 w-1 h-1 bg-yellow-300 rounded-full animate-ping"></span>
        <span className="absolute bottom-1 left-3 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-300"></span>
        {/* Contenu */}
        <span className="relative z-10 text-2xl animate-spin-slow group-hover:scale-150 transition-transform duration-500">👑</span>
        <span className="relative z-10 text-yellow-300 group-hover:text-yellow-200 transition-colors">PRONO EN OR</span>
      </span>
    );
  }
  return null;
}

function ResultPill({ value }) {
  const val = (value || "En attente").toLowerCase();
  const isWin = val.includes("gagnant") || val.includes("win");
  const isLose = val.includes("perdu") || val.includes("lose");
  
  let cls = "bg-gray-500/15 text-gray-300 border border-gray-600/40";
  let icon = "⏳";
  let label = value || "En attente";

  if (isWin) {
    cls = "bg-gradient-to-r from-emerald-500 to-green-400 text-white border-2 border-emerald-300 shadow-lg shadow-emerald-500/50 animate-pulse-win";
    icon = "🎉";
  } else if (isLose) {
    cls = "bg-gradient-to-r from-red-500 to-orange-500 text-white border-2 border-red-300 shadow-lg";
    icon = "💔";
  }

  return (
    <span className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full font-bold ${cls} relative overflow-hidden group`}>
      {isWin && (
        <>
          <span className="absolute inset-0 pointer-events-none">
            <span className="absolute top-0 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-sparkle-1"></span>
            <span className="absolute top-0 right-1/3 w-1 h-1 bg-white rounded-full animate-sparkle-2"></span>
          </span>
        </>
      )}
      <span className={isWin ? "text-xl animate-bounce" : "text-lg"}>{icon}</span>
      <span>{label}</span>
      {isWin && <span className="text-xl animate-bounce" style={{ animationDelay: "0.2s" }}>🎊</span>}
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

{/* Styles CSS pour les animations */}
<style>{`
  @keyframes win-flash {
    0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
    50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.8), 0 0 60px rgba(16, 185, 129, 0.4); }
  }
  @keyframes pulse-win {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes sparkle-1 {
    0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
    50% { opacity: 1; transform: scale(2) translateY(-10px); }
  }
  @keyframes sparkle-2 {
    0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
    50% { opacity: 1; transform: scale(1.5) translateY(-8px); }
  }
  .animate-win-flash {
    animation: win-flash 2s ease-in-out infinite;
  }
  .animate-pulse-win {
    animation: pulse-win 1.5s ease-in-out infinite;
  }
  .animate-sparkle-1 {
    animation: sparkle-1 1.5s ease-in-out infinite;
  }
  .animate-sparkle-2 {
    animation: sparkle-2 1.8s ease-in-out infinite 0.3s;
  }
`}</style>
