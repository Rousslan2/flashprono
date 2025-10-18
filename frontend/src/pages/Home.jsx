import { isAuthenticated, getUser } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Home() {
  const isAuth = isAuthenticated();
  const user = getUser();

  return (
    <section className="text-center py-20">
      {/* Hero */}
      <h1 className="text-5xl font-extrabold mb-4 text-primary drop-shadow-lg">
        Bienvenue sur <span className="text-white">FlashProno ⚡</span>
      </h1>
      <p className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto">
        Des <b className="text-white">pronostics vérifiés</b>, une{" "}
        <b className="text-white">sélection VIP “Pronos en or”</b>, des{" "}
        <b className="text-white">scores live</b> et des{" "}
        <b className="text-white">stratégies bankroll</b> expliquées pas à pas.
        Tout ce qu’il faut pour jouer <i>plus clair</i>, pas au hasard.
      </p>

      {/* CTA principal */}
      {isAuth ? (
        <Link
          to="/dashboard"
          className="bg-primary text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          Accéder à mon espace
        </Link>
      ) : (
        <Link
          to="/register"
          className="bg-primary text-black px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
        >
          Commencer mon essai gratuit
        </Link>
      )}

      {/* Avantages clés */}
      <div className="grid md:grid-cols-3 gap-6 mt-14 text-left max-w-6xl mx-auto">
        <Feature
          title="🎯 Précision & transparence"
          desc="Sélection basée sur data, forme, effectifs et value. Résultats clairement indiqués (gagnant/perdu/en attente)."
        />
        <Feature
          title="⚡ Rapide & en temps réel"
          desc="Ajouts quotidiens + mise à jour live du score pendant les matchs (section abonné)."
        />
        <Feature
          title="💎 Simplicité & pédagogie"
          desc="Interface clean + zone Stratégies & Bankroll pour savoir exactement quoi faire et pourquoi."
        />
      </div>

      {/* Ce que tu obtiens en Premium/VIP */}
      <div className="max-w-6xl mx-auto mt-12 grid md:grid-cols-2 gap-6 text-left">
        <Card title="Accès Premium (Mensuel)">
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            <li>Accès complet aux pronostics du jour + archives.</li>
            <li>“Pronos en or” mis en avant quand la value est forte.</li>
            <li>Alertes importantes (heure / changements majeurs).</li>
            <li>Scores live intégrés sur la page pronostics.</li>
          </ul>
        </Card>
        <Card title="Espace Stratégies & Bankroll">
          <ul className="list-disc pl-5 space-y-2 text-gray-300">
            <li>Guides courts, clairs et applicables dès aujourd’hui.</li>
            <li>Calculateur bankroll (gestion de mise simple).</li>
            <li>Conseils d’allocation selon le risque.</li>
            <li>Vidéo d’explication (bientôt) pour t’accompagner.</li>
          </ul>
        </Card>
      </div>

      {/* Message personnalisé si connecté */}
      {isAuth && (
        <p className="mt-12 text-gray-400">
          Heureux de te revoir,{" "}
          <span className="text-primary font-semibold">{user?.name}</span> !
        </p>
      )}
    </section>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="bg-black border border-primary rounded-2xl p-6 shadow-md hover:shadow-primary/20 transition">
      <h3 className="text-xl font-semibold mb-2 text-primary">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-black border border-[#1d2f1f] rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-3 text-emerald-300">{title}</h3>
      {children}
    </div>
  );
}
