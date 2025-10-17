
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { isSubscriptionActive } from "../hooks/useAuth";

export default function PronosEnOr() {
  const [loading, setLoading] = useState(true);
  const [pronos, setPronos] = useState([]);
  const [error, setError] = useState("");
  const active = isSubscriptionActive();

  useEffect(() => {
    const run = async () => {
      try {
        if (!active) return;
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/pronostics?categorie=pronos_en_or`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPronos(data);
      } catch (e) {
        setError(e?.response?.data?.message || "Erreur chargement");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [active]);

  if (!active) return <div className='text-center py-10'>🔒 Accès réservé aux abonnés</div>;
  if (loading) return <p className='text-center'>Chargement…</p>;
  if (error) return <p className='text-center text-red-400'>{error}</p>;

  return (
    <section className='py-10 container mx-auto'>
      <h1 className='text-3xl font-bold text-center mb-6'>PronosEnOr</h1>
      <div className='grid md:grid-cols-2 gap-5'>
        {pronos.map(p => (
          <div key={p._id} className='bg-black p-5 rounded-xl border border-primary'>
            <h3 className='text-xl mb-2'>{p.equipe1} vs {p.equipe2}</h3>
            <p>Type: {p.type} • Cote: <b>{p.cote}</b> • Confiance: {p.confiance}%</p>
            <p>Compétition: {p.competition || "—"}</p>
            <p>Bookmaker: {p.bookmaker || "—"}</p>
            <p>Statut: {p.statut}</p>
            {p.analyse && <p className='text-gray-300 mt-2'>{p.analyse}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
