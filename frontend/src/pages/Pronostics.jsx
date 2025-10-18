import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { isSubscriptionActive } from "../hooks/useAuth";

export default function Pronostics() {
  const [loading, setLoading] = useState(true);
  const [pronos, setPronos] = useState([]);
  const [error, setError] = useState("");
  const [showPast, setShowPast] = useState(false);
  const active = isSubscriptionActive();

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/pronostics`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        const sorted = (data || []).sort(
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
    })();
  }, [active]);

  const groups = useMemo(() => {
    const today = [];
    const future = [];
    const past = [];

    const now = new Date();
    const y = now.getFullYear(),
      m = now.getMonth(),
      d = now.getDate();
    const start = new Date(y, m, d, 0, 0, 0);
    const end = new Date(y, m, d, 23, 59, 59);

    for (const p of pronos) {
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
  }, [pronos]);

  // 🔒 Si non abonné -> teaser
  if (!active) {
    return <VipTeaser />;
  }

  if (loading) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Pronostics du jour
        </h1>
        <p className="text-gray-300">Chargement des pronostics…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Pronostics du jour
        </h1>
        <p className="text-red-400">{error}</p>
      </section>
    );
  }

  const hasAny = groups.today.length || groups.future.length || groups.past.length;

  return (
    <section className="py-16">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">
        ⚡ Nos pronostics
      </h1>

      {!hasAny ? (
        <p className="text-center text-gray-400">Aucun pronostic pour l’instant.</p>
      ) : (
        <div className="max-w-6xl mx-auto space-y-10">
          {groups.today.length > 0 && (
            <Group title="Aujourd’hui" items={groups.today} />
          )}
          {groups.future.length > 0 && (
            <Group title="À venir" items={groups.future} />
          )}
          {groups.past.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-200">
                  Anciens{" "}
                  <span className="text-gray-500">({groups.past.length})</span>
                </h2>
                <button
                  onClick={() => setShowPast((v) => !v)}
                  className="text-sm border border-[#333] rounded-lg px-3 py-1 hover:bg-[#0f0f0f]"
                >
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

/* ---------- Composants ---------- */

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
      {items.map((p) => (
        <PronoCard key={p._id} p={p} />
      ))}
    </div>
  );
}

function PronoCard({ p }) {
  const color = borderColorFor(p.resultat);
  const vip = p.label === "prono_en_or" || p.label === "strategie_bankroll";

  return (
    <article
      className={`relative bg-black p-5 rounded-xl border ${color} transition hover:border-primary/60`}
    >
      {vip && (
        <div className="absolute -top-2 -left-2">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded">
            {p.label === "prono_en_or" ? "🔥 VIP" : "🧠 Stratégie"}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="text-sm text-primary font-semibold">{p.sport || "—"}</div>
        <div className="flex items-center gap-2">
          <LabelBadge label={p.label} />
          <span className="text-gray-400 text-sm">
            {p.date ? new Date(p.date).toLocaleString() : "—"}
          </span>
        </div>
      </div>

      <h3 className="text-lg md:text-xl text-white">
        {p.equipe1} <span className="text-gray-400">vs</span> {p.equipe2}
      </h3>

      <p className="text-gray-300 mt-1">
        <b className="text-white">Pronostic :</b> {p.type} •{" "}
        <b className="text-white">Cote :</b>{" "}
        <b className="text-primary">{p.cote}</b>
      </p>

      <p className="text-gray-400 mt-2">
        <b className="text-white">Résultat :</b>{" "}
        <b className={resultTextColor(p.resultat)}>
          {p.resultat || "En attente"}
        </b>
      </p>

      {p.details && (
        <p className="text-gray-300 mt-3 whitespace-pre-line leading-relaxed">
          {p.details}
        </p>
      )}

      {p.audioUrl && (
        <div className="mt-3">
          <audio controls className="w-full">
            <source src={`${API_BASE}${p.audioUrl}`} />
          </audio>
        </div>
      )}

      {vip && (
        <p className="mt-4 text-yellow-300 text-sm italic">
          💎 Analyse exclusive réservée aux abonnés Premium — nos experts vous
          guident avec des sélections à haute valeur ajoutée.
        </p>
      )}
    </article>
  );
}

/** Badge selon le label : standard | prono_en_or | strategie_bankroll */
function LabelBadge({ label }) {
  if (label === "prono_en_or") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-400/20 text-yellow-300 border border-yellow-400/50">
        🟡 Prono en or
      </span>
    );
  }
  if (label === "strategie_bankroll") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-300 border border-blue-400/50">
        🧠 Stratégie bankroll
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/50">
      ✅ Standard
    </span>
  );
}

/* Utils couleur bordure + texte résultat */
function borderColorFor(result) {
  const val = (result || "").toLowerCase();
  if (val.includes("gagnant") || val.includes("win")) return "border-emerald-400";
  if (val.includes("perdu") || val.includes("lose")) return "border-red-500";
  return "border-gray-600";
}
function resultTextColor(result) {
  const val = (result || "").toLowerCase();
  if (val.includes("gagnant") || val.includes("win")) return "text-emerald-300";
  if (val.includes("perdu") || val.includes("lose")) return "text-red-400";
  return "text-gray-400";
}

/* ---------- Teaser VIP ---------- */
function VipTeaser() {
  return (
    <section className="py-20 text-center">
      <h1 className="text-3xl font-bold text-primary mb-6">
        🔒 Pronostics Premium FlashProno
      </h1>
      <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
        Accédez à nos <span className="text-yellow-300">“Pronos en Or”</span>,
        nos <span className="text-sky-300">stratégies bankroll</span> et nos{" "}
        <span className="text-emerald-300">audios exclusifs</span> réservés aux
        membres Premium.
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-10">
        <LockedCard title="Prono en Or" emoji="💰" />
        <LockedCard title="Stratégie Bankroll" emoji="🧠" />
        <LockedCard title="Analyse Audio" emoji="🎧" />
      </div>

      <a
        href="/abonnements"
        className="inline-block bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition"
      >
        🚀 Devenir membre Premium
      </a>
      <p className="text-gray-400 text-sm mt-2">
        Accès instantané — Annulable à tout moment
      </p>
    </section>
  );
}

function LockedCard({ title, emoji }) {
  return (
    <div className="relative bg-[#0b0b0b] border border-[#1f1f1f] rounded-xl p-6 overflow-hidden">
      <div className="blur-[2px] opacity-80 select-none">
        <h3 className="text-xl text-white mb-2">
          {emoji} {title}
        </h3>
        <p className="text-gray-400">
          Découvrez nos analyses confidentielles et nos meilleurs pronos VIP.
        </p>
      </div>

      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
        <div className="text-3xl mb-2">🔒</div>
        <div className="text-white font-semibold">{title}</div>
        <a
          href="/abonnements"
          className="mt-3 bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:scale-105 transition"
        >
          Voir les offres
        </a>
      </div>
    </div>
  );
}
