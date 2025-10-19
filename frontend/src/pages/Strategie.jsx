import { isSubscriptionActive } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { useState } from "react";

/**
 * Page : Stratégies & Apprentissage
 * Accès réservé aux abonnés
 */
export default function Strategie() {
  const active = isSubscriptionActive();
  const [expandedStrategy, setExpandedStrategy] = useState(null);

  if (!active) {
    return (
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-4xl border-2 border-primary/30">
            🔒
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="text-primary">Stratégies & Apprentissage</span>
            <br />
            <span className="text-white">Réservé aux membres</span>
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed mb-8">
            Accède à nos guides exclusifs, stratégies gagnantes et tutoriels vidéo
            pour devenir un parieur rentable sur le long terme.
          </p>
          <Link
            to="/abonnements"
            className="inline-block bg-gradient-to-r from-primary to-yellow-400 text-black px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-2xl hover:shadow-primary/50"
          >
            Voir les abonnements
          </Link>
        </div>
      </section>
    );
  }

  const strategies = [
    {
      id: "flat-stake",
      icon: "📊",
      title: "Flat Stake (Mise fixe)",
      level: "Débutant",
      levelColor: "emerald",
      short: "La stratégie la plus simple et robuste pour débuter",
      description: "Le flat stake consiste à miser un montant fixe ou un pourcentage constant de ta bankroll sur chaque pari, généralement entre 1% et 3%. Cette approche simple limite la variance et protège ton capital sur le long terme.",
      pros: [
        "Très simple à mettre en place",
        "Protection maximale de la bankroll",
        "Idéal pour débuter",
        "Limite les pertes en série",
      ],
      cons: [
        "Croissance plus lente du capital",
        "Ne profite pas des opportunités exceptionnelles",
        "Moins adapté aux parieurs expérimentés",
      ],
      tips: [
        "Commence avec 1-2% de ta bankroll par pari",
        "Réévalue ton pourcentage tous les mois",
        "Ne change jamais ce pourcentage en cours de série",
      ],
    },
    {
      id: "value-betting",
      icon: "💎",
      title: "Value Betting",
      level: "Intermédiaire",
      levelColor: "yellow",
      short: "Identifier et exploiter les cotes sous-évaluées",
      description: "Le value betting consiste à identifier les paris où la probabilité réelle de victoire est supérieure à celle impliquée par la cote du bookmaker. C'est la clé de la rentabilité à long terme.",
      pros: [
        "Stratégie mathématiquement prouvée",
        "Rentable sur le long terme",
        "Base de tous les parieurs professionnels",
        "Compatible avec d'autres stratégies",
      ],
      cons: [
        "Nécessite une bonne analyse",
        "Demande du temps et de l'expérience",
        "Résultats visibles sur le long terme",
        "Risque de se tromper dans l'estimation",
      ],
      tips: [
        "Compare toujours plusieurs bookmakers",
        "Estime ta propre probabilité avant de regarder les cotes",
        "Note tous tes paris pour analyser tes erreurs d'estimation",
      ],
    },
    {
      id: "kelly",
      icon: "🧠",
      title: "Critère de Kelly",
      level: "Avancé",
      levelColor: "red",
      short: "Optimiser mathématiquement la taille de tes mises",
      description: "Le critère de Kelly est une formule mathématique qui calcule le pourcentage optimal de ta bankroll à miser pour maximiser la croissance à long terme. En pratique, on utilise souvent une fraction (demi-Kelly ou quart-Kelly) pour plus de sécurité.",
      pros: [
        "Optimise la croissance de la bankroll",
        "S'adapte automatiquement à la value",
        "Protège contre la ruine",
        "Approche scientifique et prouvée",
      ],
      cons: [
        "Requiert une estimation précise des probabilités",
        "Peut suggérer des mises élevées",
        "Variance importante en Kelly complet",
        "Complexe pour les débutants",
      ],
      tips: [
        "Utilise le demi-Kelly ou quart-Kelly en début",
        "Ne suis jamais Kelly à 100% (trop risqué)",
        "Réévalue ta bankroll avant chaque pari",
        "Utilise notre calculateur dans la section Bankroll",
      ],
    },
    {
      id: "discipline",
      icon: "📝",
      title: "Journal de Suivi",
      level: "Essentiel",
      levelColor: "blue",
      short: "Le secret des parieurs rentables",
      description: "Tenir un journal détaillé de tous tes paris est absolument crucial. Note le sport, les équipes, le type de pari, la cote, ta confiance, le raisonnement, et bien sûr le résultat. L'analyse de ces données te permettra d'identifier tes forces et faiblesses.",
      pros: [
        "Identifie tes erreurs récurrentes",
        "Permet de suivre ton ROI réel",
        "Améliore ta discipline",
        "Révèle tes meilleurs sports/types de paris",
      ],
      cons: [
        "Demande de la rigueur quotidienne",
        "Chronophage au début",
        "Nécessite de l'honnêteté envers soi-même",
      ],
      tips: [
        "Note TOUT, même les petites mises",
        "Sois honnête sur ton raisonnement",
        "Analyse tes stats mensuellement",
        "Utilise un tableur simple ou une app dédiée",
      ],
    },
  ];

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-2 bg-primary/20 border border-primary rounded-full mb-4">
          <span className="text-primary font-semibold text-sm">🎓 Formation exclusive</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
            Stratégies & Apprentissage
          </span>
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
          Découvre les <span className="text-primary font-semibold">méthodes gagnantes</span> des
          parieurs professionnels et apprends à gérer ton capital comme un pro.
        </p>
      </div>

      {/* Video Section */}
      <div className="mb-16">
        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary/30 rounded-3xl overflow-hidden">
          <div className="aspect-video w-full bg-black/50 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Vidéo d'introduction complète
              </h3>
              <p className="text-gray-400 mb-6">
                Intègre ici ta vidéo explicative (YouTube, Vimeo, ou lecteur direct)
              </p>
              <div className="text-sm text-gray-500">
                📹 Format recommandé : MP4 • Durée : 10-15 minutes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span>🎯</span>
          Les 4 piliers du pari rentable
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {strategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isExpanded={expandedStrategy === strategy.id}
              onToggle={() =>
                setExpandedStrategy(
                  expandedStrategy === strategy.id ? null : strategy.id
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span>⚡</span>
          Conseils rapides
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <QuickTip
            icon="🚫"
            title="Ne jamais chasser tes pertes"
            desc="Après une perte, résiste à la tentation d'augmenter tes mises pour te 'refaire'. C'est le meilleur moyen de perdre encore plus."
            color="red"
          />
          <QuickTip
            icon="📈"
            title="Pense long terme"
            desc="Les paris sportifs sont un marathon, pas un sprint. Une série de pertes ne signifie pas que ta stratégie est mauvaise."
            color="blue"
          />
          <QuickTip
            icon="🎲"
            title="Diversifie intelligemment"
            desc="Ne mise pas tout sur un seul sport ou type de pari. Mais évite aussi de te disperser sur des sports que tu ne maîtrises pas."
            color="purple"
          />
        </div>
      </div>

      {/* Resources */}
      <div className="bg-gradient-to-br from-primary/10 via-black to-primary/10 border-2 border-primary/30 rounded-3xl p-10">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span>📚</span>
          Ressources complémentaires
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ResourceCard
            icon="🧮"
            title="Calculateur de Bankroll"
            desc="Utilise notre outil pour calculer ta mise optimale selon Kelly et d'autres méthodes."
            link="/bankroll"
            linkText="Accéder au calculateur"
          />
          <ResourceCard
            icon="⚽"
            title="Nos Pronostics"
            desc="Applique ces stratégies sur nos pronos quotidiens analysés et vérifiés."
            link="/pronostics"
            linkText="Voir les pronos"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center p-8 bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary/30 rounded-3xl">
        <h3 className="text-2xl font-bold text-white mb-4">
          💬 Des questions sur ces stratégies ?
        </h3>
        <p className="text-gray-300 mb-6">
          Notre équipe est là pour t'aider à mettre en place ces méthodes efficacement.
        </p>
        <a
          href="https://wa.me/33695962084"
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-gradient-to-r from-primary to-yellow-400 text-black px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl"
        >
          Contacter le support
        </a>
      </div>
    </section>
  );
}

/* ---------- Composants ---------- */

function StrategyCard({ strategy, isExpanded, onToggle }) {
  const levelColors = {
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    red: "bg-red-500/20 text-red-300 border-red-500/30",
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary/30 rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{strategy.icon}</div>
          <div>
            <h3 className="text-xl font-bold text-white">{strategy.title}</h3>
            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold border ${levelColors[strategy.levelColor]}`}>
              {strategy.level}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-300 mb-4">{strategy.short}</p>

      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-primary/30 rounded-xl hover:bg-primary/10 transition-all font-semibold text-sm"
      >
        {isExpanded ? "Masquer les détails" : "Voir les détails"}
        <span>{isExpanded ? "▲" : "▼"}</span>
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-6 pt-6 border-t border-primary/20">
          <div>
            <h4 className="text-white font-semibold mb-3">📋 Description</h4>
            <p className="text-gray-300 leading-relaxed">{strategy.description}</p>
          </div>

          <div>
            <h4 className="text-emerald-400 font-semibold mb-3">✅ Avantages</h4>
            <ul className="space-y-2">
              {strategy.pros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-emerald-400 mt-1">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-red-400 font-semibold mb-3">⚠️ Inconvénients</h4>
            <ul className="space-y-2">
              {strategy.cons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-red-400 mt-1">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-primary font-semibold mb-3">💡 Conseils pratiques</h4>
            <ul className="space-y-2">
              {strategy.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-primary mt-1">→</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickTip({ icon, title, desc, color }) {
  const colors = {
    red: "from-red-500/20 to-orange-500/20 border-red-500/30",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border-2 rounded-2xl p-6 hover:scale-105 transition-all duration-300`}>
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function ResourceCard({ icon, title, desc, link, linkText }) {
  return (
    <Link
      to={link}
      className="block bg-black/50 border-2 border-primary/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:border-primary/50"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{icon}</div>
        <div className="flex-grow">
          <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
          <p className="text-gray-400 text-sm mb-4">{desc}</p>
          <div className="flex items-center gap-2 text-primary font-semibold">
            {linkText}
            <span>→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
