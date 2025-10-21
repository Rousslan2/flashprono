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
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-pink-400/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-8 animate-float">
            <div className="inline-block w-24 h-24 bg-gradient-to-br from-purple-500/30 to-pink-400/30 rounded-3xl flex items-center justify-center mb-6 text-5xl border-2 border-purple-500/40 shadow-2xl backdrop-blur-sm transform hover:scale-110 transition-all duration-500">
              🔒
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                Stratégies & Apprentissage
              </span>
              <br />
              <span className="text-white drop-shadow-glow">Réservé aux membres</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Accède à nos <span className="text-purple-400 font-semibold">guides exclusifs</span>, stratégies gagnantes
              et tutoriels vidéo pour devenir un parieur rentable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FeaturePreview icon="🎯" title="Stratégies prouvées" desc="Méthodes des pros" delay="0" />
            <FeaturePreview icon="🎬" title="Vidéos exclusives" desc="Tutoriels complets" delay="100" />
            <FeaturePreview icon="📚" title="Guides détaillés" desc="Apprends à ton rythme" delay="200" />
          </div>

          <Link
            to="/abonnements"
            className="inline-block bg-gradient-to-r from-purple-500 via-pink-400 to-purple-500 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-2xl hover:shadow-purple-500/60 animate-gradient-slow"
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
            filter: drop-shadow(0 0 20px rgba(192, 132, 252, 0.3));
          }
        `}</style>
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
    <section className="py-16 px-4 max-w-7xl mx-auto relative overflow-hidden">
      {/* Particules animées */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "0s" }}></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }}></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "6s" }}></div>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-12 relative z-10 animate-fade-in">
        <div className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-400/20 border-2 border-purple-500 rounded-full mb-6 hover:scale-110 transition-all duration-300 cursor-pointer group">
          <span className="text-purple-400 font-semibold text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
            🎯 Formation exclusive
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 perspective-text">
          <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-purple-500 bg-clip-text text-transparent drop-shadow-glow-purple animate-gradient">
            Stratégies & Apprentissage
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
          Découvre les <span className="text-purple-400 font-bold">méthodes gagnantes</span> des
          parieurs professionnels et apprends à gérer ton capital comme un pro.
        </p>
      </div>

      {/* Video Section avec effet 3D */}
      <div className="mb-16 relative z-10 animate-slide-up">
        <div className="bg-gradient-to-br from-black/80 via-gray-900/80 to-purple-900/20 border-2 border-purple-500/30 rounded-3xl overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-500 backdrop-blur-xl">
          <div className="aspect-video w-full bg-black/50 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/3 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="text-center p-8 relative z-10">
              <div className="text-7xl mb-6 animate-bounce-slow">🎬</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Vidéo d'introduction complète
              </h3>
              <p className="text-gray-400 mb-6 text-lg">
                Intègre ici ta vidéo explicative (YouTube, Vimeo, ou lecteur direct)
              </p>
              <div className="text-sm text-gray-500 px-4 py-2 bg-gray-800/50 rounded-lg inline-block">
                📹 Format recommandé : MP4 • Durée : 10-15 minutes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="mb-12 relative z-10">
        <h2 className="text-4xl font-bold text-white mb-8 flex items-center gap-3 animate-slide-up">
          <span className="text-5xl animate-bounce-slow">🎯</span>
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Les 4 piliers du pari rentable</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {strategies.map((strategy, index) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              isExpanded={expandedStrategy === strategy.id}
              onToggle={() =>
                setExpandedStrategy(
                  expandedStrategy === strategy.id ? null : strategy.id
                )
              }
              delay={index * 100}
            />
          ))}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mb-12 relative z-10">
        <h2 className="text-4xl font-bold text-white mb-8 flex items-center gap-3 animate-slide-up">
          <span className="text-5xl">⚡</span>
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Conseils rapides</span>
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
      <div className="bg-gradient-to-br from-purple-500/10 via-black to-pink-500/10 border-2 border-purple-500/30 rounded-3xl p-10 relative z-10 animate-slide-up group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/3 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
        <h2 className="text-4xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
          <span className="text-5xl animate-bounce-slow">📚</span>
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Ressources complémentaires</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6 relative z-10">
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
      <div className="mt-12 text-center p-8 bg-gradient-to-br from-black/80 via-gray-900/80 to-purple-900/20 border-2 border-purple-500/30 rounded-3xl relative z-10 group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/3 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold text-white mb-4">
            💬 Des questions sur ces stratégies ?
          </h3>
          <p className="text-gray-300 mb-6 text-lg">
            Notre équipe est là pour t'aider à mettre en place ces méthodes efficacement.
          </p>
          <a
            href="https://wa.me/33695962084"
            target="_blank"
            rel="noreferrer"
            className="inline-block bg-gradient-to-r from-purple-500 to-pink-400 text-white px-10 py-4 rounded-2xl font-bold hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-purple-500/50"
          >
            📞 Contacter le support
          </a>
        </div>
      </div>

      {/* Styles CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-25px) rotate(3deg); }
          66% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.7s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.7s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s ease-in-out infinite;
        }
        .drop-shadow-glow-purple {
          filter: drop-shadow(0 0 30px rgba(192, 132, 252, 0.6));
        }
        .perspective-text {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
      `}</style>
    </section>
  );
}

/* ---------- Composants ---------- */

function StrategyCard({ strategy, isExpanded, onToggle, delay }) {
  const levelColors = {
    emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    yellow: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    red: "bg-red-500/20 text-red-300 border-red-500/40",
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  };

  return (
    <div 
      className="bg-gradient-to-br from-black/80 via-gray-900/80 to-purple-900/10 border-2 border-purple-500/30 rounded-2xl p-6 hover:scale-[1.03] transition-all duration-500 group backdrop-blur-xl hover:shadow-2xl hover:shadow-purple-500/20 animate-slide-up relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Effet brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{strategy.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">{strategy.title}</h3>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold border ${levelColors[strategy.levelColor]}`}>
                {strategy.level}
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 mb-4 leading-relaxed">{strategy.short}</p>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-500/30 rounded-xl hover:bg-purple-500/10 hover:border-purple-400 transition-all font-semibold text-sm group/btn"
        >
          <span className="group-hover/btn:text-purple-400 transition-colors">
            {isExpanded ? "Masquer les détails" : "Voir les détails"}
          </span>
          <span className="group-hover/btn:scale-125 transition-transform">{isExpanded ? "▲" : "▼"}</span>
        </button>

        {isExpanded && (
          <div className="mt-6 space-y-6 pt-6 border-t border-purple-500/20 animate-slide-up">
            <div>
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>📋</span> Description
              </h4>
              <p className="text-gray-300 leading-relaxed">{strategy.description}</p>
            </div>

            <div>
              <h4 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
                <span>✅</span> Avantages
              </h4>
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
              <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                <span>⚠️</span> Inconvénients
              </h4>
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
              <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                <span>💡</span> Conseils pratiques
              </h4>
              <ul className="space-y-2">
                {strategy.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="text-purple-400 mt-1">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickTip({ icon, title, desc, color }) {
  const colors = {
    red: "from-red-500/20 to-orange-500/20 border-red-500/40 hover:shadow-red-500/50",
    blue: "from-blue-500/20 to-cyan-500/20 border-blue-500/40 hover:shadow-blue-500/50",
    purple: "from-purple-500/20 to-pink-500/20 border-purple-500/40 hover:shadow-purple-500/50",
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colors[color]} border-2 rounded-2xl p-6 hover:scale-110 hover:-rotate-3 transition-all duration-500 cursor-pointer group shadow-xl hover:shadow-2xl`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <div className="relative z-10">
        <div className="text-5xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{icon}</div>
        <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ResourceCard({ icon, title, desc, link, linkText }) {
  return (
    <Link
      to={link}
      className="block bg-black/50 border-2 border-purple-500/30 rounded-2xl p-6 hover:scale-105 hover:border-purple-400 transition-all duration-300 group hover:shadow-xl hover:shadow-purple-500/20"
    >
      <div className="flex items-start gap-4">
        <div className="text-5xl flex-shrink-0 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{icon}</div>
        <div className="flex-grow">
          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-300 transition-colors">{title}</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">{desc}</p>
          <div className="flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-4 transition-all">
            {linkText}
            <span className="group-hover:translate-x-2 transition-transform">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeaturePreview({ icon, title, desc, delay }) {
  return (
    <div 
      className="bg-gradient-to-br from-purple-500/10 to-pink-400/5 border-2 border-purple-500/30 rounded-2xl p-6 text-center transform hover:scale-110 hover:-rotate-2 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/30 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-5xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-white font-bold mb-2 text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
