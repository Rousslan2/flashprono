import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { emitUserUpdate, getStoredUser } from "../utils/userSync";
import socket from "../services/socket";

export default function Admin() {
  const token = localStorage.getItem("token");
  const [tab, setTab] = useState("stats"); // stats | add | list | users | online
  const [editingId, setEditingId] = useState(null);

  // ---- STATS ----
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // ---- FORM AJOUT/MODIF PRONO ----
  const [form, setForm] = useState({
    label: "standard",
    details: "",
    audioUrl: "",
    sport: "Football",
    date: new Date().toISOString().slice(0, 16), // input datetime-local
    equipe1: "",
    equipe2: "",
    type: "1N2",
    cote: "",
    resultat: "En attente",
  });

  // ---- LISTE PRONOS ----
  const [pronos, setPronos] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // ---- USERS ----
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // ---- ONLINE ----
  const [online, setOnline] = useState({ users: [], count: 0, loading: false, timestamp: null });
  const onlineIvRef = useRef(null);

  // 🎙️ Upload audio
  const uploadAudio = async (file) => {
    const fd = new FormData();
    fd.append("audio", file);
    const token = localStorage.getItem("token");
    const { data } = await axios.post(`${API_BASE}/api/admin/upload/audio`, fd, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.url; // ex: /uploads/audio/xxx.mp3
  };

  // ===== API =====
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      const { data } = await axios.get(`${API_BASE}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(data);
    } catch {
      alert("Erreur chargement stats admin");
    } finally {
      setLoadingStats(false);
    }
  };

  const loadPronos = async () => {
    try {
      setLoadingList(true);
      const { data } = await axios.get(`${API_BASE}/api/admin/pronostics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPronos(data);
    } catch {
      alert("Erreur chargement pronostics");
    } finally {
      setLoadingList(false);
    }
  };

  const loadUsers = async (page = 1) => {
    try {
      setLoadingUsers(true);
      const { data } = await axios.get(
        `${API_BASE}/api/admin/users?page=${page}&limit=25`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(data.items || []);
      setUsersPage(data.page);
      setUsersPages(data.pages);
    } catch {
      alert("Erreur chargement utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadOnline = async () => {
    try {
      setOnline((o) => ({ ...o, loading: true }));
      const { data } = await axios.get(`${API_BASE}/api/admin/online-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOnline({
        users: data.users || [],
        count: data.count || 0,
        timestamp: data.timestamp || new Date(),
        loading: false,
      });
    } catch (err) {
      console.error('❌ Erreur online users:', err);
      setOnline((o) => ({ ...o, loading: false }));
    }
  };

  // Load initial datasets (stats + pronos + users page 1)
  useEffect(() => {
    loadStats();
    loadPronos();
    loadUsers(1);
    
    // 🔥 ÉCOUTER LES ÉVÉNEMENTS SOCKET.IO (TOUJOURS ACTIFS)
    const handleUserUpdate = (updatedUser) => {
      console.log('🔄 User updated:', updatedUser.name);
      setUsers(prev => prev.map(u => u._id === updatedUser._id ? updatedUser : u));
    };
    
    const handlePronoCreated = () => {
      console.log('✨ Prono created');
      loadStats();
      loadPronos();
    };
    
    const handlePronoUpdated = () => {
      console.log('✏️ Prono updated');
      loadPronos();
    };
    
    const handlePronoDeleted = () => {
      console.log('🗑️ Prono deleted');
      loadStats();
      loadPronos();
    };
    
    const handleConnectionNew = (newEntry) => {
      console.log('🔥 NEW CONNECTION:', newEntry.userName, newEntry.action);
      // Ne rien faire, juste logger
    };
    
    const handleOnlineUpdate = () => {
      console.log('🟢 Online update');
      if (tab === 'online') {
        loadOnline();
      }
    };
    
    socket.on('user:updated', handleUserUpdate);
    socket.on('prono:created', handlePronoCreated);
    socket.on('prono:updated', handlePronoUpdated);
    socket.on('prono:deleted', handlePronoDeleted);
    socket.on('connection:new', handleConnectionNew);
    socket.on('online:update', handleOnlineUpdate);
    
    return () => {
      socket.off('user:updated', handleUserUpdate);
      socket.off('prono:created', handlePronoCreated);
      socket.off('prono:updated', handlePronoUpdated);
      socket.off('prono:deleted', handlePronoDeleted);
      socket.off('connection:new', handleConnectionNew);
      socket.off('online:update', handleOnlineUpdate);
    };
  }, [tab]); // Dépend de tab pour recharger online

  // Auto-refresh online tab every 15s when visible
  useEffect(() => {
    if (tab === "online") {
      loadOnline();
      onlineIvRef.current = setInterval(loadOnline, 15000);
    }
    
    return () => {
      if (onlineIvRef.current) {
        clearInterval(onlineIvRef.current);
        onlineIvRef.current = null;
      }
    };
  }, [tab]);

  // ===== HANDLERS =====
  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createProno = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
        cote: Number(form.cote),
      };

      let data;
      if (editingId) {
        // Mise à jour
        const resp = await axios.put(
          `${API_BASE}/api/admin/pronostics/${editingId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = resp.data;
        alert("Pronostic mis à jour ✅");
        setPronos((prev) => prev.map((p) => (p._id === editingId ? data : p)));
        setEditingId(null);
      } else {
        // Création
        const resp = await axios.post(
          `${API_BASE}/api/admin/pronostics`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        data = resp.data;
        alert("Pronostic ajouté ✅");
        setPronos((prev) => [data, ...prev]);
      }

      // reset minimal
      setForm((f) => ({
        ...f,
        equipe1: "",
        equipe2: "",
        cote: "",
        resultat: "En attente",
        details: "",
        audioUrl: "",
        label: "standard",
      }));
      setTab("list");
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur ajout/pronostic");
    }
  };

  const deleteProno = async (id) => {
    if (!confirm("Supprimer ce pronostic ?")) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/pronostics/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPronos((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert("Erreur suppression");
    }
  };

  // Actions user
  const act = async (id, url, body = {}) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE}/api/admin/users/${id}/${url}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      
      // 🔥 Si c'est l'utilisateur connecté, forcer un rechargement complet
      const currentUser = getStoredUser();
      if (currentUser && currentUser._id === id) {
        // Mettre à jour le localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Émettre l'événement ET recharger la page
        emitUserUpdate(data.user);
        
        // Message avant rechargement
        alert("✅ Changements appliqués ! La page va se recharger...");
        
        // Rechargement après un court délai
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return; // Sortir pour éviter l'alerte en double
      }
      
      alert("Action effectuée ✅");
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur action admin");
    }
  };
  
  const banUser = (id) => act(id, "ban");
  const unbanUser = (id) => act(id, "unban");
  const makeAdmin = (id) => act(id, "make-admin");
  const removeAdmin = (id) => act(id, "remove-admin");
  const grantMonthly = (id) => act(id, "grant-subscription", { plan: "monthly" });
  const grantYearly = (id) => act(id, "grant-subscription", { plan: "yearly" });
  const revokeSub = (id) => act(id, "revoke-subscription");
  
  // 🔥 NOUVEAU : Modifier les jours d'abonnement
  const modifyDays = async (id) => {
    const days = prompt("📆 Nombre de jours à ajouter ou retirer (ex: 7 ou -7) :");
    if (!days || isNaN(days)) return;
    
    try {
      const { data } = await axios.patch(
        `${API_BASE}/api/admin/users/${id}/modify-subscription-days`,
        { days: parseInt(days) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      
      // Si c'est l'utilisateur connecté, forcer rechargement
      const currentUser = getStoredUser();
      if (currentUser && currentUser._id === id) {
        localStorage.setItem('user', JSON.stringify(data.user));
        emitUserUpdate(data.user);
        alert(`${days > 0 ? '+' : ''}${days} jours appliqués ✅ La page va se recharger...`);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }
      
      alert(`${days > 0 ? '+' : ''}${days} jours appliqués ✅`);
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur modification");
    }
  };
  
  // 🗑️ NOUVEAU : Supprimer un utilisateur
  const deleteUser = async (id) => {
    const userName = users.find(u => u._id === id)?.name || 'cet utilisateur';
    if (!confirm(`⚠️ Êtes-vous sûr de vouloir SUPPRIMER COMPLÈTEMENT le compte de ${userName} ? Cette action est IRRÉVERSIBLE !`)) return;
    
    try {
      await axios.delete(
        `${API_BASE}/api/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert("🗑️ Utilisateur supprimé avec succès");
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur suppression");
    }
  };

  // ===== RENDER =====
  return (
    <section className="py-12">
      <h1 className="text-3xl font-extrabold text-primary mb-6 text-center">
        Panneau d’administration
      </h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <Tab tab={tab} id="stats" setTab={setTab}>
          Statistiques
        </Tab>
        <Tab tab={tab} id="add" setTab={setTab}>
          Ajouter un pronostic
        </Tab>
        <Tab tab={tab} id="list" setTab={setTab}>
          Liste des pronostics
        </Tab>
        <Tab tab={tab} id="manual-scores" setTab={setTab}>
          Scores manuels
        </Tab>
        <Tab tab={tab} id="users" setTab={setTab}>
          Utilisateurs
        </Tab>
        <Tab tab={tab} id="online" setTab={setTab}>
          En ligne ({online.count})
        </Tab>
      </div>

      {/* STATS */}
      {tab === "stats" && (
        <div className="max-w-5xl mx-auto">
          {loadingStats ? (
            <p className="text-center text-gray-400">Chargement des stats…</p>
          ) : (
            <>
              <div className="grid md:grid-cols-4 gap-4">
                <StatCard label="Utilisateurs" value={stats?.totalUsers} />
                <StatCard label="Abonnés actifs" value={stats?.activeSubs} />
                <StatCard label="Essais actifs" value={stats?.trialActive} />
                <StatCard label="Pronostics" value={stats?.totalPronos} />
              </div>

              {/* 🔍 NOUVEAU : Boutons de vérification */}
              <div className="mt-10 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/30 rounded-2xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  <span className="text-4xl">⚽</span>
                  Vérification des scores
                </h3>
                <p className="text-gray-400 mb-6">
                  Mettre à jour manuellement les scores et résultats des pronostics
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Bouton 1 : Vérif rapide */}
                  <button
                    onClick={async () => {
                      if (!confirm("🔄 Vérifier les pronos d'aujourd'hui + hier ?")) return;
                      try {
                        const { data } = await axios.post(
                          `${API_BASE}/api/pronostics/check-results`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        alert(`✅ ${data.updated} prono(s) mis à jour sur ${data.checked} vérifié(s) !`);
                        loadStats();
                      } catch (e) {
                        alert(e?.response?.data?.message || "Erreur vérification");
                      }
                    }}
                    className="group relative bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/40 rounded-xl p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-blue-500/30 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative z-10 text-left">
                      <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">🔄</div>
                      <h4 className="text-xl font-bold text-white mb-2">Vérification rapide</h4>
                      <p className="text-gray-400 text-sm">Vérifie les matchs d'aujourd'hui + hier uniquement</p>
                      <div className="mt-4 px-4 py-2 bg-blue-500/20 rounded-lg text-blue-300 text-xs font-semibold inline-block">
                        ⏱️ ~5 secondes
                      </div>
                    </div>
                  </button>

                  {/* Bouton 2 : Vérif complète */}
                  <button
                    onClick={async () => {
                      if (!confirm("🔍 Vérifier TOUS les pronos en attente (toutes dates) ?\n\n⚠️ Attention : Peut prendre plusieurs minutes si beaucoup de pronos !")) return;
                      try {
                        alert("⏳ Vérification en cours... Cela peut prendre quelques minutes. Ne fermez pas cette page !");
                        const { data } = await axios.post(
                          `${API_BASE}/api/pronostics/check-all-pending`,
                          {},
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        alert(`✅ ${data.message}\n\nVérifiés : ${data.checked}\nMis à jour : ${data.updated}\nDates traitées : ${data.dates}`);
                        loadStats();
                      } catch (e) {
                        alert(e?.response?.data?.message || "Erreur vérification complète");
                      }
                    }}
                    className="group relative bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-2 border-emerald-500/40 rounded-xl p-6 hover:scale-105 transition-all hover:shadow-2xl hover:shadow-emerald-500/30 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <div className="relative z-10 text-left">
                      <div className="text-4xl mb-3 group-hover:scale-125 transition-transform">🔍</div>
                      <h4 className="text-xl font-bold text-white mb-2">Vérification complète</h4>
                      <p className="text-gray-400 text-sm">Vérifie TOUS les pronos en attente, date par date</p>
                      <div className="mt-4 px-4 py-2 bg-emerald-500/20 rounded-lg text-emerald-300 text-xs font-semibold inline-block">
                        ⏱️ 1-5 minutes
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm flex items-start gap-2">
                    <span className="text-xl flex-shrink-0">⚠️</span>
                    <span>
                      <strong>Note :</strong> La vérification complète fait une requête API par date. 
                      Si vous avez des pronos sur 10 dates différentes, cela fera 10 requêtes (avec délai de 500ms entre chaque).
                    </span>
                  </p>
                </div>
              </div>

              <h3 className="text-xl mt-10 mb-3 text-primary">Derniers inscrits</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="py-2">Nom</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Inscription</th>
                      <th className="py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentUsers?.map((u) => (
                      <tr key={u._id} className="border-t border-[#222]">
                        <td className="py-2">{u.name}</td>
                        <td className="py-2">{u.email}</td>
                        <td className="py-2">
                          {new Date(u.createdAt).toLocaleString()}
                        </td>
                        <td className="py-2">{u.subscription?.status || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* HISTORIQUE DES CONNEXIONS */}
      {tab === "history" && (
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white">📜 Historique des connexions</h3>
              <p className="text-gray-400 text-sm mt-1">Toutes les connexions enregistrées</p>
            </div>
            <button
              onClick={() => loadHistory(1)}
              className="px-4 py-2 bg-primary/20 border border-primary rounded-lg hover:bg-primary/30 transition"
            >
              🔄 Actualiser
            </button>
          </div>

          {loadingHistory ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">⏳</div>
              <p className="text-gray-400">Chargement de l'historique...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-gray-400">Aucune connexion enregistrée</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-red-500/30 rounded-2xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-gray-700">
                        <th className="py-3 px-2">Date & Heure</th>
                        <th className="py-3 px-2">Utilisateur</th>
                        <th className="py-3 px-2">Email</th>
                        <th className="py-3 px-2">Action</th>
                        <th className="py-3 px-2">IP</th>
                        <th className="py-3 px-2">Navigateur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h) => (
                        <tr key={h._id} className="border-b border-gray-800 hover:bg-gray-900/50 transition">
                          <td className="py-3 px-2 text-white">
                            <div className="font-semibold">
                              {new Date(h.timestamp).toLocaleDateString('fr-FR')}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(h.timestamp).toLocaleTimeString('fr-FR')}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-white font-semibold">
                            {h.userName}
                          </td>
                          <td className="py-3 px-2 text-gray-400 text-xs">
                            {h.userEmail}
                          </td>
                          <td className="py-3 px-2">
                            {h.action === 'login' ? (
                              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-semibold">
                                🟢 Connexion
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold">
                                🔴 Déconnexion
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-2 text-gray-400 text-xs font-mono">
                            {h.ipAddress || '—'}
                          </td>
                          <td className="py-3 px-2 text-gray-400 text-xs max-w-xs truncate" title={h.userAgent}>
                            {h.userAgent ? (
                              h.userAgent.includes('Chrome') ? '🌐 Chrome' :
                              h.userAgent.includes('Firefox') ? '🦊 Firefox' :
                              h.userAgent.includes('Safari') ? '🧭 Safari' :
                              h.userAgent.includes('Edge') ? '⚡ Edge' :
                              '🌐 Autre'
                            ) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-gray-400 text-sm">
                  Page {historyPage} sur {historyPages}
                </div>
                <div className="flex gap-3">
                  <button
                    disabled={historyPage <= 1}
                    onClick={() => loadHistory(historyPage - 1)}
                    className="px-4 py-2 rounded-lg bg-black border-2 border-primary/30 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 transition"
                  >
                    ← Précédent
                  </button>
                  <button
                    disabled={historyPage >= historyPages}
                    onClick={() => loadHistory(historyPage + 1)}
                    className="px-4 py-2 rounded-lg bg-black border-2 border-primary/30 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-900 transition"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ADD/MODIF PRONO */}
      {tab === "add" && (
        <form
          onSubmit={createProno}
          className="max-w-3xl mx-auto bg-black p-6 rounded-xl border border-primary"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Sport">
              <select
                name="sport"
                value={form.sport}
                onChange={onChange}
                className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2"
              >
                <option>Football</option>
                <option>Basketball</option>
                <option>Tennis</option>
                <option>Rugby</option>
                <option>Autre</option>
              </select>
            </Field>
            <Field label="Date & heure">
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={onChange}
                className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2"
              />
            </Field>
            <Field label="Équipe 1">
              <input
                name="equipe1"
                value={form.equipe1}
                onChange={onChange}
                className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2"
              />
            </Field>
            <Field label="Équipe 2">
              <input
                name="equipe2"
                value={form.equipe2}
                onChange={onChange}
                className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2"
              />
            </Field>
            <Field label="Type (ex: 1N2, Over/Under, BTTS)">
              <input
                name="type"
                value={form.type}
                onChange={onChange}
                className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2"
              />
            </Field>
            <Field label="Cote">
              <input
                type="number"
                step="0.01"
                name="cote"
                value={form.cote}
                onChange={onChange}
                className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2"
              />
            </Field>
            <Field className="md:col-span-2" label="Résultat">
              <input
                name="resultat"
                value={form.resultat}
                onChange={onChange}
                className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2"
              />
            </Field>
          </div>

          {/* Section */}
          <label className="block mt-4">Section</label>
          <select
            className="w-full bg-[#0b0b0b] border border-[#222] p-2 rounded"
            value={form.label}
            onChange={(e) =>
              setForm((f) => ({ ...f, label: e.target.value }))
            }
          >
            <option value="standard">Standard</option>
            <option value="prono_en_or">Prono en or</option>
            <option value="strategie_bankroll">Stratégie bankroll</option>
          </select>

          {/* Détails */}
          <label className="block mt-3">Détails / Analyse</label>
          <textarea
            rows="5"
            className="w-full bg-[#0b0b0b] border border-[#222] p-2 rounded"
            placeholder="Analyse, justification, points clés..."
            value={form.details}
            onChange={(e) =>
              setForm((f) => ({ ...f, details: e.target.value }))
            }
          ></textarea>

          {/* Vocal */}
          <label className="block mt-3">Vocal (MP3/WAV/M4A/OGG)</label>
          <input
            type="file"
            accept=".mp3,.wav,.m4a,.ogg"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const url = await uploadAudio(file);
                setForm((f) => ({ ...f, audioUrl: url }));
                alert("Audio uploadé ✅");
              } catch (err) {
                alert(
                  err?.response?.data?.message || "Upload audio échoué"
                );
              }
            }}
          />
          {form.audioUrl && (
            <audio controls className="mt-2 w-full">
              <source src={`${API_BASE}${form.audioUrl}`} />
            </audio>
          )}

          <button
            type="submit"
            className="mt-6 bg-primary text-black px-6 py-2 rounded-lg font-semibold hover:scale-105"
          >
            {editingId ? "Mettre à jour" : "Enregistrer"}
          </button>
        </form>
      )}

      {/* LISTE PRONOS */}
      {tab === "list" && (
        <div className="max-w-5xl mx-auto">
          {loadingList ? (
            <p className="text-center text-gray-400">Chargement…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-2">Date</th>
                    <th className="py-2">Sport</th>
                    <th className="py-2">Match</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Cote</th>
                    <th className="py-2">Résultat</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {pronos.map((p) => (
                    <tr key={p._id} className="border-t border-[#222]">
                      <td className="py-2">{new Date(p.date).toLocaleString()}</td>
                      <td className="py-2">{p.sport}</td>
                      <td className="py-2">
                        {p.equipe1} vs {p.equipe2}
                      </td>
                      <td className="py-2">{p.type}</td>
                      <td className="py-2">{p.cote}</td>
                      <td className="py-2">{p.resultat}</td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => {
                            setEditingId(p._id);
                            setForm({
                              label: p.label || "standard",
                              details: p.details || "",
                              audioUrl: p.audioUrl || "",
                              sport: p.sport || "Football",
                              date: p.date
                                ? new Date(p.date).toISOString().slice(0, 16)
                                : new Date().toISOString().slice(0, 16),
                              equipe1: p.equipe1 || "",
                              equipe2: p.equipe2 || "",
                              type: p.type || "1N2",
                              cote: p.cote ? String(p.cote) : "",
                              resultat: p.resultat || "En attente",
                            });
                            setTab("add");
                          }}
                          className="text-yellow-400 hover:text-yellow-300 mr-2"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteProno(p._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SCORES MANUELS - NOUVEAU */}
      {tab === "manual-scores" && (
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-4xl">✏️</span>
              Modifier les scores manuellement
            </h3>
            <p className="text-gray-400 mb-4">
              Pour les matchs que l'API ne trouve pas (dates trop anciennes, ligues non couvertes), entre le score final manuellement.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm flex items-start gap-2">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <span>
                  <strong>Note :</strong> Le résultat (gagnant/perdu) sera calculé automatiquement selon le type de pari et le score que tu entres.
                </span>
              </p>
            </div>
          </div>

          {loadingList ? (
            <p className="text-center text-gray-400">Chargement…</p>
          ) : (
            <div className="space-y-4">
              {pronos.filter(p => p.statut === "en attente" || p.statut === "en cours").map((p) => (
                <ManualScoreCard key={p._id} prono={p} onUpdate={() => loadPronos()} token={token} />
              ))}
              
              {pronos.filter(p => p.statut === "en attente" || p.statut === "en cours").length === 0 && (
                <div className="text-center py-20">
                  <div className="text-7xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-white mb-2">Tous les pronos sont à jour !</h3>
                  <p className="text-gray-400">Aucun prono en attente nécessitant une mise à jour manuelle.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* UTILISATEURS */}
      {tab === "users" && (
        <div className="max-w-6xl mx-auto">
          {loadingUsers ? (
            <p className="text-center text-gray-400">
              Chargement des utilisateurs…
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-400">
                      <th className="py-2">Nom</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Rôle</th>
                      <th className="py-2">Banni</th>
                      <th className="py-2">Abonnement</th>
                      <th className="py-2">Expire</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const sub = u.subscription || {};
                      return (
                        <tr key={u._id} className="border-t border-[#222]">
                          <td className="py-2">{u.name}</td>
                          <td className="py-2">{u.email}</td>
                          <td className="py-2">
                            {u.isAdmin ? "Admin" : "Membre"}
                          </td>
                          <td className="py-2">{u.isBanned ? "Oui" : "Non"}</td>
                          <td className="py-2">
                            {sub?.status === "active"
                              ? sub.plan === "yearly"
                                ? "Annuel"
                                : "Mensuel"
                              : sub?.status === "trial"
                              ? "Essai"
                              : "—"}
                          </td>
                          <td className="py-2">
                            {sub?.expiresAt
                              ? new Date(sub.expiresAt).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-2 text-right">
                            <div className="flex flex-wrap gap-2 justify-end">
                              {u.isBanned ? (
                                <Btn
                                  onClick={() => unbanUser(u._id)}
                                  label="Débannir"
                                  variant="green"
                                />
                              ) : (
                                <Btn
                                  onClick={() => banUser(u._id)}
                                  label="Bannir"
                                  variant="red"
                                />
                              )}
                              {u.isAdmin ? (
                                <Btn
                                  onClick={() => removeAdmin(u._id)}
                                  label="Retirer admin"
                                  variant="gray"
                                />
                              ) : (
                                <Btn
                                  onClick={() => makeAdmin(u._id)}
                                  label="Promouvoir admin"
                                  variant="yellow"
                                />
                              )}
                              <Btn
                                onClick={() => grantMonthly(u._id)}
                                label="Donner 30j"
                                variant="primary"
                              />
                              <Btn
                                onClick={() => grantYearly(u._id)}
                                label="Donner 365j"
                                variant="primary"
                              />
                              <Btn
                                onClick={() => modifyDays(u._id)}
                                label="📆 Modifier jours"
                                variant="blue"
                              />
                              <Btn
                                onClick={() => revokeSub(u._id)}
                                label="Révoquer abo"
                                variant="gray"
                              />
                              <Btn
                                onClick={() => deleteUser(u._id)}
                                label="🗑️ Supprimer"
                                variant="red"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination simple */}
              <div className="flex justify-end items-center gap-3 mt-4">
                <button
                  disabled={usersPage <= 1}
                  onClick={() => loadUsers(usersPage - 1)}
                  className="px-3 py-1 rounded bg-[#111] border border-primary disabled:opacity-50"
                >
                  ← Précédent
                </button>
                <span className="text-gray-400">
                  Page {usersPage} / {usersPages}
                </span>
                <button
                  disabled={usersPage >= usersPages}
                  onClick={() => loadUsers(usersPage + 1)}
                  className="px-3 py-1 rounded bg-[#111] border border-primary disabled:opacity-50"
                >
                  Suivant →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* EN LIGNE */}
      {tab === "online" && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl">🟢 Utilisateurs en ligne - Temps réel</h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">
                Actualisé il y a {online.timestamp ? Math.floor((Date.now() - new Date(online.timestamp).getTime()) / 1000) : 0}s
              </span>
              <span className="px-3 py-1.5 text-sm rounded-full bg-primary text-black font-semibold">
                {online.count} {online.count > 1 ? 'connectés' : 'connecté'}
              </span>
            </div>
          </div>
          {online.loading ? (
            <p className="text-gray-400">Actualisation…</p>
          ) : online.users.length === 0 ? (
            <p className="text-gray-400">Personne en ligne pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400">
                    <th className="py-2">Nom</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Rôle</th>
                    <th className="py-2">Vu</th>
                    <th className="py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {online.users.map((u) => {
                    const last = u.lastSeen ? new Date(u.lastSeen) : null;
                    const isOnline = last
                      ? Date.now() - last.getTime() < 2 * 60 * 1000
                      : false;
                    return (
                      <tr key={u._id} className="border-t border-[#222]">
                        <td className="py-2">{u.name}</td>
                        <td className="py-2">{u.email}</td>
                        <td className="py-2">{u.isAdmin ? "Admin" : "Membre"}</td>
                        <td className="py-2">
                          {last ? last.toLocaleTimeString() : "—"}
                        </td>
                        <td className="py-2">
                          <span
                            className={`inline-flex items-center gap-2 font-semibold ${
                              isOnline ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                isOnline ? "bg-green-400" : "bg-red-500"
                              }`}
                            ></span>
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Tab({ tab, id, setTab, children }) {
  const active = tab === id;
  return (
    <button
      onClick={() => setTab(id)}
      className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-red-500 to-orange-400 text-white shadow-xl"
          : "bg-black border-2 border-red-500/30 text-white hover:bg-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm mb-2 text-white font-semibold">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-red-500/30 rounded-2xl p-6 text-center hover:scale-105 transition-all">
      <div className="text-gray-400 text-sm mb-2">{label}</div>
      <div className="text-4xl font-extrabold text-white">{value ?? "—"}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  let cls = "bg-gray-500/20 text-gray-400 border-gray-500/30";
  if (s.includes("activ")) cls = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (s.includes("trial") || s.includes("essai")) cls = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${cls}`}>{status || "—"}</span>;
}

function Btn({ onClick, label, variant = "primary" }) {
  const styles = {
    primary: "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
    yellow: "bg-yellow-400/20 text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/30",
    gray: "bg-gray-600/20 text-gray-400 border-gray-600/30 hover:bg-gray-600/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
  }[variant];
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg border transition font-semibold text-xs ${styles}`}>
      {label}
    </button>
  );
}

function ManualScoreCard({ prono, onUpdate, token }) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (homeScore === "" || awayScore === "") {
      alert("⚠️ Entre un score valide pour les deux équipes");
      return;
    }

    if (!confirm(`✏️ Confirmer le score ${homeScore}-${awayScore} pour ${prono.equipe1} vs ${prono.equipe2} ?`)) return;

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${API_BASE}/api/admin/pronostics/${prono._id}/manual-score`,
        { 
          homeScore: parseInt(homeScore), 
          awayScore: parseInt(awayScore) 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Score mis à jour !\nRésultat : ${data.resultat}`);
      setHomeScore("");
      setAwayScore("");
      onUpdate();
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur mise à jour score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-500/30 rounded-xl p-6 hover:scale-[1.02] transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Info match */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold border border-yellow-500/30">
              ⏳ {prono.statut}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(prono.date).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <h4 className="text-xl font-bold text-white mb-1">
            {prono.equipe1} <span className="text-primary">vs</span> {prono.equipe2}
          </h4>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>🎯 Type: <span className="text-white font-semibold">{prono.type}</span></span>
            <span>•</span>
            <span>📊 Cote: <span className="text-yellow-400 font-bold">{prono.cote}</span></span>
          </div>
        </div>

        {/* Input scores */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <label className="block text-xs text-gray-400 mb-1">{prono.equipe1}</label>
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="0"
              className="w-16 px-3 py-2 bg-black border-2 border-blue-500/40 rounded-lg text-center text-white text-xl font-bold focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          <span className="text-3xl text-gray-600 font-bold mt-6">-</span>

          <div className="text-center">
            <label className="block text-xs text-gray-400 mb-1">{prono.equipe2}</label>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="0"
              className="w-16 px-3 py-2 bg-black border-2 border-blue-500/40 rounded-lg text-center text-white text-xl font-bold focus:border-blue-500 focus:outline-none"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || homeScore === "" || awayScore === ""}
            className="ml-3 mt-6 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-green-500/50"
          >
            {loading ? "⏳" : "✅"} Valider
          </button>
        </div>
      </div>
    </div>
  );
}
