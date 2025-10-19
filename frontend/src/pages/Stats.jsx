// frontend/src/pages/Stats.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function Stats() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/stats/public`);
        setData(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Erreur chargement des stats.");
      }
    })();
  }, []);

  return (
    <section className="py-16">
      <h1 className="text-3xl font-bold text-primary text-center mb-6">
        Nos résultats (aperçu)
      </h1>
      <p className="text-gray-300 text-center max-w-2xl mx-auto mb-8">
        Un aperçu transparent des perfs récentes. Pour le détail <em>(semaine / mois, historique complet)</em>,
        connecte-toi à ton espace membre.
      </p>

      {err && <p className="text-center text-red-400">{err}</p>}

      {!data ? (
        <div className="text-center text-gray-400">Chargement…</div>
      ) : (
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          <Card title="7 derniers jours" d={data.last7} />
          <Card title="30 derniers jours" d={data.last30} />
        </div>
      )}

      <div className="text-center mt-10">
        <a href="/register" className="bg-primary text-black px-5 py-2 rounded-lg font-semibold hover:scale-105 inline-block">
          Rejoindre FlashProno
        </a>
      </div>
    </section>
  );
}

function Card({ title, d }) {
  return (
    <div className="bg-black border border-primary/40 rounded-xl p-5">
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Row k="Pronostics" v={d.total} />
        <Row k="Gagnés" v={d.wins} />
        <Row k="Perdus" v={d.losses} />
        <Row k="Winrate" v={`${d.winrate}%`} />
        <Row k="ROI" v={`${d.roi}%`} />
        <Row k="Unités" v={`${d.units}u`} />
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
      <span className="text-gray-400">{k}</span>
      <span className="text-white">{v}</span>
    </div>
  );
}
