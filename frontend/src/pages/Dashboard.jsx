// frontend/src/pages/Dashboard.jsx
import { useRealtimeUser, logout } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../services/socket";
import axios from "axios";
import { API_BASE } from "../config";

export default function Dashboard() {
  const user = useRealtimeUser();
  const sub = user?.subscription || {};
  
  // 🔥 Stats en temps réel
  const [stats, setStats] = useState({
    pronosSuivis: 0,
    tauxReussite: 0,
    roi: 0,
    gains: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // 🔥 Écouter les mises à jour de l'utilisateur
  useEffect(() => {
    // Charger les stats
    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE}/api/stats/my-stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(data);
      } catch (err) {
        console.error('❌ Erreur chargement stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    
    loadStats();
    
    socket.on('user:updated', (updatedUser) => {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser._id === updatedUser._id) {
        console.log('📥 Abonnement mis à jour en temps réel');
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: updatedUser }));
      }
    });
    
    // Recharger les stats quand un prono change
    socket.on('prono:updated', loadStats);
    socket.on('prono:created', loadStats);

    return () => {
      socket.off('user:updated');
      socket.off('prono:updated');
      socket.off('prono:created');
    };
  }, []);

  const planLabel =
    sub.plan === "yearly"
      ? "Annuel VIP"
      : sub.plan === "monthly"
      ? "Mensuel Premium"
      : sub.status === "trial"
      ? "Essai gratuit"
      : "Aucun";

  const statusActive = sub.status === "active";
  const expiresDate = sub.expiresAt ? new Date(sub.expiresAt) : null;
  const expiresStr = expiresDate ? expiresDate.toLocaleDateString() : "—";

  const daysLeft =
    expiresDate
      ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto relative overflow-hidden">
      {/* Particules subtiles */}
      <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-yellow-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      {/* Hero Header avec gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-black to-primary/10 border-2 border-primary/30 p-10 mb-12">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary rounded-full mb-4">
            <span className="text-primary font-semibold text-sm">⚡ Tableau de bord</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-3">
            Content de te revoir,{" "}
            <span className="bg-gradient-to-r from-primary to-yellow-400 bg-clip-text text-transparent">
              {user?.name || "champion"}
            </span>{" "}
            👋
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl">
            Bienvenue sur ton espace membre. Retrouve ici ton statut, tes accès rapides et toutes les infos importantes.
          </p>
        </div>
      </div>

      {/* Statut / plan / expiration avec design modernisé */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <StatCard 
          icon="👑"
          title="Abonnement" 
          value={planLabel}
          gradient="from-yellow-500/20 to-primary/20"
        />
        <StatCard 
          icon={statusActive ? "✅" : sub.status === "trial" ? "⏳" : "🔒"}
          title="Statut"
          value={statusActive ? "Actif" : sub.status === "trial" ? "Essai" : "Inactif"}
          valueClass={statusActive ? "text-emerald-400" : sub.status === "trial" ? "text-amber-400" : "text-red-400"}
          gradient={statusActive ? "from-emerald-500/20 to-green-500/20" : "from-gray-500/20 to-gray-700/20"}
        />
        <StatCard 
          icon="📅"
          title="Expire le"
          value={expiresStr}
          gradient="from-blue-500/20 to-cyan-500/20"
          extra={
            daysLeft !== null && (
              <div className="mt-3 inline-block px-3 py-1.5 rounded-full bg-black border border-primary/30">
                <span className="text-sm text-gray-300">
                  {daysLeft > 0
                    ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`
                    : "Expire aujourd'hui"}
                </span>
              </div>
            )
          }
        />
      </div>

      {/* Alert Banner avec nouveau style */}
      <div className="mb-10">
        {statusActive ? (
          <AlertBanner 
            type="success"
            icon="🎉"
            message="Accès complet actif ! Profite de tous nos pronos et outils."
          />
        ) : sub.status === "trial" ? (
          <AlertBanner 
            type="warning"
            icon="⏳"
            message="Tu es en période d'essai. Passe Premium pour débloquer tout sans limite."
            action={{ text: "Voir les offres", link: "/abonnements" }}
          />
        ) : (
          <AlertBanner 
            type="error"
            icon="🔒"
            message="Aucun abonnement actif pour le moment."
            action={{ text: "Découvrir nos offres", link: "/abonnements" }}
          />
        )}
      </div>

      {/* Accès rapide modernisé */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Accès rapide</h2>
          <p className="text-gray-400">Tes raccourcis essentiels</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            href="/pronostics"
            icon="⚽"
            title="Pronostics"
            desc="Découvre les pronos du jour"
            gradient="from-emerald-500/20 to-green-500/20"
          />
          <QuickActionCard
            href="/bankroll"
            icon="💰"
            title="Bankroll"
            desc="Gère tes mises intelligemment"
            gradient="from-yellow-500/20 to-amber-500/20"
          />
          <QuickActionCard
            href="/strategies"
            icon="🎯"
            title="Stratégies"
            desc="Apprends les meilleures techniques"
            gradient="from-blue-500/20 to-cyan-500/20"
          />
          <QuickActionCard
            href="/abonnements"
            icon="👑"
            title="Mon offre"
            desc="Gérer mon abonnement"
            gradient="from-purple-500/20 to-pink-500/20"
          />
        </div>
      </section>

      {/* Deux colonnes informatives */}
      <section className="grid gap-6 lg:grid-cols-2 mb-12">
        {/* Ce que tu obtiens */}
        <InfoBox
          icon="🎁"
          title="Ce que ton abonnement inclut"
          items={[
            "Pronostics détaillés et justifiés quotidiennement",
            "Outil complet de Gestion de Bankroll",
            "Section Stratégies & Apprentissage interactive",
            "Suivi en temps réel de ton statut d'abonnement",
            "Scores live et alertes importantes",
          ]}
          footer="💡 Pas de renouvellement automatique : tu contrôles tout."
        />

        {/* Support */}
        <InfoBox
          icon="💬"
          title="Besoin d'aide ?"
          gradient="from-blue-500/10 to-cyan-500/10"
          footer={
            <div className="space-y-3">
              <p className="text-gray-300">
                Une question sur ton accès, les pronos ou les stratégies ? Notre équipe est là pour toi.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/33695962084"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-yellow-400 text-black px-5 py-2.5 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  <span>💬</span>
                  Support WhatsApp
                </a>
                {!statusActive && (
                  <Link
                    to="/abonnements"
                    className="inline-flex items-center gap-2 border-2 border-primary text-primary px-5 py-2.5 rounded-xl font-semibold hover:bg-primary hover:text-black transition-all"
                  >
                    <span>👑</span>
                    Voir les offres
                  </Link>
                )}
              </div>
            </div>
          }
        />
      </section>

      {/* Stats rapides avec vraies données */}
      <section className="mb-12">
        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-primary/30 rounded-3xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span>📊</span>
            Tes statistiques
            {loadingStats && <span className="ml-auto text-sm text-gray-500 font-normal animate-pulse">⏳ Chargement...</span>}
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <MiniStat 
              label="Pronos suivis" 
              value={loadingStats ? "—" : stats.pronosSuivis} 
              icon="⚽" 
            />
            <MiniStat 
              label="Taux réussite" 
              value={loadingStats ? "—" : `${stats.tauxReussite}%`}
              icon="🎯"
              color={stats.tauxReussite >= 60 ? "text-emerald-400" : stats.tauxReussite >= 50 ? "text-amber-400" : "text-red-400"}
            />
            <MiniStat 
              label="ROI" 
              value={loadingStats ? "—" : `${stats.roi > 0 ? '+' : ''}${stats.roi}%`}
              icon="📈"
              color={stats.roi > 0 ? "text-emerald-400" : stats.roi < 0 ? "text-red-400" : "text-gray-400"}
            />
            <MiniStat 
              label="Gains" 
              value={loadingStats ? "—" : `${stats.gains > 0 ? '+' : ''}${stats.gains}€`}
              icon="💰"
              color={stats.gains > 0 ? "text-emerald-400" : stats.gains < 0 ? "text-red-400" : "text-gray-400"}
            />
          </div>
          {!loadingStats && stats.pronosSuivis === 0 && (
            <div className="mt-6 text-center text-gray-400 text-sm">
              💡 Les stats s'afficheront une fois que des pronos seront terminés
            </div>
          )}
        </div>
      </section>

      {/* Déconnexion */}
      <div className="text-center">
        <button
          onClick={logout}
          className="group relative bg-red-500/90 hover:bg-red-500 text-white px-8 py-3 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-red-500/50"
        >
          <span className="relative z-10">Se déconnecter</span>
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity"></div>
        </button>
      </div>
    </section>
  );
}

/* ---------- Composants modernisés ---------- */

function StatCard({ icon, title, value, valueClass = "text-white", gradient, extra = null }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} border-2 border-primary/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-primary/30`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl border border-primary/30">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
      </div>
      <p className={`text-3xl font-extrabold ${valueClass}`}>{value}</p>
      {extra}
    </div>
  );
}

function AlertBanner({ type, icon, message, action }) {
  const styles = {
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    error: "border-red-500/40 bg-red-500/10 text-red-300",
  };

  return (
    <div className={`rounded-2xl border-2 ${styles[type]} px-6 py-4 flex items-center justify-between gap-4`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <p className="font-medium">{message}</p>
      </div>
      {action && (
        <Link
          to={action.link}
          className="px-4 py-2 bg-primary text-black rounded-lg font-semibold hover:scale-105 transition-transform whitespace-nowrap"
        >
          {action.text}
        </Link>
      )}
    </div>
  );
}

function QuickActionCard({ href, icon, title, desc, gradient }) {
  return (
    <Link
      to={href}
      className={`group relative overflow-hidden bg-gradient-to-br ${gradient} border-2 border-primary/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-primary/30`}
    >
      <div className="relative z-10">
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
      </div>
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl"></div>
    </Link>
  );
}

function InfoBox({ icon, title, items, footer, gradient = "from-primary/10 to-primary/5" }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} border-2 border-primary/30 rounded-2xl p-6`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      {items && (
        <ul className="space-y-3 mb-4">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300">
              <span className="text-primary text-lg flex-shrink-0 mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-primary/20">
          {typeof footer === 'string' ? (
            <p className="text-xs text-gray-400">{footer}</p>
          ) : footer}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, icon = "📊", color = "text-primary" }) {
  return (
    <div className="bg-black/50 border-2 border-primary/30 rounded-xl p-5 text-center hover:scale-105 transition-all">
      <div className="text-3xl mb-2">{icon}</div>
      <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}
