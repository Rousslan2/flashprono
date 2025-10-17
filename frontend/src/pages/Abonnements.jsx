import React from "react";
import { useCheckout } from "../hooks/useCheckout";

const plans = [
  { id: "trial-14d", title: "Essai 14 jours", price: "0€", desc: "Accès complet pendant 14 jours.", type: "trial" },
  { id: "monthly", title: "Mensuel", price: "29€", desc: "Renouvelé chaque mois.", type: "monthly" },
  { id: "annual", title: "Annuel", price: "299€", desc: "Engagement 12 mois.", type: "annual" },
];

export default function Abonnements() {
  const { startCheckout, loading } = useCheckout();

  return (
    <section className="container-mobile py-8 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-center mb-6">Choisis ton abonnement</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {plans.map((p) => (
          <div key={p.id} className="card p-5 flex flex-col">
            <div className="flex-1">
              <h3 className="text-xl font-bold">{p.title}</h3>
              <div className="mt-1 text-3xl font-extrabold text-[#38ff73]">{p.price}</div>
              <p className="mt-2 text-gray-400 text-sm">{p.desc}</p>
            </div>
            <button
              onClick={() => startCheckout(p.type)}
              disabled={loading}
              className="btn btn-primary w-full mt-4 py-3 text-base">
              {loading ? "Redirection…" : "S’abonner"}
            </button>
          </div>
        ))}
      </div>
      <div style={{height:'var(--safe-b)'}} />
    </section>
  );
}
