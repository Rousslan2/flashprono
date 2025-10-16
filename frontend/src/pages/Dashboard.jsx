import { getUser, logout } from "../hooks/useAuth";

export default function Dashboard() {
  const user = getUser();
  const sub = user?.subscription || {};

  const planLabel =
    sub.plan === "yearly"
      ? "Annuel VIP"
      : sub.plan === "monthly"
      ? "Mensuel Premium"
      : "Essai Gratuit / Aucun";

  const statusLabel = sub.status === "active" ? "Actif" : "Inactif";
  const expires =
    sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : "—";

  return (
    <section className="py-16 max-w-4xl mx-auto text-center">
      <h1 className="text-4xl font-extrabold text-primary mb-3">
        Mon Espace Membre
      </h1>
      <p className="text-gray-300 mb-10 text-lg">
        Bienvenue {user?.name || "membre"} 👋
      </p>

      {/* Infos abonnement */}
      <div className="grid md:grid-cols-3 gap-6 text-left">
        <div className="bg-black p-5 rounded-xl border border-primary shadow-md">
          <h3 className="font-semibold mb-2 text-primary">Abonnement</h3>
          <p className="text-gray-300 text-lg">{planLabel}</p>
        </div>

        <div className="bg-black p-5 rounded-xl border border-primary shadow-md">
          <h3 className="font-semibold mb-2 text-primary">Statut</h3>
          <p
            className={`text-lg ${
              statusLabel === "Actif" ? "text-green-400" : "text-red-400"
            }`}
          >
            {statusLabel}
          </p>
        </div>

        <div className="bg-black p-5 rounded-xl border border-primary shadow-md">
          <h3 className="font-semibold mb-2 text-primary">Expire le</h3>
          <p className="text-gray-300 text-lg">{expires}</p>
        </div>
      </div>

      {/* Message selon abonnement */}
      {statusLabel === "Actif" ? (
        <div className="mt-10 text-green-400 font-semibold">
          Ton abonnement est valide 🎉
        </div>
      ) : (
        <div className="mt-10 text-yellow-400 font-semibold">
          Tu es actuellement en mode essai ou sans abonnement actif.
        </div>
      )}

      {/* Bouton déconnexion */}
      <button
        onClick={logout}
        className="mt-10 bg-red-500/90 hover:bg-red-500 text-white px-6 py-3 rounded-lg text-lg font-semibold transition-all"
      >
        Se déconnecter
      </button>
    </section>
  );
}
