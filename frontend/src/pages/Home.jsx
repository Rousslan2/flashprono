import { isAuthenticated, getUser } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Home() {
  const isAuth = isAuthenticated();
  const user = getUser();

  return (
    <section className="text-center py-20">
      {/* Titre principal */}
      <h1 className="text-5xl font-extrabold mb-6 text-primary drop-shadow-lg">
        Bienvenue sur <span className="text-white">FlashProno ⚡</span>
      </h1>

      {/* Description */}
      <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
        Analyse, précision et performance. FlashProno t’apporte chaque jour les meilleurs
        pronostics sportifs, testés et validés par des experts.
      </p>

      {/* Bouton principal : change selon connexion */}
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

      {/* Section arguments */}
      <div className="grid md:grid-cols-3 gap-8 mt-16 text-left max-w-5xl mx-auto">
        <div className="bg-black border border-primary rounded-2xl p-6 shadow-md hover:shadow-primary/20 transition">
          <h3 className="text-xl font-semibold mb-2 text-primary">🎯 Précision</h3>
          <p className="text-gray-400">
            Nos pronostics sont basés sur des analyses statistiques, la forme des équipes et des algorithmes exclusifs.
          </p>
        </div>

        <div className="bg-black border border-primary rounded-2xl p-6 shadow-md hover:shadow-primary/20 transition">
          <h3 className="text-xl font-semibold mb-2 text-primary">⚡ Rapidité</h3>
          <p className="text-gray-400">
            Des mises à jour quotidiennes, des alertes en temps réel et des résultats instantanés dès la fin des matchs.
          </p>
        </div>

        <div className="bg-black border border-primary rounded-2xl p-6 shadow-md hover:shadow-primary/20 transition">
          <h3 className="text-xl font-semibold mb-2 text-primary">💎 Simplicité</h3>
          <p className="text-gray-400">
            Une interface claire et intuitive, pour te concentrer sur ce qui compte : gagner tes paris.
          </p>
        </div>
      </div>

      {/* Message personnalisé si connecté */}
      {isAuth && (
        <p className="mt-12 text-gray-400">
          Heureux de te revoir, <span className="text-primary font-semibold">{user?.name}</span> !
        </p>
      )}
    </section>
  );
}
