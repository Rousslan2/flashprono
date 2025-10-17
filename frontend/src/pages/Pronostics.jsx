import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { isSubscriptionActive } from "../hooks/useAuth";

export default function Pronostics() {
  const [loading, setLoading] = useState(true);
  const [pronos, setPronos] = useState([]);
  const [error, setError] = useState("");
  const active = isSubscriptionActive();

  useEffect(() => {
    if (!active) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/pronostics`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPronos(data || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Erreur lors du chargement des pronostics.");
      } finally {
        setLoading(false);
      }
    })();
  }, [active]);

  if (!active) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Pronostics du jour</h1>
        <p className="text-gray-300 mb-6">
          🔒 Cette section affichera vos pronostics une fois connecté et abonné.
        </p>
        <a
          href="/abonnements"
          className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition"
        >
          Voir les abonnements
        </a>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Pronostics du jour</h1>
        <p className="text-gray-300">Chargement des pronostics…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Pronostics du jour</h1>
        <p className="text-red-400">{error}</p>
      </section>
    );
  }

  return (
    <section className="py-20">
      <h1 className="text-3xl font-bold text-primary mb-8 text-center">Pronostics du jour</h1>
      {pronos.length === 0 ? (
        <p className="text-center text-gray-400">Aucun pronostic pour l’instant.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {pronos.map((p) => (
            <div
              key={p._id}
              className="bg-black p-5 rounded-xl border border-primary"
            >
              <div className="flex justify-between mb-2">
                <span className="text-primary font-semibold">{p.sport}</span>
                <span className="text-gray-400">
                  {new Date(p.date).toLocaleString()}
                </span>
              </div>
              <h3 className="text-xl text-white mb-1">
                {p.equipe1} vs {p.equipe2}
              </h3>
              <p className="text-gray-300">
                Type : {p.type} • Cote :{" "}
                <b className="text-primary">{p.cote}</b>
              </p>
              <p className="text-gray-400 mt-2">Résultat : {p.resultat}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
