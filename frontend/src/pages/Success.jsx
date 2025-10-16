import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";

export default function Success() {
  const [params] = useSearchParams();
  const session_id = params.get("session_id");
  const plan = params.get("plan");
  const navigate = useNavigate();

  const [status, setStatus] = useState("Validation du paiement en cours...");
  const [details, setDetails] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !session_id || !plan) {
      setStatus("Paramètres manquants.");
      setDetails("Retour à la page Abonnements...");
      setTimeout(() => navigate("/abonnements"), 1500);
      return;
    }

    (async () => {
      try {
        const { data } = await axios.post(
          `${API_BASE}/api/stripe/confirm`,
          { session_id, plan },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data?.ok) {
          // met à jour l'utilisateur local (pour que le Dashboard reflète le nouveau rôle)
          localStorage.setItem("user", JSON.stringify(data.user));
          setStatus("✅ Paiement validé !");
          setDetails(
            plan === "monthly"
              ? "Ton abonnement Mensuel est actif."
              : "Ton abonnement Annuel est actif."
          );
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          setStatus("⚠️ Paiement non confirmé.");
          setDetails("Redirection vers Abonnements...");
          setTimeout(() => navigate("/abonnements"), 1500);
        }
      } catch (e) {
        setStatus("❌ Erreur lors de la confirmation.");
        setDetails("Retour à Abonnements...");
        setTimeout(() => navigate("/abonnements"), 1500);
      }
    })();
  }, [session_id, plan, navigate]);

  return (
    <section className="py-24 text-center">
      <h1 className="text-4xl font-extrabold text-primary mb-4">Paiement Stripe</h1>
      <p className="text-lg text-gray-300 mb-2">{status}</p>
      {details && <p className="text-gray-400">{details}</p>}

      <div className="mt-10 max-w-md mx-auto bg-black border border-primary rounded-2xl p-6">
        <p className="text-gray-400">
          Ne ferme pas cette page. Tu vas être redirigé automatiquement vers ton espace.
        </p>
      </div>
    </section>
  );
}
