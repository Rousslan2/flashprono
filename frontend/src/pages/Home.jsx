import { isAuthenticated, getUser } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Home() {
  const isAuth = isAuthenticated();
  const user = getUser();

  return (
    <section className="text-center py-20 px-4">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border border-primary rounded-full">
          <span className="text-primary font-semibold">⚡ La plateforme de pronos nouvelle génération</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight">
          Bienvenue sur{" "}
          <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-pulse">
            FlashProno
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
          Des <span className="text-primary font-semibold">pronostics vérifiés</span>, une{" "}
          <span className="text-primary font-semibold">sélection VIP "Pronos en or"</span>, des{" "}
          <span className="text-primary font-semibold">scores live</span> et des{" "}
          <span className="text-primary font-semibold">stratégies bankroll</span> expliquées pas à pas.
          <br />
          <span className="text-white font-bold mt-2 block">
            Joue plus clair, pas au hasard. 🎯
          </span>
        </p>

        {/* CTA principal avec effet */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isAuth ? (
            <Link
              to="/dashboard"
              className="group relative bg-gradient-to-r from-primary to-yellow-400 text-black px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary/50"
            >
              <span className="relative z-10">Accéder à mon espace</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity"></div>
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="group relative bg-gradient-to-r from-primary to-yellow-400 text-black px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary/50"
              >
                <span className="relative z-10">🚀 Commencer gratuitement</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity"></div>
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 rounded-2xl font-semibold text-lg border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300"
              >
                Se connecter
              </Link>
            </>
          )}
        </div>

        <p className="text-gray-500 text-sm mt-6">
          ✨ Essai gratuit • Sans engagement • Annulation à tout moment
        </p>
      </div>

      {/* Statistiques impressionnantes */}
      <div className="max-w-6xl mx-auto mt-20 mb-20">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-3">
            Des résultats qui parlent d'eux-mêmes
          </h2>
          <p className="text-gray-400 text-lg">La preuve par les chiffres 📊</p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            number="78%"
            label="Taux de réussite"
            sublabel="sur nos pronos en or"
            icon="🏆"
          />
          <StatCard
            number="2500+"
            label="Pronostics analysés"
            sublabel="années d'expérience"
            icon="⚡"
          />
          <StatCard
            number="+45%"
            label="ROI moyen"
            sublabel="sur 3 mois"
            icon="💰"
          />
          <StatCard
            number="100%"
            label="Transparence"
            sublabel="tous nos résultats visibles"
            icon="✅"
          />
        </div>
      </div>

      {/* Pourquoi FlashProno */}
      <div className="max-w-6xl mx-auto mt-24 mb-20">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-3">
            Pourquoi choisir FlashProno ?
          </h2>
          <p className="text-gray-400 text-lg">Ce qui nous différencie des autres 💎</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Feature
            icon="🎯"
            title="Précision & Transparence"
            desc="Analyse basée sur les données réelles : forme des équipes, effectifs, cotes value. Chaque résultat est clairement visible (gagné/perdu/en cours)."
            gradient="from-blue-500/20 to-cyan-500/20"
          />
          <Feature
            icon="⚡"
            title="Rapidité & Temps réel"
            desc="Nouveaux pronos ajoutés quotidiennement. Suivi live des scores pendant les matchs pour les abonnés. Toujours à jour, toujours réactif."
            gradient="from-primary/20 to-yellow-500/20"
          />
          <Feature
            icon="📚"
            title="Pédagogie & Simplicité"
            desc="Interface intuitive + section dédiée aux stratégies et à la gestion de bankroll. On t'explique le pourquoi du comment."
            gradient="from-purple-500/20 to-pink-500/20"
          />
        </div>
      </div>

      {/* Ce que tu obtiens */}
      <div className="max-w-6xl mx-auto mt-24 mb-20">
        <div className="mb-12">
          <h2 className="text-4xl font-extrabold text-white mb-3">
            Ce que tu obtiens avec FlashProno
          </h2>
          <p className="text-gray-400 text-lg">Tout pour réussir tes paris sportifs 🎁</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <OfferCard 
            icon="👑"
            title="Accès Premium (Mensuel)"
            features={[
              "Accès illimité aux pronostics quotidiens + archives complètes",
              "Les fameux 'Pronos en or' 🏆 avec value exceptionnelle",
              "Alertes en temps réel (changements d'horaire, infos cruciales)",
              "Scores en direct intégrés dans l'interface",
              "Analyses détaillées de chaque prono",
            ]}
            highlight={true}
          />
          <OfferCard 
            icon="💡"
            title="Espace Stratégies & Bankroll"
            features={[
              "Guides pratiques courts et applicables immédiatement",
              "Calculateur de bankroll intelligent pour gérer tes mises",
              "Conseils personnalisés selon ton profil de risque",
              "Tutoriels vidéo pour progresser rapidement",
              "Évite les erreurs classiques des parieurs débutants",
            ]}
          />
        </div>
      </div>

      {/* Témoignages ou Social Proof */}
      <div className="max-w-4xl mx-auto mt-24 mb-20">
        <div className="bg-gradient-to-br from-primary/10 via-transparent to-primary/10 border-2 border-primary/30 rounded-3xl p-10">
          <p className="text-2xl text-gray-200 italic mb-6 leading-relaxed">
            "FlashProno m'a vraiment aidé à structurer mes paris. Avant je jouais au hasard, 
            maintenant je comprends ce que je fais. Les stratégies bankroll sont top !"
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Thomas M.</p>
              <p className="text-gray-400 text-sm">Membre depuis 3 mois</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      {!isAuth && (
        <div className="max-w-4xl mx-auto mt-24 mb-12">
          <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary rounded-3xl p-12 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Prêt à transformer tes paris ? 🚀
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Rejoins FlashProno maintenant et commence ton essai gratuit.
              <br />
              <span className="text-primary font-semibold">Sans engagement, annule quand tu veux.</span>
            </p>
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-primary to-yellow-400 text-black px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary/50"
            >
              Commencer gratuitement maintenant
            </Link>
          </div>
        </div>
      )}

      {/* Message personnalisé si connecté */}
      {isAuth && (
        <div className="mt-16 p-6 bg-primary/10 border border-primary rounded-2xl max-w-md mx-auto">
          <p className="text-lg text-gray-200">
            Content de te revoir,{" "}
            <span className="text-primary font-bold text-xl">{user?.name}</span> ! 🎉
          </p>
          <p className="text-gray-400 mt-2">Tes pronos t'attendent sur le dashboard</p>
        </div>
      )}
    </section>
  );
}

function Feature({ icon, title, desc, gradient }) {
  return (
    <div className={`relative bg-gradient-to-br ${gradient} backdrop-blur-sm border-2 border-primary/30 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 group`}>
      <div className="absolute -top-6 left-8 w-14 h-14 bg-gradient-to-br from-primary to-yellow-400 rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="mt-6">
        <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function OfferCard({ icon, title, features, highlight }) {
  return (
    <div className={`relative ${highlight ? 'border-2 border-primary shadow-xl shadow-primary/20' : 'border-2 border-gray-700'} bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl p-8 hover:scale-105 transition-all duration-300`}>
      {highlight && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-black px-6 py-2 rounded-full font-bold text-sm shadow-lg">
          ⭐ POPULAIRE
        </div>
      )}
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold mb-6 text-white">{title}</h3>
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-gray-300">
            <span className="text-primary text-xl flex-shrink-0">✓</span>
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({ number, label, sublabel, icon }) {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary rounded-3xl p-8 text-center hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-primary/40 group">
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-5xl font-extrabold text-transparent bg-gradient-to-r from-primary to-yellow-400 bg-clip-text mb-3 drop-shadow-lg">
        {number}
      </div>
      <div className="text-white font-bold text-xl mb-2">{label}</div>
      <div className="text-gray-400">{sublabel}</div>
    </div>
  );
}
