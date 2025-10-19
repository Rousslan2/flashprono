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
      ribbon: "ÉCONOMISE 2 MOIS",
    },
  ];

  // Masquer l'essai si abonnement actif OU essai déjà utilisé
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
    <section className="py-20 px-4 text-center">
      {/* Hero Header */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="inline-block px-4 py-2 bg-primary/20 border border-primary rounded-full mb-4">
          <span className="text-primary font-semibold text-sm">💎 Plans & Tarifs</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          Choisis ton{" "}
          <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
            abonnement
          </span>
        </h1>
        
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
          Accède aux <span className="text-primary font-semibold">pronos complets</span>, au{" "}
          <span className="text-primary font-semibold">badge "Prono en or"</span>, aux{" "}
          <span className="text-primary font-semibold">scores live</span> et à la{" "}
          <span className="text-primary font-semibold">zone Stratégies & Bankroll</span>.
        </p>

        {active && (
          <div className="mt-8 inline-block px-6 py-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl">
            <p className="text-emerald-300 font-semibold flex items-center gap-2">
              <span>✅</span>
              Ton abonnement actuel :{" "}
              <span className="text-white">
                {currentPlan === "yearly"
                  ? "Annuel VIP"
                  : currentPlan === "monthly"
                  ? "Mensuel Premium"
                  : "Essai gratuit"}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
        {plans.map((plan) => {
          const isCurrent = active && plan.key === currentPlan;
          const disabled = isCurrent;
          const isTrial = plan.key === "trial";

          return (
            <div
              key={plan.key}
              className={`relative bg-gradient-to-br ${plan.gradient} backdrop-blur-sm border-2 ${
                plan.popular 
                  ? "border-primary shadow-2xl shadow-primary/30 scale-105" 
                  : isCurrent 
                  ? "border-emerald-400 shadow-xl shadow-emerald-400/20" 
                  : "border-gray-700"
              } rounded-3xl p-8 hover:scale-105 transition-all duration-300 ${
                disabled ? "opacity-75" : ""
              }`}
            >
              {/* Ribbon */}
              {plan.ribbon && !isCurrent && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-yellow-400 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  ⭐ {plan.ribbon}
                </div>
              )}
              {plan.popular && !isCurrent && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                  🔥 LE PLUS POPULAIRE
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                  ✅ PLAN ACTIF
                </div>
              )}

              {/* Icon */}
              <div className="text-6xl mb-4">{plan.icon}</div>

              {/* Name & Description */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6">{plan.desc}</p>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-extrabold text-transparent bg-gradient-to-r from-primary to-yellow-400 bg-clip-text">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 text-lg">/ {plan.duration}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8 text-left">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="text-primary text-xl flex-shrink-0 mt-0.5">✓</span>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                  disabled
                    ? "bg-gray-600 cursor-not-allowed text-white"
                    : plan.popular
                    ? "bg-gradient-to-r from-primary to-yellow-400 text-black hover:scale-105 shadow-xl hover:shadow-primary/50"
                    : "border-2 border-primary text-primary hover:bg-primary hover:text-black"
                }`}
                onClick={() =>
                  !disabled &&
                  (isTrial ? handleTrial() : handleSubscribe(plan.key))
                }
                disabled={disabled}
                title={disabled ? "Plan déjà actif" : "Choisir ce plan"}
              >
                {isTrial
                  ? "🎁 Activer l'essai gratuit"
                  : disabled
                  ? "✅ Plan actif"
                  : "Choisir ce plan"}
              </button>
            </div>
          );
        })}
      </div>

      {/* FAQ / Infos supplémentaires */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-primary/10 via-black to-primary/10 border-2 border-primary/30 rounded-3xl p-10">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center justify-center gap-3">
            <span>💡</span>
            Ce qui est inclus
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
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
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <GuaranteeCard 
            icon="🛡️"
            title="Paiement sécurisé"
            desc="Transactions protégées par Stripe"
          />
          <GuaranteeCard 
            icon="⚡"
            title="Accès immédiat"
            desc="Débloque tout dès validation du paiement"
          />
          <GuaranteeCard 
            icon="💬"
            title="Support réactif"
            desc="Équipe dispo via WhatsApp"
          />
        </div>

        {/* Note finale */}
        <p className="text-sm text-gray-500 mt-10 leading-relaxed">
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
    <div className="flex items-start gap-4 p-4 bg-black/30 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h3 className="text-white font-bold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function GuaranteeCard({ icon, title, desc }) {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-gray-700 rounded-2xl p-6 text-center hover:border-primary/40 transition-all">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-white font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
