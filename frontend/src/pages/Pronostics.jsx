import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { isSubscriptionActive } from "../hooks/useAuth";

export default function Pronostics() {
  const [loading, setLoading] = useState(true);
  const [pronos, setPronos] = useState([]);
  const [error, setError] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [filter, setFilter] = useState("all");
  const active = isSubscriptionActive();
  const refreshRef = useRef(null);

  const fetchData = async () => {
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
  };

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await fetchData();
      } catch (e) {
        setError(e?.response?.data?.message || "Erreur lors du chargement des pronostics.");
      } finally {
        setLoading(false);
      }
    })();
    refreshRef.current = setInterval(() => { fetchData().catch(() => {}); }, 30000);
    return () => refreshRef.current && clearInterval(refreshRef.current);
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
    const today = [], future = [], past = [];
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
    const start = new Date(y, m, d, 0, 0, 0);
    const end = new Date(y, m, d, 23, 59, 59);
    for (const p of filtered) {
      const dt = p.date ? new Date(p.date) : null;
      if (!dt) { past.push(p); continue; }
      if (dt >= start && dt <= end) today.push(p);
      else if (dt > end) future.push(p);
      else past.push(p);
    }
    return { today, future, past };
  }, [filtered]);

  if (!active) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Pronostics Foot — accès membres</h1>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          🔒 Débloque l’accès aux pronostics quotidiens, analyses et suivi (scores en direct).
        </p>
        <a href="/abonnements" className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition">
          Voir les abonnements
        </a>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-16">
        <HeaderIntro />
        <FilterBar filter={filter} setFilter={setFilter} stats={{ today: 0, future: 0, past: 0 }} loading />
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Pronostics Foot</h1>
        <p className="text-red-400">{error}</p>
      </section>
    );
  }

  const hasAny = groups.today.length || groups.future.length || groups.past.length;

  return (
    <section className="py-16">
      <HeaderIntro />
      <FilterBar filter={filter} setFilter={setFilter} stats={{ today: groups.today.length, future: groups.future.length, past: groups.past.length }} />
      {!hasAny ? (
        <p className="text-center text-gray-400 mt-8">Aucun pronostic pour l’instant.</p>
      ) : (
        <div className="max-w-6xl mx-auto space-y-10 mt-6">
          {groups.today.length > 0 && <Group title="Aujourd’hui" items={groups.today} />}
          {groups.future.length > 0 && <Group title="À venir" items={groups.future} />}
          {groups.past.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-200">
                  Anciens <span className="text-gray-500">({groups.past.length})</span>
                </h2>
                <button onClick={() => setShowPast(v => !v)} className="text-sm border border-[#333] rounded-lg px-3 py-1 hover:bg-[#0f0f0f]">
                  {showPast ? "Masquer" : "Afficher"}
                </button>
              </div>
              {showPast && <CardGrid items={groups.past} />}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function HeaderIntro() {
  return (
    <div className="text-center mb-6">
      <h1 className="text-3xl font-bold text-primary">Pronostics Foot</h1>
      <p className="text-gray-300 max-w-2xl mx-auto mt-2">
        Analyses rapides, <span className="text-white">scores en direct</span> et mise à jour continue pour une bankroll maîtrisée.
      </p>
    </div>
  );
}

function FilterBar({ filter, setFilter, stats, loading = false }) {
  const Btn = ({ id, label }) => {
    const active = filter === id;
    return (
      <button onClick={() => setFilter(id)} className={`px-3 py-1.5 rounded-lg text-sm border ${active ? "bg-primary text-black border-primary" : "border-[#2a2a2a] text-gray-300 hover:bg-[#0f0f0f]"}`}>
        {label}
      </button>
    );
  };
  return (
    <div className="sticky top-0 z-10 bg-dark/80 backdrop-blur border-y border-[#0d0d0d]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 py-3 px-2">
        <div className="flex items-center gap-2">
          <Btn id="all" label="Tous" />
          <Btn id="pending" label="En attente" />
          <Btn id="win" label="Gagnés" />
          <Btn id="lose" label="Perdus" />
        </div>
        {!loading && (
          <div className="text-xs text-gray-400">
            Aujourd’hui: <b className="text-white">{stats.today}</b> • À venir: <b className="text-white">{stats.future}</b> • Anciens: <b className="text-white">{stats.past}</b>
          </div>
        )}
      </div>
    </div>
  );
}

function Group({ title, items }) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-200 mb-3">
        {title} <span className="text-gray-500">({items.length})</span>
      </h2>
      <CardGrid items={items} />
    </div>
  );
}

function CardGrid({ items }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {items.map((p) => <PronoCard key={p._id} p={p} />)}
    </div>
  );
}

function PronoCard({ p }) {
  const [open, setOpen] = useState(false);
  const color = borderColorFor(p.resultat);
  const live = p.live || {};
  const isLive = !!live.isLive;
  const hasScore = typeof live.homeScore === "number" && typeof live.awayScore === "number";

  return (
    <article className={`bg-black p-5 rounded-xl border ${color} transition hover:border-primary/70`}>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 border border-emerald-500/30">
            Football
          </span>
          <LabelBadge label={p.label} />
        </div>
        <div className="flex items-center gap-2 text-right">
          {isLive && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              ● Live
            </span>
          )}
          {hasScore ? (
            <span className="text-white font-semibold text-sm">
              {live.homeScore} — {live.awayScore}
              {live.minute ? <span className="text-gray-400 font-normal"> &nbsp;({live.minute})</span> : null}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">
              {p.date ? new Date(p.date).toLocaleString() : "—"}
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg md:text-xl text-white">
        {p.equipe1} <span className="text-gray-400">vs</span> {p.equipe2}
      </h3>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-gray-300">
          <b className="text-white">Pronostic :</b> {p.type}
        </span>
        <span className="text-gray-300">
          <b className="text-white">Cote :</b> <b className="text-primary">{p.cote}</b>
        </span>
        <ResultPill value={p.resultat} />
      </div>

      {(p.details || p.audioUrl) && (
        <div className="mt-4">
          <button onClick={() => setOpen(v => !v)} className="text-sm border border-[#2a2a2a] rounded-lg px-3 py-1 hover:bg-[#0f0f0f]">
            {open ? "Masquer l’analyse" : "Voir l’analyse"}
          </button>
          {open && (
            <div className="mt-3 space-y-3">
              {p.details && <p className="text-gray-300 whitespace-pre-line leading-relaxed">{p.details}</p>}
              {p.audioUrl && (
                <audio controls className="w-full">
                  <source src={`${API_BASE}${p.audioUrl}`} />
                </audio>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function LabelBadge({ label }) {
  if (label === "prono_en_or") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/15 text-yellow-300 border border-yellow-500/30">
        🟡 Prono en or
      </span>
    );
  }
  if (label === "strategie_bankroll") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-400/15 text-blue-300 border border-blue-500/30">
        🧠 Stratégie bankroll
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/15 text-emerald-300 border border-emerald-500/30">
      ✅ Standard
    </span>
  );
}

function ResultPill({ value }) {
  const val = (value || "En attente").toLowerCase();
  let cls = "bg-gray-500/15 text-gray-300 border border-gray-600/40";
  let label = value || "En attente";
  if (val.includes("gagnant") || val.includes("win")) cls = "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
  else if (val.includes("perdu") || val.includes("lose")) cls = "bg-red-500/15 text-red-300 border border-red-500/30";
  return <span className={`text-xs px-2.5 py-0.5 rounded-full ${cls}`}>{label}</span>;
}

function borderColorFor(result) {
  const val = (result || "").toLowerCase();
  if (val.includes("gagnant") || val.includes("win")) return "border-emerald-400";
  if (val.includes("perdu") || val.includes("lose")) return "border-red-500";
  return "border-gray-600";
}

function SkeletonCard() {
  return (
    <div className="bg-black p-5 rounded-xl border border-[#2a2a2a] animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-[#1a1a1a] rounded" />
        <div className="h-4 w-36 bg-[#1a1a1a] rounded" />
      </div>
      <div className="h-5 w-64 bg-[#1a1a1a] rounded mb-2" />
      <div className="h-4 w-48 bg-[#1a1a1a] rounded mb-2" />
      <div className="h-4 w-40 bg-[#1a1a1a] rounded" />
    </div>
  );
}
