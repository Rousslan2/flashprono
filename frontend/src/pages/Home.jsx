import { isAuthenticated, getUser } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Home() {
  const isAuth = isAuthenticated();
  const user = getUser();

  return (
    <section className="text-center py-20 px-4 relative overflow-hidden">
      {/* Particules animées d'arrière-plan - FIXÉES */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-60 right-10 md:right-20 w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/3 w-48 sm:w-56 md:w-64 h-48 sm:h-56 md:h-64 bg-blue-500 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Petites particules */}
        <div className="absolute top-40 left-1/4 w-3 h-3 bg-primary rounded-full animate-float"></div>
        <div className="absolute top-60 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-60 left-1/2 w-2 h-2 bg-primary rounded-full animate-float-slow"></div>
        <div className="absolute top-96 right-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-float"></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto mb-16 relative z-10">
        {/* Badge animé */}
        <div className="inline-block mb-6 px-6 py-3 bg-gradient-to-r from-primary/20 to-yellow-400/20 border-2 border-primary rounded-full relative overflow-hidden group animate-slide-in-up">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative z-10 text-primary font-bold flex items-center gap-2">
            <span className="animate-bounce-slow">⚡</span>
            La plateforme de pronos nouvelle génération
          </span>
        </div>
        
        {/* Titre principal MEGA */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-8 leading-tight animate-slide-in-up delay-100">
          <span className="text-white drop-shadow-2xl">Bienvenue sur</span>
          <br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-gradient-x">
              FlashProno
            </span>
            {/* Étoiles décoratives */}
            <span className="absolute -top-3 md:-top-6 -right-4 md:-right-8 text-2xl md:text-4xl animate-spin-slow">⭐</span>
            <span className="absolute -bottom-2 md:-bottom-4 -left-4 md:-left-8 text-2xl md:text-3xl animate-bounce-slow">⚡</span>
            {/* Glow effect */}
            <span className="absolute inset-0 blur-3xl bg-primary/30 -z-10 animate-pulse"></span>
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-slide-in-up delay-200 px-4">
          Des <span className="text-primary font-bold relative inline-block group">
            <span className="relative z-10">pronostics vérifiés</span>
            <span className="absolute inset-0 bg-primary/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </span>, une{" "}
          <span className="text-yellow-400 font-bold relative inline-block group">
            <span className="relative z-10">sélection VIP "Pronos en or"</span>
            <span className="absolute inset-0 bg-yellow-400/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </span>, des{" "}
          <span className="text-blue-400 font-bold">scores live</span> et des{" "}
          <span className="text-green-400 font-bold">stratégies bankroll</span> expliquées pas à pas.
          <br />
          <span className="text-white font-black mt-4 block text-xl sm:text-2xl animate-pulse">
            Joue plus clair, pas au hasard. 🎯
          </span>
        </p>

        {/* CTA principal avec effet */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-in-up delay-300 px-4">
          {isAuth ? (
            <Link
              to="/dashboard"
              className="group relative inline-block w-full sm:w-auto"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-primary to-yellow-400 text-black px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl hover:scale-110 transition-all duration-300 shadow-2xl text-center">
                ✨ Accéder à mon espace
              </div>
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="group relative inline-block w-full sm:w-auto"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-primary to-yellow-400 text-black px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl hover:scale-110 transition-all duration-300 shadow-2xl text-center">
                  🚀 Commencer gratuitement
                </div>
              </Link>
              <Link
                to="/login"
                className="relative px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl border-2 border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300 overflow-hidden group w-full sm:w-auto text-center"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative z-10">Se connecter</span>
              </Link>
            </>
          )}
        </div>

        <p className="text-gray-500 text-sm mt-8 animate-fade-in delay-500">
          ✨ Essai gratuit • Sans engagement • Annulation à tout moment
        </p>
      </div>

      {/* Statistiques impressionnantes */}
      <div className="max-w-6xl mx-auto mt-32 mb-20 relative z-10 px-4">
        <div className="mb-12 animate-slide-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            Des résultats qui parlent d'eux-mêmes
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-transparent to-primary rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-ping"></div>
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-l from-transparent to-primary rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-400 text-lg sm:text-xl">La preuve par les chiffres 📊</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            number="78%"
            label="Taux de réussite"
            sublabel="sur nos pronos en or"
            icon="🏆"
            delay="0"
          />
          <StatCard
            number="2500+"
            label="Pronostics analysés"
            sublabel="années d'expérience"
            icon="⚡"
            delay="100"
          />
          <StatCard
            number="+45%"
            label="ROI moyen"
            sublabel="sur 3 mois"
            icon="💰"
            delay="200"
          />
          <StatCard
            number="100%"
            label="Transparence"
            sublabel="tous nos résultats visibles"
            icon="✅"
            delay="300"
          />
        </div>
      </div>

      {/* Pourquoi FlashProno */}
      <div className="max-w-6xl mx-auto mt-32 mb-20 relative z-10 px-4">
        <div className="mb-12 animate-slide-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            Pourquoi choisir FlashProno ?
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-transparent to-yellow-400 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-l from-transparent to-yellow-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-400 text-lg sm:text-xl">Ce qui nous différencie des autres 💎</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Feature
            icon="🎯"
            title="Précision & Transparence"
            desc="Analyse basée sur les données réelles : forme des équipes, effectifs, cotes value. Chaque résultat est clairement visible (gagné/perdu/en cours)."
            gradient="from-blue-500/20 to-cyan-500/20"
            delay="0"
          />
          <Feature
            icon="⚡"
            title="Rapidité & Temps réel"
            desc="Nouveaux pronos ajoutés quotidiennement. Suivi live des scores pendant les matchs pour les abonnés. Toujours à jour, toujours réactif."
            gradient="from-primary/20 to-yellow-500/20"
            delay="100"
          />
          <Feature
            icon="📚"
            title="Pédagogie & Simplicité"
            desc="Interface intuitive + section dédiée aux stratégies et à la gestion de bankroll. On t'explique le pourquoi du comment."
            gradient="from-purple-500/20 to-pink-500/20"
            delay="200"
          />
        </div>
      </div>

      {/* Ce que tu obtiens */}
      <div className="max-w-6xl mx-auto mt-32 mb-20 relative z-10 px-4">
        <div className="mb-12 animate-slide-in-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4">
            Ce que tu obtiens avec FlashProno
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-transparent to-green-400 rounded-full animate-pulse"></div>
            <div className="h-2 w-2 bg-green-400 rounded-full animate-ping"></div>
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-l from-transparent to-green-400 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-400 text-lg sm:text-xl">Tout pour réussir tes paris sportifs 🎁</p>
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
            delay="0"
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
            delay="100"
          />
        </div>
      </div>

      {/* Témoignages ou Social Proof */}
      <div className="max-w-4xl mx-auto mt-32 mb-20 relative z-10 animate-slide-in-up">
        <div className="relative bg-gradient-to-br from-primary/10 via-transparent to-primary/10 border-2 border-primary/30 rounded-3xl p-10 overflow-hidden group hover:scale-105 transition-all duration-500">
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
          
          <p className="text-2xl text-gray-200 italic mb-6 leading-relaxed relative z-10">
            "FlashProno m'a vraiment aidé à structurer mes paris. Avant je jouais au hasard, 
            maintenant je comprends ce que je fais. Les stratégies bankroll sont top !"
          </p>
          <div className="flex items-center justify-center gap-3 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-yellow-400 rounded-full flex items-center justify-center text-2xl shadow-lg animate-pulse">
              👤
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-lg">Thomas M.</p>
              <p className="text-gray-400 text-sm">Membre depuis 3 mois</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      {!isAuth && (
        <div className="max-w-4xl mx-auto mt-32 mb-12 relative z-10 animate-slide-in-up">
          <div className="relative bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary rounded-3xl p-12 shadow-2xl overflow-hidden group">
            {/* Halo lumineux */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-yellow-400/20 blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                Prêt à transformer tes paris ? 🚀
              </h2>
              <p className="text-gray-300 text-xl mb-8">
                Rejoins FlashProno maintenant et commence ton essai gratuit.
                <br />
                <span className="text-primary font-bold text-2xl">Sans engagement, annule quand tu veux.</span>
              </p>
              <Link
                to="/register"
                className="group/cta relative inline-block"
              >
                <div className="absolute -inset-2 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl blur-lg opacity-75 group-hover/cta:opacity-100 transition duration-1000 group-hover/cta:duration-200 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-primary to-yellow-400 text-black px-14 py-6 rounded-2xl font-black text-2xl hover:scale-110 transition-all duration-300 shadow-2xl">
                  Commencer gratuitement maintenant
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Message personnalisé si connecté */}
      {isAuth && (
        <div className="mt-20 p-8 bg-gradient-to-br from-primary/20 to-yellow-400/20 border-2 border-primary rounded-3xl max-w-md mx-auto relative z-10 animate-slide-in-up hover:scale-105 transition-all duration-300">
          <p className="text-2xl text-gray-200 mb-2">
            Content de te revoir,{" "}
            <span className="text-primary font-black text-3xl">{user?.name}</span> ! 🎉
          </p>
          <p className="text-gray-400 text-lg">Tes pronos t'attendent sur le dashboard</p>
        </div>
      )}
    </section>
  );
}

function Feature({ icon, title, desc, gradient, delay }) {
  return (
    <div 
      className={`relative bg-gradient-to-br ${gradient} backdrop-blur-sm border-2 border-primary/30 rounded-3xl p-8 hover:scale-110 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 group animate-slide-in-up overflow-hidden`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
      
      {/* Icône flottante */}
      <div className="absolute -top-6 left-8 relative">
        <div className="absolute inset-0 blur-xl bg-primary/40 rounded-full animate-pulse"></div>
        <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-yellow-400 rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
          {icon}
        </div>
      </div>
      
      <div className="mt-8 relative z-10">
        <h3 className="text-2xl font-black mb-4 text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-gray-300 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function OfferCard({ icon, title, features, highlight, delay }) {
  return (
    <div 
      className={`relative ${highlight ? 'border-2 border-primary shadow-2xl shadow-primary/30' : 'border-2 border-gray-700'} bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl p-8 hover:scale-105 transition-all duration-500 overflow-hidden group animate-slide-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {highlight && (
        <>
          {/* Halo animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-yellow-400/20 blur-2xl opacity-50 animate-pulse"></div>
          {/* Badge */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-yellow-400 text-black px-6 py-2 rounded-full font-black text-sm shadow-lg z-20 animate-bounce-slow">
            ⭐ POPULAIRE
          </div>
        </>
      )}
      
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="text-6xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{icon}</div>
        <h3 className="text-2xl font-black mb-6 text-white group-hover:text-primary transition-colors">{title}</h3>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-gray-300 group/item hover:translate-x-2 transition-transform">
              <span className="text-primary text-xl flex-shrink-0 group-hover/item:scale-125 transition-transform">✓</span>
              <span className="leading-relaxed group-hover/item:text-white transition-colors">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ number, label, sublabel, icon, delay }) {
  return (
    <div 
      className="relative bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-center hover:scale-105 sm:hover:scale-110 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-primary/50 group overflow-hidden animate-slide-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Halo lumineux */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-yellow-400/20 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
      
      {/* Effet de brillance */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-4 group-hover:scale-110 sm:group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{icon}</div>
        <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-gradient-to-r from-primary to-yellow-400 bg-clip-text mb-2 sm:mb-3 drop-shadow-2xl animate-pulse">
          {number}
        </div>
        <div className="text-white font-black text-sm sm:text-base md:text-xl mb-1 sm:mb-2 group-hover:text-primary transition-colors">{label}</div>
        <div className="text-gray-400 text-xs sm:text-sm">{sublabel}</div>
      </div>
    </div>
  );
}
