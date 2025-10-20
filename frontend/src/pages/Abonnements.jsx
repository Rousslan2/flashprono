import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";
import { getUser, isSubscriptionActive } from "../hooks/useAuth";

export default function Abonnements() {
  const navigate = useNavigate();
  const user = getUser();
  const active = isSubscriptionActive();
  const currentPlan = user?.subscription?.plan;

  const basePlans = [
    {
      key: "trial",
      name: "Essai gratuit",
      duration: "7 jours",
      price: "0€",
      desc: "Découvre tout tranquillement",
      icon: "🎁",
      features: [
        "Accès complet pendant 1 semaine",
        "Tous les pronostics quotidiens",
        "Scores live et analyses",
        "Stratégies & Bankroll",
        "Annulable à tout moment",
      ],
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500",
    },
    {
      key: "monthly",
      name: "Mensuel Premium",
      duration: "par mois",
      price: "29,90€",
      desc: "Accès complet + alertes utiles",
      icon: "⚡",
      features: [
        "Pronostics complets du jour + archives",
        "Badge 'Prono en or' 👑 quand la value est forte",
        "Scores live intégrés en temps réel",
        "Accès Stratégies & Bankroll",
        "Alertes importantes (horaires, infos clés)",
      ],
      gradient: "from-primary/20 to-yellow-500/20",
      borderColor: "border-primary",
      popular: true,
    },
    {
      key: "yearly",
      name: "Annuel VIP",
      duration: "par an",
      price: "299€",
      desc: "Accès VIP + bonus exclusifs",
      icon: "👑",
      features: [
        "Tout le Premium pendant 12 mois",
        "Priorité sur les nouveautés",
        "Historique étendu et filtres avancés",
        "Support prioritaire",
        "Économise 2 mois par rapport au mensuel",
      ],
      gradient: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500",
      ribbon: "ÉCONOMISE 2 MOIS",
    },
  ];

  const plans =
    active || user?.trialUsed
      ? basePlans.filter((p) => p.key !== "trial")
      : basePlans;

  const handleTrial = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/register?plan=trial");
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/stripe/trial`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("Essai gratuit activé pour 7 jours ✅");
        navigate("/pronostics");
      } else {
        alert("Impossible d'activer l'essai.");
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message || e?.message || "Erreur essai";
      alert(msg);
    }
  };

  const handleSubscribe = async (planKey) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate(`/register?plan=${planKey}`);

    try {
      if (planKey === "trial") return handleTrial();

      const { data } = await axios.post(
        `${API_BASE}/api/stripe/create-checkout-session`,
        { plan: planKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data?.url) window.location.href = data.url;
      else alert("Pas d'URL Stripe renvoyée par le serveur.");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Erreur inconnue";
      alert(`Impossible d'ouvrir la page de paiement : ${msg}`);
      console.error(err);
    }
  };

  return (
    <section className="py-20 px-4 text-center relative overflow-hidden">
      {/* Particules animées - FIXÉES */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-20 left-5 sm:left-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-5 sm:right-10 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 sm:w-60 md:w-72 h-48 sm:h-60 md:h-72 bg-purple-500 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto mb-16 relative z-10">
        <div className="inline-block px-6 py-3 bg-gradient-to-r from-primary/20 to-yellow-400/20 border-2 border-primary rounded-full mb-6 animate-slide-in-up relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative z-10 text-primary font-bold text-sm flex items-center justify-center gap-2">
            <span className="animate-spin-slow">💎</span>
            Plans & Tarifs
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 animate-slide-in-up delay-100 relative px-4">
          Choisis ton{" "}
          <span className="bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent animate-gradient-x relative inline-block">
            abonnement
            <span className="absolute -top-2 sm:-top-4 -right-3 sm:-right-6 text-2xl sm:text-3xl animate-bounce-slow">✨</span>
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto animate-slide-in-up delay-200 px-4">
          Accède aux <span className="text-primary font-bold">pronos complets</span>, au{" "}
          <span className="text-yellow-400 font-bold">badge "Prono en or"</span>, aux{" "}
          <span className="text-blue-400 font-bold">scores live</span> et à la{" "}
          <span className="text-green-400 font-bold">zone Stratégies & Bankroll</span>.
        </p>

        {active && (
          <div className="mt-8 inline-block animate-slide-in-up delay-300">
            <div className="relative px-6 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              <p className="relative z-10 text-emerald-300 font-bold flex items-center gap-2">
                <span className="animate-pulse">✅</span>
                Ton abonnement actuel :{" "}
                <span className="text-white text-lg">
                  {currentPlan === "yearly"
                    ? "Annuel VIP 👑"
                    : currentPlan === "monthly"
                    ? "Mensuel Premium ⚡"
                    : "Essai gratuit 🎁"}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto mb-16 relative z-10 px-4">
        {plans.map((plan, index) => {
          const isCurrent = active && plan.key === currentPlan;
          const disabled = isCurrent;
          const isTrial = plan.key === "trial";

          return (
            <div
              key={plan.key}
              className={`relative bg-gradient-to-br ${plan.gradient} backdrop-blur-sm border-2 ${
                plan.popular 
                  ? "border-primary shadow-2xl shadow-primary/50 md:scale-105" 
                  : isCurrent 
                  ? "border-emerald-400 shadow-2xl shadow-emerald-400/30" 
                  : `${plan.borderColor} shadow-xl`
              } rounded-3xl p-6 sm:p-8 hover:scale-105 transition-all duration-500 overflow-hidden group animate-slide-in-up ${
                disabled ? "opacity-75" : ""
              } ${plan.popular || isCurrent ? "mt-8 sm:mt-0" : ""}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Halo lumineux */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-yellow-400/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>

              {/* Ribbon */}
              {plan.ribbon && !isCurrent && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg z-20 animate-bounce-slow whitespace-nowrap">
                  ⭐ {plan.ribbon}
                </div>
              )}
              {plan.popular && !isCurrent && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-yellow-400 text-black text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg z-20 animate-pulse whitespace-nowrap">
                  🔥 LE PLUS POPULAIRE
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-black text-xs font-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg z-20 animate-bounce-slow whitespace-nowrap">
                  ✅ PLAN ACTIF
                </div>
              )}

              <div className="relative z-10">
                {/* Icon */}
                <div className="text-7xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{plan.icon}</div>

                {/* Name & Description */}
                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-primary transition-colors">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.desc}</p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-primary to-yellow-400 bg-clip-text drop-shadow-2xl animate-pulse">
                      {plan.price}
                    </span>
                    <span className="text-gray-400 text-lg">/ {plan.duration}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8 text-left">
                  {plan.features?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 group/item hover:translate-x-2 transition-transform">
                      <span className="text-primary text-xl flex-shrink-0 mt-0.5 group-hover/item:scale-125 transition-transform">✓</span>
                      <span className="leading-relaxed group-hover/item:text-white transition-colors">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  className={`relative w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 overflow-hidden ${
                    disabled
                      ? "bg-gray-600 cursor-not-allowed text-white"
                      : plan.popular
                      ? "bg-gradient-to-r from-primary to-yellow-400 text-black hover:scale-110 shadow-xl hover:shadow-primary/50"
                      : "border-2 border-primary text-primary hover:bg-primary hover:text-black"
                  }`}
                  onClick={() =>
                    !disabled &&
                    (isTrial ? handleTrial() : handleSubscribe(plan.key))
                  }
                  disabled={disabled}
                  title={disabled ? "Plan déjà actif" : "Choisir ce plan"}
                >
                  {!disabled && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  )}
                  <span className="relative z-10">
                    {isTrial
                      ? "🎁 Activer l'essai gratuit"
                      : disabled
                      ? "✅ Plan actif"
                      : "Choisir ce plan"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ / Infos supplémentaires */}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="relative bg-gradient-to-br from-primary/10 via-black to-primary/10 border-2 border-primary/30 rounded-3xl p-10 overflow-hidden group animate-slide-in-up">
          {/* Halo animé */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-yellow-400/20 blur-3xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
          
          <h2 className="relative z-10 text-3xl md:text-4xl font-black text-white mb-8 flex items-center justify-center gap-3">
            <span className="text-5xl group-hover:scale-125 transition-transform">💡</span>
            Ce qui est inclus
          </h2>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-6 text-left">
            <InfoItem 
              icon="⚽"
              title="Pronostics quotidiens"
              desc="Sélection analysée et vérifiée chaque jour avec justification détaillée"
            />
            <InfoItem 
              icon="👑"
              title="Pronos en or"
              desc="Badge spécial quand la value est exceptionnelle pour maximiser tes gains"
            />
            <InfoItem 
              icon="📊"
              title="Scores en direct"
              desc="Suivi live des matchs intégré directement dans l'interface"
            />
            <InfoItem 
              icon="🎯"
              title="Stratégies & Bankroll"
              desc="Guides complets et calculateur pour gérer tes mises intelligemment"
            />
            <InfoItem 
              icon="📱"
              title="Alertes importantes"
              desc="Notifications pour les changements d'horaire et infos cruciales"
            />
            <InfoItem 
              icon="🔒"
              title="Sans engagement"
              desc="Pas de renouvellement automatique, tu contrôles tout"
            />
          </div>
        </div>

        {/* Garanties */}
        <div className="mt-10 grid md:grid-cols-3 gap-6 animate-slide-in-up delay-200">
          <GuaranteeCard 
            icon="🛡️"
            title="Paiement sécurisé"
            desc="Transactions protégées par Stripe"
            delay="0"
          />
          <GuaranteeCard 
            icon="⚡"
            title="Accès immédiat"
            desc="Débloque tout dès validation du paiement"
            delay="100"
          />
          <GuaranteeCard 
            icon="💬"
            title="Support réactif"
            desc="Équipe dispo via WhatsApp"
            delay="200"
          />
        </div>

        {/* Note finale */}
        <p className="text-sm text-gray-500 mt-10 leading-relaxed animate-fade-in delay-500">
          💡 Les avantages "scores live" et "Pronos en or" s'affichent directement
          sur la page Pronostics une fois abonné. Les stratégies et le calculateur
          de bankroll sont disponibles dans la section dédiée. Tu peux commencer
          par l'essai gratuit si éligible. Aucun renouvellement automatique :
          tu décides quand prolonger ton abonnement.
        </p>
      </div>
    </section>
  );
}

/* ---------- Composants ---------- */

function InfoItem({ icon, title, desc }) {
  return (
    <div className="group flex items-start gap-4 p-4 bg-black/30 rounded-2xl border border-primary/20 hover:border-primary/40 hover:scale-105 transition-all duration-300 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      <div className="relative z-10 text-3xl flex-shrink-0 group-hover:scale-125 transition-transform">{icon}</div>
      <div className="relative z-10">
        <h3 className="text-white font-bold mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function GuaranteeCard({ icon, title, desc, delay }) {
  return (
    <div 
      className="relative bg-gradient-to-br from-black via-gray-900 to-black border-2 border-gray-700 rounded-2xl p-6 text-center hover:border-primary/40 hover:scale-110 transition-all duration-500 group overflow-hidden animate-slide-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-primary/10 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <div className="text-5xl mb-3 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">{icon}</div>
        <h3 className="text-white font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}
