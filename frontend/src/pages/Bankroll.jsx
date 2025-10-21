import { useMemo, useState } from "react";
import { isSubscriptionActive } from "../hooks/useAuth";
import { Link } from "react-router-dom";

/**
 * Page : Gestion de Bankroll (simulateur intelligent)
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
      <section className="py-20 px-4 text-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-green-400/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="mb-8 animate-float">
            <div className="inline-block w-24 h-24 bg-gradient-to-br from-emerald-500/30 to-green-400/30 rounded-3xl flex items-center justify-center mb-6 text-5xl border-2 border-emerald-500/40 shadow-2xl backdrop-blur-sm transform hover:scale-110 transition-all duration-500">
              🔒
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 bg-clip-text text-transparent animate-gradient">
                Gestion de Bankroll
              </span>
              <br />
              <span className="text-white drop-shadow-glow">Réservé aux membres</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Accède au <span className="text-emerald-400 font-semibold">calculateur intelligent</span> de bankroll,
              apprends les meilleures stratégies de mise et protège ton capital.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <FeaturePreview icon="💰" title="Calculateur intelligent" desc="Optimise tes mises" delay="0" />
            <FeaturePreview icon="🛡️" title="Protection du capital" desc="Stratégies sécurisées" delay="100" />
            <FeaturePreview icon="📈" title="Suivi de performance" desc="Analyse tes résultats" delay="200" />
          </div>

          <Link
            to="/abonnements"
            className="inline-block bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 text-white px-12 py-5 rounded-2xl font-bold text-lg hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/60 animate-gradient-slow"
          >
            🚀 Voir les abonnements
          </Link>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          .animate-gradient {
            background-size: 200% auto;
            animation: gradient 3s linear infinite;
          }
          .animate-gradient-slow {
            background-size: 200% auto;
            animation: gradient 5s linear infinite;
          }
          .drop-shadow-glow {
            filter: drop-shadow(0 0 20px rgba(52, 211, 153, 0.3));
          }
        `}</style>
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
  const loseLoss = useMemo(() => stake, [stake]);

  const riskLevel = useMemo(() => {
    if (stakePct <= 1) return { label: "Très prudent", color: "text-emerald-400", bg: "bg-emerald-500/10" };
    if (stakePct <= 2) return { label: "Prudent", color: "text-green-400", bg: "bg-green-500/10" };
    if (stakePct <= 3) return { label: "Modéré", color: "text-yellow-400", bg: "bg-yellow-500/10" };
    if (stakePct <= 5) return { label: "Agressif", color: "text-orange-400", bg: "bg-orange-500/10" };
    return { label: "Très risqué", color: "text-red-400", bg: "bg-red-500/10" };
  }, [stakePct]);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-2 bg-primary/20 border border-primary rounded-full mb-4">
          <span className="text-primary font-semibold text-sm">💰 Outil de gestion</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
            Calculateur de Bankroll
          </span>
        </h1>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
          Définis ton <span className="text-primary font-semibold">capital</span>, ton{" "}
          <span className="text-primary font-semibold">pourcentage de mise</span> et obtiens
          des recommandations intelligentes pour protéger ta bankroll.
        </p>
      </div>

      {/* Main Calculator */}
      <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary/30 rounded-3xl p-8 mb-10">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span>🎯</span>
          Paramètres de calcul
        </h2>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <InputField 
            label="Bankroll totale (€)"
            value={bankroll}
            onChange={(e) => setBankroll(e.target.value)}
            type="number"
            min="0"
            step="1"
            icon="💵"
            helper="Ton capital total disponible"
          />
          <InputField 
            label="Pourcentage de mise (%)"
            value={stakePct}
            onChange={(e) => setStakePct(e.target.value)}
            type="number"
            min="0"
            max="100"
            step="0.1"
            icon="📊"
            helper={
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${riskLevel.bg} ${riskLevel.color}`}>
                  {riskLevel.label}
                </span>
              </div>
            }
          />
          <InputField 
            label="Cote du pari"
            value={odds}
            onChange={(e) => setOdds(e.target.value)}
            type="number"
            min="1.01"
            step="0.01"
            icon="🎲"
            helper="La cote proposée par le bookmaker"
          />
          <InputField 
            label="Confiance dans le pari (%)"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            type="number"
            min="0"
            max="100"
            step="1"
            icon="💪"
            helper="Ta probabilité estimée de gagner ce pari"
          />
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ResultCard 
            title="Mise conseillée"
            value={`${stake.toFixed(2)} €`}
            icon="💰"
            gradient="from-primary/20 to-yellow-500/20"
          />
          <ResultCard 
            title="Gain potentiel"
            value={`+${winProfit.toFixed(2)} €`}
            icon="📈"
            gradient="from-emerald-500/20 to-green-500/20"
            positive
          />
          <ResultCard 
            title="Perte potentielle"
            value={`-${loseLoss.toFixed(2)} €`}
            icon="📉"
            gradient="from-red-500/20 to-orange-500/20"
            negative
          />
        </div>

        {/* Advanced Metrics */}
        <div className="grid md:grid-cols-2 gap-6">
          <AdvancedCard 
            title="Valeur espérée (EV)"
            icon="🎯"
            value={expectedValue >= 0 ? `+${expectedValue.toFixed(3)}` : expectedValue.toFixed(3)}
            unit="€ par € misé"
            valueColor={expectedValue >= 0 ? "text-emerald-400" : "text-red-400"}
            description={
              expectedValue >= 0 
                ? "✅ Ce pari a une valeur attendue positive selon tes paramètres"
                : "❌ Ce pari a une valeur attendue négative, méfiance"
            }
          />
          <AdvancedCard 
            title="Suggestion Kelly (prudente)"
            icon="🧠"
            value={kellyPct.toFixed(1)}
            unit="%"
            valueColor="text-primary"
            description="Méthode mathématique pour optimiser la croissance de ta bankroll sur le long terme"
          />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <TipCard 
          icon="🛡️"
          title="Stratégie prudente"
          desc="Mise entre 0.5% et 2% de ta bankroll par pari. Idéal pour débuter et protéger ton capital."
          color="emerald"
        />
        <TipCard 
          icon="⚖️"
          title="Stratégie équilibrée"
          desc="Mise entre 2% et 3% de ta bankroll. Un bon compromis entre sécurité et croissance."
          color="yellow"
        />
        <TipCard 
          icon="🚀"
          title="Stratégie agressive"
          desc="Mise entre 3% et 5% de ta bankroll. Plus de risque mais potentiel de gains plus rapide."
          color="red"
        />
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-br from-primary/10 via-black to-primary/10 border-2 border-primary/30 rounded-3xl p-10">
        <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span>💡</span>
          Bonnes pratiques
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <BestPractice 
            icon="✅"
            title="Ne jamais miser plus de 5%"
            desc="Même sur un 'coup sûr', limite-toi à 5% max de ta bankroll pour éviter la ruine."
          />
          <BestPractice 
            icon="📊"
            title="Tenir un journal de paris"
            desc="Note chaque pari, les raisons, la cote, le résultat. Analyse tes performances régulièrement."
          />
          <BestPractice 
            icon="🎯"
            title="Se concentrer sur la value"
            desc="Cherche les paris où ta probabilité estimée est supérieure à celle impliquée par la cote."
          />
          <BestPractice 
            icon="⏰"
            title="Réévaluer régulièrement"
            desc="Ajuste ta bankroll et tes pourcentages selon ton évolution (gains ou pertes)."
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-10 p-6 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl">
        <p className="text-amber-300 text-center leading-relaxed">
          <span className="font-bold">⚠️ Important :</span> Les résultats sont indicatifs et basés sur tes paramètres.
          Aucun système ne garantit des gains. Parie de manière responsable et ne mise jamais plus que ce que tu peux te permettre de perdre.
        </p>
      </div>
    </section>
  );
}

/* ---------- Composants ---------- */

function InputField({ label, value, onChange, type, min, max, step, icon, helper }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-white font-semibold">
        <span>{icon}</span>
        {label}
      </label>
      <input 
        type={type}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full bg-black/50 border-2 border-primary/30 rounded-xl p-3 text-white font-semibold focus:border-primary focus:outline-none transition-all"
      />
      {helper && (
        <div className="text-gray-400 text-sm">
          {helper}
        </div>
      )}
    </div>
  );
}

function ResultCard({ title, value, icon, gradient, positive, negative }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border-2 border-primary/30 rounded-2xl p-6 text-center hover:scale-105 transition-all duration-300`}>
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-gray-300 text-sm mb-2">{title}</div>
      <div className={`text-3xl font-extrabold ${positive ? "text-emerald-400" : negative ? "text-red-400" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function AdvancedCard({ title, icon, value, unit, valueColor, description }) {
  return (
    <div className="bg-black/50 border-2 border-primary/30 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">{icon}</div>
        <h3 className="text-white font-bold text-lg">{title}</h3>
      </div>
      <div className="mb-3">
        <span className={`text-4xl font-extrabold ${valueColor}`}>{value}</span>
        <span className="text-gray-400 ml-2">{unit}</span>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function TipCard({ icon, title, desc, color }) {
  const colors = {
    emerald: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
    yellow: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30",
    red: "from-red-500/20 to-orange-500/20 border-red-500/30",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border-2 rounded-2xl p-6 hover:scale-105 transition-all duration-300`}>
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function BestPractice({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-black/30 rounded-2xl border border-primary/20">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h4 className="text-white font-bold mb-2">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function FeaturePreview({ icon, title, desc, delay }) {
  return (
    <div 
      className="bg-gradient-to-br from-emerald-500/10 to-green-400/5 border-2 border-emerald-500/30 rounded-2xl p-6 text-center transform hover:scale-110 hover:-rotate-2 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/30 cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-5xl mb-4 animate-bounce">{icon}</div>
      <h3 className="text-white font-bold mb-2 text-lg">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}
