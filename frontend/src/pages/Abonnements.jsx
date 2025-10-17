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
    { key: "monthly", name: "Mensuel Premium", price: "29,90€ / mois", desc: "Accès complet + alertes WhatsApp" },
    { key: "yearly",  name: "Annuel VIP",      price: "299€ / an",     desc: "Accès complet + zone VIP + bonus exclusifs" },
    { key: "trial",   name: "Essai gratuit 14 jours", price: "0€ / 14 jours", desc: "Accès complet pendant 2 semaines" },
  ];

  // Masquer l’essai si déjà abonné/actif OU essai déjà utilisé
  const plans = (active || user?.trialUsed) ? basePlans.filter(p => p.key !== "trial") : basePlans;

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
      const msg = e?.response?.data?.message || e?.message || "Erreur essai";
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
      const msg = err?.response?.data?.message || err?.message || "Erreur inconnue";
      alert(`Impossible d’ouvrir la page de paiement : ${msg}`);
      console.error(err);
    }
  };

  return (
    <section className="py-20 text-center">
      <h2 className="text-3xl mb-8 text-primary">Nos abonnements</h2>

      {active && (
        <p className="text-green-400 mb-6">
          ✅ Accès actif : <b>{currentPlan === "yearly" ? "Annuel VIP" : currentPlan === "monthly" ? "Mensuel Premium" : "Essai"}</b>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrent = active && plan.key === currentPlan;
          const disabled = isCurrent;
          const isTrial = plan.key === "trial";

          return (
            <div key={plan.key} className={`bg-black p-6 rounded-xl border ${isCurrent ? "border-green-400" : "border-primary"}`}>
              <h3 className="text-xl font-bold mb-2">
                {plan.name} {isCurrent && <span className="text-green-400 text-sm ml-2">• Actif</span>}
              </h3>
              <p className="text-gray-400 mb-4">{plan.desc}</p>
              <p className="text-2xl text-primary mb-6">{plan.price}</p>

              <button
                className={`px-4 py-2 rounded-lg transition w-full ${
                  disabled ? "bg-gray-600 cursor-not-allowed text-white" : "bg-primary text-black hover:scale-105"
                }`}
                onClick={() => !disabled && (isTrial ? handleTrial() : handleSubscribe(plan.key))}
                disabled={disabled}
                title={disabled ? "Plan déjà actif" : "Choisir"}
              >
                {isTrial ? "Activer l’essai 14 jours" : (disabled ? "Plan actif" : "S’abonner")}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
