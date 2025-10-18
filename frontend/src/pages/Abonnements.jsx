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
      key: "monthly",
      name: "Mensuel Premium",
      price: "29,90€ / mois",
      desc: "Accès complet + alertes utiles",
      features: [
        "Pronostics complets du jour",
        "Badge “Prono en or” quand la value est forte",
        "Scores live intégrés",
        "Accès Stratégies & Bankroll",
      ],
      ribbon: "Le plus populaire",
    },
    {
      key: "yearly",
      name: "Annuel VIP",
      price: "299€ / an",
      desc: "Accès VIP + bonus exclusifs",
      features: [
        "Tout le Premium pendant 12 mois",
        "Priorité sur les nouveautés",
        "Historique étendu et filtres à venir",
        "Meilleur prix sur l’année",
      ],
      ribbon: "Économise 2 mois",
    },
    {
      key: "trial",
      name: "Essai gratuit 14 jours",
      price: "0€ / 14 jours",
      desc: "Découvre tout tranquillement",
      features: [
        "Accès complet pendant 2 semaines",
        "Annulable à tout moment",
        "Sans CB si le backend l’autorise",
      ],
    },
  ];

  // Masquer l’essai si abonnement actif OU essai déjà utilisé
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
        alert("Essai gratuit activé pour 14 jours ✅");
        navigate("/pronostics");
      } else {
        alert("Impossible d’activer l’essai.");
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
      else alert("Pas d’URL Stripe renvoyée par le serveur.");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Erreur inconnue";
      alert(`Impossible d’ouvrir la page de paiement : ${msg}`);
      console.error(err);
    }
  };

  return (
    <section className="py-20 text-center">
      <h2 className="text-3xl mb-3 text-primary">Nos abonnements</h2>
      <p className="text-gray-400 mb-10">
        Accède aux <b className="text-white">pronos complets</b>, au{" "}
        <b className="text-white">badge “Prono en or”</b>, aux{" "}
        <b className="text-white">scores live</b> et à la{" "}
        <b className="text-white">zone Stratégies & Bankroll</b>.
      </p>

      {active && (
        <p className="text-green-400 mb-6">
          ✅ Accès actif :
          {" "}
          <b>
            {currentPlan === "yearly"
              ? "Annuel VIP"
              : currentPlan === "monthly"
              ? "Mensuel Premium"
              : "Essai"}
          </b>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = active && plan.key === currentPlan;
          const disabled = isCurrent;
          const isTrial = plan.key === "trial";

          return (
            <div
              key={plan.key}
              className={`relative bg-black p-6 rounded-2xl border ${
                isCurrent ? "border-green-400" : "border-primary"
              } shadow-md`}
            >
              {plan.ribbon && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                  {plan.ribbon}
                </div>
              )}

              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-gray-400">{plan.desc}</p>
              <p className="text-2xl text-primary my-5">{plan.price}</p>

              <ul className="text-left text-gray-300 space-y-2 mb-6">
                {plan.features?.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 text-emerald-400">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`px-4 py-2 rounded-lg transition w-full ${
                  disabled
                    ? "bg-gray-600 cursor-not-allowed text-white"
                    : "bg-primary text-black hover:scale-105"
                }`}
                onClick={() =>
                  !disabled &&
                  (isTrial ? handleTrial() : handleSubscribe(plan.key))
                }
                disabled={disabled}
                title={disabled ? "Plan déjà actif" : "Choisir"}
              >
                {isTrial
                  ? "Activer l’essai 14 jours"
                  : disabled
                  ? "Plan actif"
                  : "S’abonner"}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-8 max-w-4xl mx-auto">
        Les avantages “scores live” et “Pronos en or” s’affichent directement
        sur la page Pronostics une fois abonné. Les stratégies et le calculateur
        de bankroll sont disponibles dans la section dédiée. Tu peux commencer
        par l’essai gratuit si éligible.
      </p>
    </section>
  );
}
