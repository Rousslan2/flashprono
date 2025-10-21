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
  const [expandedModule, setExpandedModule] = useState(null);

  // Contenu détaillé des modules
  const modulesContent = {
    "comprendre-bases": {
      sections: [
        {
          title: "Qu'est-ce qu'une cote ?",
          content: "Une cote représente la probabilité qu'un événement se produise selon le bookmaker. Par exemple, une cote de 2.00 signifie que le bookmaker estime qu'il y a 50% de chances que cet événement se réalise. Plus la cote est élevée, moins l'événement est probable selon le bookmaker. Si tu mises 10€ à 2.00 et que tu gagnes, tu reçois 20€ (10€ x 2.00 = 20€, soit 10€ de gain net)."
        },
        {
          title: "Les types de paris essentiels",
          content: "**1X2** : Le pari le plus simple - 1 pour victoire domicile, X pour match nul, 2 pour victoire extérieur. **BTTS (Both Teams To Score)** : Les deux équipes marquent-elles ? Oui ou Non. **Over/Under** : Le nombre total de buts sera-t-il supérieur (Over) ou inférieur (Under) à un seuil (souvent 2.5 buts). **Handicap** : Une équipe part avec un avantage ou désavantage fictif pour équilibrer les cotes."
        },
        {
          title: "Comment fonctionnent les bookmakers",
          content: "Les bookmakers ne sont PAS des philanthropes. Ils gagnent de l'argent grâce à la marge qu'ils intègrent dans leurs cotes. Par exemple, sur un match PSG vs OM, les probabilités réelles pourraient être 50% PSG, 25% Nul, 25% OM. Mais le bookmaker proposera des cotes qui, converties en probabilités, totalisent 105-110% au lieu de 100%. Cette différence, c'est leur marge bénéficiaire garantie."
        },
        {
          title: "La marge du bookmaker expliquée",
          content: "Exemple concret : Match France vs Angleterre. Cotes : France 2.10 | Nul 3.20 | Angleterre 3.80. Convertissons en probabilités : France = 1/2.10 = 47.6% | Nul = 1/3.20 = 31.3% | Angleterre = 1/3.80 = 26.3%. Total = 105.2%. La marge du bookmaker est de 5.2%. Plus cette marge est faible, meilleures sont les cotes pour toi. Compare toujours plusieurs bookmakers pour trouver les meilleures cotes !"
        }
      ]
    },
    "gerer-budget": {
      sections: [
        {
          title: "Définir ta bankroll initiale",
          content: "Ta bankroll est l'argent que tu dédies EXCLUSIVEMENT aux paris sportifs. Règle d'or : ne JAMAIS utiliser l'argent du loyer, des courses ou des factures. C'est de l'argent que tu peux te permettre de perdre sans que ça impacte ta vie. Pour débuter, 100-500€ est raisonnable. Moins de 100€ rend la gestion difficile, plus de 1000€ nécessite déjà de l'expérience. Commence petit, apprends, puis augmente progressivement."
        },
        {
          title: "Règle des 1-3% : VITAL pour survivre",
          content: "C'est LA règle qui sépare les parieurs rentables des autres. Sur chaque pari, mise entre 1% et 3% de ta bankroll totale. Exemple : Bankroll de 500€ → Mise entre 5€ et 15€ par pari. Pourquoi ? Avec une mise de 2%, tu peux perdre 50 paris d'affilée avant de tout perdre (impossible en pratique si tu analyses bien). Avec 20% par pari ? 5 pertes et c'est fini. La variance fait partie du jeu - protège-toi !"
        },
        {
          title: "L'argent du loyer : JAMAIS",
          content: "Cette règle semble évidente mais trop de parieurs la brisent. Les paris sportifs doivent rester un loisir ou une activité secondaire rentable, jamais une nécessité. Si tu te retrouves à parier l'argent de tes besoins essentiels, STOP immédiatement. C'est le début d'une spirale dangereuse. Prends une pause, parles-en à quelqu'un, contacte Joueurs Info Service (09 74 75 13 13). Ta santé mentale et financière passe AVANT tout."
        },
        {
          title: "Tenir un journal : obligatoire",
          content: "Dès ton premier pari, note TOUT dans un tableur : Date | Sport | Match | Type de pari | Cote | Mise | Résultat | Gain/Perte | Raison du pari | Confiance (1-10). Après 50-100 paris, analyse : Quel sport est le plus rentable pour toi ? Quel type de pari ? À quelle cote gagnes-tu le plus ? Tes paris 'haute confiance' sont-ils vraiment meilleurs ? Sans ces données, tu navigues à l'aveugle. Modèle gratuit sur Google Sheets !"
        }
      ]
    },
    "psychologie-parieur": {
      sections: [
        {
          title: "Le biais du joueur : le piège classique",
          content: "'J'ai perdu 5 fois d'affilée, le prochain pari DOIT être gagnant !' FAUX. Chaque pari est indépendant. Une pièce lancée 10 fois donnant 'face' a toujours 50% de chances de donner 'face' au 11ème lancer. Tes paris passés n'influencent PAS les futurs. Ce biais pousse à 'chasser ses pertes' en augmentant les mises après une série perdante. C'est le meilleur moyen de se ruiner. Reste rationnel, suit ton plan, chaque pari est nouveau."
        },
        {
          title: "Gérer ses émotions après une perte",
          content: "Perdre fait mal. C'est normal. Mais ta réaction détermine ton succès futur. Technique du 'circuit breaker' : Après une grosse perte (ou 3 petites d'affilée), PAUSE de 24h minimum. Va courir, regarde un film, sors avec des amis. Ne consulte PAS les cotes. Ton cerveau a besoin de se déconnecter de l'émotion pour revenir à l'analyse rationnelle. Les meilleurs parieurs sont ceux qui gèrent le mieux leurs émotions, pas ceux qui prédisent le mieux."
        },
        {
          title: "Discipline : ton meilleur allié",
          content: "La discipline bat le talent. Tu peux avoir les meilleures analyses du monde, si tu ne suis pas ton plan de mise, tu perdras. Règles d'or : 1) Définis tes règles À L'AVANCE (% de mise, types de paris, sports). 2) RESPECTE-LES quoi qu'il arrive. 3) Réévalue ton plan tous les mois, PAS après chaque pari. 4) Si tu sens que tu perds le contrôle, arrête immédiatement. La discipline se construit avec le temps. Sois patient avec toi-même."
        },
        {
          title: "Savoir prendre une pause",
          content: "Les meilleurs parieurs prennent des pauses régulières. Signes qu'il faut s'arrêter : Tu penses constamment aux paris | Tu paries pour 'compenser' une mauvaise journée | Tu caches tes paris à tes proches | Tu paries sur des sports que tu ne connais pas | Tu dépasses ton budget prévu. Solution : Pause de 1 semaine minimum. Désactive les notifications, supprime temporairement les apps de bookmakers. Utilise cet argent pour autre chose. Tu reviendras plus fort et plus lucide."
        }
      ]
    }
    // ... Ajoute les autres modules ici
  };

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
          <div className="aspect-video w-full bg-black relative overflow-hidden">
            {/* Particules lumineuses violettes */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
              <div className="absolute top-10 left-20 w-1 h-10 bg-gradient-to-b from-purple-400 to-transparent animate-spark-1"></div>
              <div className="absolute bottom-20 right-24 w-1 h-10 bg-gradient-to-b from-pink-400 to-transparent animate-spark-2"></div>
              <div className="absolute top-1/2 left-1/3 w-1 h-8 bg-gradient-to-b from-purple-300 to-transparent animate-spark-3"></div>
            </div>
            <iframe
              className="w-full h-full relative z-0"
              src="https://www.youtube.com/embed/zld-R-Yullc"
              title="Formation FlashProno - Stratégies de Paris Sportifs"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
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

      {/* Section Apprentissage */}
      <div className="mb-12 relative z-10">
        <h2 className="text-4xl font-bold text-white mb-8 flex items-center gap-3 animate-slide-up">
          <span className="text-5xl">🎓</span>
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Parcours d'apprentissage</span>
        </h2>
        
        {/* Niveau Débutant */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-bold border border-emerald-500/40">
              🌱 NIVEAU 1 : DÉBUTANT
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <LearningModule
              id="comprendre-bases"
              icon="📚"
              title="Comprendre les bases"
              duration="15 min"
              topics={[
                "Qu'est-ce qu'une cote et comment la lire",
                "Les différents types de paris (1X2, BTTS, Over/Under)",
                "Comment fonctionnent les bookmakers",
                "La marge du bookmaker expliquée simplement"
              ]}
              content={modulesContent["comprendre-bases"]}
              isExpanded={expandedModule === "comprendre-bases"}
              onToggle={() => setExpandedModule(expandedModule === "comprendre-bases" ? null : "comprendre-bases")}
            />
            <LearningModule
              id="gerer-budget"
              icon="💰"
              title="Gérer ton budget"
              duration="20 min"
              topics={[
                "Définir ta bankroll initiale",
                "Règle des 1-3% : pourquoi c'est crucial",
                "Ne jamais parier l'argent du loyer",
                "Tenir un journal de tes paris dès le début"
              ]}
              content={modulesContent["gerer-budget"]}
              isExpanded={expandedModule === "gerer-budget"}
              onToggle={() => setExpandedModule(expandedModule === "gerer-budget" ? null : "gerer-budget")}
            />
            <LearningModule
              id="psychologie-parieur"
              icon="🧠"
              title="Psychologie du parieur"
              duration="25 min"
              topics={[
                "Reconnaître le biais du joueur",
                "Gérer ses émotions après une perte",
                "L'importance de la discipline",
                "Savoir prendre une pause quand nécessaire"
              ]}
              content={modulesContent["psychologie-parieur"]}
              isExpanded={expandedModule === "psychologie-parieur"}
              onToggle={() => setExpandedModule(expandedModule === "psychologie-parieur" ? null : "psychologie-parieur")}
            />
            <LearningModule
              icon="⚽"
              title="Choisir son sport"
              duration="15 min"
              topics={[
                "Se spécialiser vs diversifier : le bon équilibre",
                "Sports les plus rentables pour débuter",
                "Importance de connaître le sport sur lequel tu paries",
                "Où trouver des statistiques fiables"
              ]}
            />
          </div>
        </div>

        {/* Niveau Intermédiaire */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-full text-sm font-bold border border-yellow-500/40">
              💡 NIVEAU 2 : INTERMÉDIAIRE
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <LearningModule
              icon="🔍"
              title="Analyse avancée"
              duration="30 min"
              topics={[
                "Comment analyser les statistiques efficacement",
                "Form home vs away : comprendre les tendances",
                "L'impact des absences et blessures",
                "Lire entre les lignes des actualités"
              ]}
            />
            <LearningModule
              icon="📊"
              title="Value Betting avancé"
              duration="40 min"
              topics={[
                "Calculer la probabilité réelle d'un événement",
                "Identifier les cotes sous-évaluées",
                "Comparaison de cotes entre bookmakers",
                "Arbitrage : opportunités et limites"
              ]}
            />
            <LearningModule
              icon="🧮"
              title="Stratégies de mise"
              duration="35 min"
              topics={[
                "Kelly Criterion : théorie et pratique",
                "Demi-Kelly vs Quart-Kelly",
                "Staking plans : progressifs vs fixes",
                "Quand augmenter ou réduire ses mises"
              ]}
            />
            <LearningModule
              icon="⏱️"
              title="Timing des paris"
              duration="25 min"
              topics={[
                "Parier tôt vs parier tard : avantages/inconvénients",
                "Suivre les mouvements de cotes",
                "Paris live : opportunités en temps réel",
                "Cash-out : quand l'utiliser (ou pas)"
              ]}
            />
          </div>
        </div>

        {/* Niveau Expert */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-2 bg-red-500/20 text-red-300 rounded-full text-sm font-bold border border-red-500/40">
              🏆 NIVEAU 3 : EXPERT
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <LearningModule
              icon="🤖"
              title="Modèles prédictifs"
              duration="60 min"
              topics={[
                "Introduction aux modèles statistiques",
                "Régression de Poisson pour prédire les scores",
                "ELO rating appliqué au sport",
                "Machine Learning : bases pour les paris"
              ]}
            />
            <LearningModule
              icon="💹"
              title="Optimisation de portefeuille"
              duration="45 min"
              topics={[
                "Diversification intelligente de tes paris",
                "Corrélation entre paris : piège à éviter",
                "Construction d'un portefeuille équilibré",
                "Ratios risque/rendement optimaux"
              ]}
            />
            <LearningModule
              icon="🔧"
              title="Outils pro"
              duration="50 min"
              topics={[
                "Scrapers de cotes : automatisation",
                "Bases de données : organiser tes analyses",
                "Excel avancé pour le tracking",
                "APIs sportives : exploiter les données"
              ]}
            />
            <LearningModule
              icon="⚖️"
              title="Aspects légaux & fiscaux"
              duration="30 min"
              topics={[
                "Réglementation des paris en France",
                "Déclaration des gains : ce qu'il faut savoir",
                "Limites et exclusions par les bookmakers",
                "Se protéger : bonnes pratiques"
              ]}
            />
          </div>
        </div>
      </div>

      {/* Erreurs courantes à éviter */}
      <div className="mb-12 relative z-10">
        <h2 className="text-4xl font-bold text-white mb-8 flex items-center gap-3 animate-slide-up">
          <span className="text-5xl">⚠️</span>
          <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Erreurs courantes à éviter</span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ErrorCard
            icon="💔"
            title="Chasser ses pertes"
            desc="Augmenter ses mises après une perte pour 'se refaire' est la voie royale vers la ruine. Garde ton plan de mise quoi qu'il arrive."
            severity="critique"
          />
          <ErrorCard
            icon="🎰"
            title="Parier sur son équipe favorite"
            desc="L'émotionnel brouille le jugement. Les meilleurs parieurs sont objectifs et parient sur la value, pas sur le cœur."
            severity="élevé"
          />
          <ErrorCard
            icon="📉"
            title="Négliger la gestion de bankroll"
            desc="Parier 20% de ton capital sur un seul match, même 'sûr', peut te ruiner en quelques paris maléchanceux."
            severity="critique"
          />
          <ErrorCard
            icon="🎯"
            title="Se disperser sur trop de sports"
            desc="Mieux vaut maîtriser 1-2 sports que d'être médiocre sur 10. La spécialisation est la clé de la rentabilité."
            severity="moyen"
          />
          <ErrorCard
            icon="🕒"
            title="Parier sans analyse"
            desc="Se fier à son 'intuition' ou à des tips aléatoires sans vérifier est un pari sur la chance, pas sur la compétence."
            severity="élevé"
          />
          <ErrorCard
            icon="💸"
            title="Ignorer la valeur des cotes"
            desc="Une cote de 1.50 peut être excellente, une de 3.00 peut être mauvaise. Seule la value compte, pas la cote brute."
            severity="moyen"
          />
        </div>
      </div>

      {/* Resources */}
      <div className="bg-gradient-to-br from-purple-500/10 via-black to-pink-500/10 border-2 border-purple-500/30 rounded-3xl p-10 relative z-10 animate-slide-up group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 overflow-hidden">
        {/* Particules lumineuses */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute top-8 left-12 w-1 h-6 bg-gradient-to-b from-purple-400 to-transparent animate-spark-1"></div>
          <div className="absolute bottom-10 right-16 w-1 h-6 bg-gradient-to-b from-pink-400 to-transparent animate-spark-2"></div>
        </div>
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
      <div className="mt-12 text-center p-8 bg-gradient-to-br from-black/80 via-gray-900/80 to-purple-900/20 border-2 border-purple-500/30 rounded-3xl relative z-10 group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 backdrop-blur-xl overflow-hidden">
        {/* Étoiles scintillantes */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute top-6 left-10 w-1 h-1 bg-purple-300 rounded-full animate-twinkle-1"></div>
          <div className="absolute bottom-8 right-12 w-1 h-1 bg-pink-300 rounded-full animate-twinkle-2"></div>
          <div className="absolute top-10 right-20 w-1 h-1 bg-purple-400 rounded-full animate-twinkle-3"></div>
        </div>
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
        @keyframes spark-1 {
          0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
          50% { opacity: 1; transform: translateY(20px) scale(1.2); }
        }
        @keyframes spark-2 {
          0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
          50% { opacity: 1; transform: translateY(-20px) scale(1.2); }
        }
        @keyframes spark-3 {
          0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
          50% { opacity: 1; transform: translateY(15px) scale(1.1); }
        }
        @keyframes twinkle-1 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes twinkle-2 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(2); }
        }
        @keyframes twinkle-3 {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.8); }
        }
        @keyframes blink-1 {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes blink-2 {
          0%, 100% { opacity: 0; }
          25%, 75% { opacity: 1; }
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
        .animate-spark-1 {
          animation: spark-1 1.5s ease-in-out infinite;
        }
        .animate-spark-2 {
          animation: spark-2 1.8s ease-in-out infinite 0.3s;
        }
        .animate-spark-3 {
          animation: spark-3 2s ease-in-out infinite 0.6s;
        }
        .animate-twinkle-1 {
          animation: twinkle-1 1s ease-in-out infinite;
        }
        .animate-twinkle-2 {
          animation: twinkle-2 1.2s ease-in-out infinite 0.3s;
        }
        .animate-twinkle-3 {
          animation: twinkle-3 1.4s ease-in-out infinite 0.6s;
        }
        .animate-blink-1 {
          animation: blink-1 1s ease-in-out infinite;
        }
        .animate-blink-2 {
          animation: blink-2 1.5s ease-in-out infinite 0.5s;
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
      {/* Étoiles scintillantes */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-4 right-6 w-1 h-1 bg-purple-300 rounded-full animate-twinkle-1"></div>
        <div className="absolute bottom-8 left-8 w-1 h-1 bg-pink-300 rounded-full animate-twinkle-2"></div>
        <div className="absolute top-1/2 right-10 w-1 h-1 bg-purple-400 rounded-full animate-twinkle-3"></div>
      </div>
      
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
      {/* Points lumineux clignotants */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-4 left-6 w-1.5 h-1.5 bg-white rounded-full animate-blink-1"></div>
        <div className="absolute bottom-6 right-8 w-1.5 h-1.5 bg-white rounded-full animate-blink-2"></div>
      </div>
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

function LearningModule({ id, icon, title, duration, topics, content, isExpanded, onToggle }) {
  return (
    <div className="group bg-gradient-to-br from-black/80 via-gray-900/80 to-blue-900/10 border-2 border-blue-500/30 rounded-2xl p-6 hover:scale-105 hover:border-blue-400 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{icon}</div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">{title}</h3>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <span>⏱️</span> {duration}
            </span>
          </div>
        </div>
      </div>
      <ul className="space-y-2 mb-4">
        {topics.map((topic, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
            <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
            <span>{topic}</span>
          </li>
        ))}
      </ul>
      
      {content && (
        <>
          <div className="mt-4 pt-4 border-t border-blue-500/20">
            <button 
              onClick={onToggle}
              className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold flex items-center justify-center gap-2"
            >
              {isExpanded ? "👁️ Masquer le contenu" : "📖 Lire le cours complet"}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-6 space-y-6 animate-slide-up">
              {content.sections.map((section, i) => (
                <div key={i} className="bg-black/40 border border-blue-500/20 rounded-xl p-5">
                  <h4 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    {section.title}
                  </h4>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
              
              <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-2 border-emerald-500/30 rounded-xl p-5 text-center">
                <div className="text-4xl mb-3">🎓</div>
                <h4 className="text-xl font-bold text-white mb-2">Module terminé !</h4>
                <p className="text-gray-300 text-sm">Applique ces concepts dans tes prochains paris et reviens régulièrement pour consolider.</p>
              </div>
            </div>
          )}
        </>
      )}
      
      {!content && (
        <div className="mt-4 pt-4 border-t border-blue-500/20">
          <button className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold">
            🔒 Contenu bientôt disponible
          </button>
        </div>
      )}
    </div>
  );
}

function ErrorCard({ icon, title, desc, severity }) {
  const severityColors = {
    critique: "from-red-500/20 to-orange-500/20 border-red-500/40 text-red-300",
    "élevé": "from-orange-500/20 to-yellow-500/20 border-orange-500/40 text-orange-300",
    moyen: "from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-300",
  };

  const severityLabels = {
    critique: "🔴 CRITIQUE",
    "élevé": "🟠 ÉLEVÉ",
    moyen: "🟡 MOYEN",
  };

  return (
    <div className={`group bg-gradient-to-br ${severityColors[severity]} border-2 rounded-2xl p-6 hover:scale-105 transition-all duration-500 hover:shadow-2xl cursor-pointer`}>
      <div className="flex items-start gap-4">
        <div className="text-4xl group-hover:scale-125 transition-transform duration-500">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${severityColors[severity]}`}>
              {severityLabels[severity]}
            </span>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
