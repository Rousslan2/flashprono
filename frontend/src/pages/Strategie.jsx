import { isSubscriptionActive } from "../hooks/useAuth";

/**
 * Page : Stratégies & Apprentissage
 * Accès réservé aux abonnés
 */
export default function Strategie() {
  const active = isSubscriptionActive();

  if (!active) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Stratégies & Apprentissage</h1>
        <p className="text-gray-300 mb-6">🔒 Cette page est réservée aux abonnés.</p>
        <a href="/abonnements" className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition">
          Voir les abonnements
        </a>
      </section>
    );
  }

  return (
    <section className="py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">Stratégies & Apprentissage</h1>

      <div className="aspect-video w-full rounded-xl overflow-hidden border border-primary/40 bg-black">
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="text-center p-6">
            <div className="text-xl mb-2">🎬 Ta vidéo d’explication</div>
            <div className="text-sm">Intègre ici ta vidéo (YouTube, Vimeo, lecteur MP4, etc.).</div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Card title="Gestion de mise (flat stake)">
          Mise fixe (ex: 1–2% de la bankroll) sur chaque pari pour limiter la variance. Simple et robuste.
        </Card>
        <Card title="Value betting">
          Cibler les cotes où la probabilité réelle estimée est supérieure à l’implicite (1/cote).
        </Card>
        <Card title="Kelly (prudent)">
          Utiliser une fraction de Kelly (ex: demi-Kelly) pour dimensionner la mise selon l’edge.
        </Card>
        <Card title="Journal de suivi (discipline)">
          Noter chaque pari, motif, cote, edge estimé, résultat — et analyser régulièrement.
        </Card>
      </div>
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-[#0b0b0b] rounded-xl p-4 border border-[#222]">
      <div className="text-gray-200 font-semibold mb-1">{title}</div>
      <div className="text-gray-400 text-sm">{children}</div>
    </div>
  );
}