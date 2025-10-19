// frontend/src/pages/Recap.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function Recap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE}/api/stats/summary`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        setData(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Erreur chargement du récap.");
      }
    })();
  }, []);

  return (
    <section className="py-16">
      <h1 className="text-3xl font-bold text-primary text-center mb-6">
        Récapitulatif — Semaine & Mois
      </h1>
      {err && <p className="text-center text-red-400">{err}</p>}

      {!data ? (
        <div className="text-center text-gray-400">Chargement…</div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-10">
          <Block title="Semaine en cours" payload={data.currentWeek} />
          <Block title="Semaine passée" payload={data.lastWeek} />
          <Block title="Mois en cours" payload={data.currentMonth} />
          <Block title="Mois passé" payload={data.lastMonth} />
        </div>
      )}
    </section>
  );
}

function Block({ title, payload }) {
  const r = payload?.range;
  const s = payload?.stats;
  const items = payload?.items || [];
  return (
    <div className="bg-black border border-primary/40 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {r && (
          <div className="text-xs text-gray-400">
            {new Date(r.from).toLocaleDateString()} → {new Date(r.to).toLocaleDateString()}
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-5 gap-3 mt-3 text-sm">
        <Row k="Pronostics" v={s.total} />
        <Row k="Gagnés" v={s.wins} />
        <Row k="Perdus" v={s.losses} />
        <Row k="Winrate" v={`${s.winrate}%`} />
        <Row k="ROI" v={`${s.roi}%`} />
      </div>

      {items.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="py-2 text-left">Date</th>
                <th className="py-2 text-left">Match</th>
                <th className="py-2 text-left">Cote</th>
                <th className="py-2 text-left">Résultat</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 20).map((p) => (
                <tr key={p._id} className="border-t border-[#1a1a1a]">
                  <td className="py-2">{new Date(p.date).toLocaleString()}</td>
                  <td className="py-2">{p.equipe1} vs {p.equipe2}</td>
                  <td className="py-2">{p.cote}</td>
                  <td className="py-2">{p.resultat || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length > 20 && (
            <div className="text-xs text-gray-500 mt-2">({items.length - 20} autres…)</div>
          )}
        </div>
      )}
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
