// frontend/src/pages/Dashboard.jsx
import { getUser, logout } from "../hooks/useAuth";

export default function Dashboard() {
  const user = getUser();
  const sub = user?.subscription || {};

  const planLabel =
    sub.plan === "yearly"
      ? "Annuel VIP"
      : sub.plan === "monthly"
      ? "Mensuel Premium"
      : sub.status === "trial"
      ? "Essai gratuit"
      : "Aucun";

  const statusActive = sub.status === "active";
  const expiresDate = sub.expiresAt ? new Date(sub.expiresAt) : null;
  const expiresStr = expiresDate ? expiresDate.toLocaleDateString() : "—";

  const daysLeft =
    expiresDate
      ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <section className="py-16 max-w-6xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-primary">Mon Espace Membre</h1>
        <p className="text-gray-300 mt-2 text-lg">
          Bienvenue {user?.name || "membre"} 👋
        </p>
      </header>

      {/* Statut / plan / expiration */}
      <div className="grid gap-6 md:grid-cols-3">
        <InfoCard title="Abonnement" value={planLabel} />
        <InfoCard
          title="Statut"
          value={statusActive ? "Actif" : sub.status === "trial" ? "Essai" : "Inactif"}
          valueClass={statusActive ? "text-emerald-400" : "text-amber-400"}
        />
        <InfoCard
          title="Expire le"
          value={expiresStr}
          extra={
            daysLeft !== null && (
              <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded bg-[#111] border border-[#222] text-gray-300">
                {daysLeft > 0
                  ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`
                  : "Expire aujourd’hui"}
              </span>
            )
          }
        />
      </div>

      {/* Ruban d’état */}
      <div className="mt-8">
        {statusActive ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-300">
            🎉 Accès complet actif. Bonne réussite sur vos paris !
          </div>
        ) : sub.status === "trial" ? (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-300">
            ⏳ Vous êtes en essai. Activez un abonnement pour débloquer tout le contenu sans limite.
          </div>
        ) : (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
            🔒 Aucun abonnement actif.{" "}
            <a href="/abonnements" className="underline text-primary">
              Voir les offres
            </a>
          </div>
        )}
      </div>

      {/* Accès rapide */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold text-gray-200 mb-3">Accès rapide</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <QuickTile
            href="/pronostics"
            title="Pronostics du jour"
            desc="Conseils validés & mis à jour"
          />
          <QuickTile
            href="/bankroll"
            title="Gestion de Bankroll"
            desc="Optimisez vos mises avec nos outils dédiés"
          />
          <QuickTile
            href="/strategie"
            title="Stratégies & Apprentissage"
            desc="Découvrez nos méthodes gagnantes"
          />
          <QuickTile
            href="/abonnements"
            title="Mon offre"
            desc="Gérer ou prolonger mon accès"
          />
        </div>
      </section>

      {/* Avantages inclus */}
      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div className="bg-black rounded-xl border border-primary/50 p-6">
          <h3 className="text-lg font-semibold text-primary mb-3">
            Ce que vous obtenez
          </h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Pronostics triés et justifiés, prêts à jouer</li>
            <li>• Outil complet de <b>Gestion de Bankroll</b></li>
            <li>• Section <b>Stratégies & Apprentissage</b> interactive</li>
            <li>• Interface claire avec suivi de votre abonnement</li>
          </ul>
          <p className="text-xs text-gray-500 mt-4">
            ℹ️ <b>Pas de renouvellement automatique</b> : vous payez uniquement quand vous décidez de prolonger. Aucune
            démarche d’annulation à faire.
          </p>
        </div>

        {/* Support */}
        <div className="bg-black rounded-xl border border-[#2a2a2a] p-6">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">Besoin d’aide ?</h3>
          <p className="text-gray-300">
            Une question sur votre accès, les pronostics ou la stratégie ?
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://wa.me/33695962084"
              target="_blank"
              rel="noreferrer"
              className="inline-block bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:scale-105 transition"
            >
              Support WhatsApp
            </a>
            {!statusActive && (
              <a
                href="/abonnements"
                className="inline-block border border-primary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-[#0b0b0b] transition"
              >
                Voir les abonnements
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Déconnexion */}
      <div className="mt-12 text-center">
        <button
          onClick={logout}
          className="bg-red-500/90 hover:bg-red-500 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all"
        >
          Se déconnecter
        </button>
      </div>
    </section>
  );
}

/* ---------- Composants ---------- */
function InfoCard({ title, value, valueClass = "text-gray-300", extra = null }) {
  return (
    <div className="bg-black p-5 rounded-xl border border-primary shadow-md">
      <h3 className="font-semibold mb-2 text-primary">{title}</h3>
      <p className={`text-lg ${valueClass}`}>{value}</p>
      {extra}
    </div>
  );
}

function QuickTile({ href, title, desc }) {
  return (
    <a
      href={href}
      className="block bg-[#0b0b0b] border border-[#1e1e1e] hover:border-primary rounded-xl p-5 transition cursor-pointer"
    >
      <div className="text-white font-semibold">{title}</div>
      <div className="text-gray-400 text-sm mt-1">{desc}</div>
    </a>
  );
}
