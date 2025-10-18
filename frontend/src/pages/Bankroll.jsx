import { useMemo, useState } from "react";
import { isSubscriptionActive } from "../hooks/useAuth";

/**
 * Page : Gestion de Bankroll (simulateur simple)
 * Accès : réservé aux abonnés
 */
export default function Bankroll() {
  const active = isSubscriptionActive();
  const [bankroll, setBankroll] = useState(1000);
  const [stakePct, setStakePct] = useState(2);
  const [odds, setOdds] = useState(1.90);
  const [confidence, setConfidence] = useState(55);

  if (!active) {
    return (
      <section className="text-center py-20">
        <h1 className="text-3xl font-bold text-primary mb-4">Gestion de Bankroll</h1>
        <p className="text-gray-300 mb-6">🔒 Cette page est réservée aux abonnés.</p>
        <a href="/abonnements" className="bg-primary text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition">
          Voir les abonnements
        </a>
      </section>
    );
  }

  const stake = useMemo(() => {
    const s = (Number(bankroll) * Number(stakePct)) / 100;
    return Number.isFinite(s) ? Math.max(0, Math.round(s * 100) / 100) : 0;
  }, [bankroll, stakePct]);

  const expectedValue = useMemo(() => {
    const p = Math.min(100, Math.max(0, Number(confidence))) / 100;
    const b = Number(odds) - 1;
    const ev = p * b - (1 - p);
    return Math.round(ev * 1000) / 1000;
  }, [odds, confidence]);

  const kellyPct = useMemo(() => {
    const p = Math.min(100, Math.max(0, Number(confidence))) / 100;
    const b = Number(odds) - 1;
    const k = ((p * (b + 1) - 1) / b) * 100;
    const safe = Math.max(0, Math.round((k / 2) * 10) / 10);
    if (!Number.isFinite(safe)) return 0;
    return safe;
  }, [odds, confidence]);

  const winProfit = useMemo(() => Math.round((stake * (Number(odds) - 1)) * 100) / 100, [stake, odds]);
  const loseLoss  = useMemo(() => stake, [stake]);

  return (
    <section className="py-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-2 text-center">Gestion de Bankroll</h1>
      <p className="text-gray-300 text-center mb-8">
        Définissez un pourcentage fixe de mise (<span className="text-primary">stake</span>) et obtenez la mise conseillée.
      </p>

      <div className="bg-black border border-primary/40 rounded-xl p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Bankroll totale (€)">
            <input type="number" min="0" step="1" value={bankroll} onChange={(e) => setBankroll(e.target.value)} className="w-full bg-[#0b0b0b] border border-[#222] rounded-lg p-2" />
          </Field>
          <Field label="Pourcentage de mise (%)">
            <input type="number" min="0" step="0.1" value={stakePct} onChange={(e) => setStakePct(e.target.value)} className="w-full bg-[#0b0b0b] border border-[#222] rounded-lg p-2" />
            <div className="text-xs text-gray-400 mt-1">Classique : 0.5% à 2% — Agressif : 3% à 5%</div>
          </Field>
          <Field label="Cote">
            <input type="number" min="1.01" step="0.01" value={odds} onChange={(e) => setOdds(e.target.value)} className="w-full bg-[#0b0b0b] border border-[#222] rounded-lg p-2" />
          </Field>
          <Field label="Confiance (%)">
            <input type="number" min="0" max="100" step="1" value={confidence} onChange={(e) => setConfidence(e.target.value)} className="w-full bg-[#0b0b0b] border border-[#222] rounded-lg p-2" />
          </Field>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-2">
          <Stat title="Mise conseillée (€)" value={stake.toFixed(2)} />
          <Stat title="Gain si victoire (€)" value={winProfit.toFixed(2)} positive />
          <Stat title="Perte si défaite (€)" value={`-${loseLoss.toFixed(2)}`} negative />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <InfoCard title="Valeur espérée (par € mis)"
            body={<><div className={`text-xl font-semibold ${expectedValue >= 0 ? "text-emerald-400" : "text-red-400"}`}>{expectedValue >= 0 ? `+${expectedValue}` : expectedValue} €/€</div><p className="text-gray-400 text-sm mt-1">&rarr; Si positif, le pari a une valeur attendue favorable selon vos paramètres.</p></>} />
          <InfoCard title="Suggestion (½ Kelly)"
            body={<><div className="text-xl font-semibold text-primary">{kellyPct}%</div><p className="text-gray-400 text-sm mt-1">Approche prudente basée sur Kelly.</p></>} />
        </div>
      </div>

      <div className="mt-8 text-sm text-gray-400">⚠️ Les résultats sont indicatifs. Pariez de manière responsable.</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-300">{label}</label>
      {children}
    </div>
  );
}

function Stat({ title, value, positive, negative }) {
  return (
    <div className="bg-[#0b0b0b] rounded-xl p-4 border border-[#222]">
      <div className="text-gray-400 text-sm">{title}</div>
      <div className={`text-2xl font-bold ${positive ? "text-emerald-400" : negative ? "text-red-400" : "text-white"}`}>{value}</div>
    </div>
  );
}

function InfoCard({ title, body }) {
  return (
    <div className="bg-[#0b0b0b] rounded-xl p-4 border border-[#222]">
      <div className="text-gray-300 font-semibold mb-1">{title}</div>
      <div>{body}</div>
    </div>
  );
}