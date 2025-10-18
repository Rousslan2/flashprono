// frontend/src/pages/Admin.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function Admin() {
  const token = localStorage.getItem("token");
  const [tab, setTab] = useState("stats"); // stats | add | list | users
  const [editingId, setEditingId] = useState(null);

  // ---- STATS ----
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // ---- FORM ----
  const [form, setForm] = useState({
    label: "standard",
    details: "",
    audioUrl: "",
    sport: "Football",
    date: new Date().toISOString().slice(0, 16),
    equipe1: "",
    equipe2: "",
    type: "1N2",
    cote: "",
    resultat: "En attente",
    stake: 1,
    externalProvider: "",
    externalFixtureId: "",
  });

  // ---- LISTE PRONOS ----
  const [pronos, setPronos] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // ---- USERS ----
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Upload audio
  const uploadAudio = async (file) => {
    const fd = new FormData();
    fd.append("audio", file);
    const token = localStorage.getItem("token");
    const { data } = await axios.post(`${API_BASE}/api/admin/upload/audio`, fd, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.url;
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
      const { data } = await axios.get(`${API_BASE}/api/admin/users?page=${page}&limit=25`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data.items || []);
      setUsersPage(data.page);
      setUsersPages(data.pages);
    } catch {
      alert("Erreur chargement utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadPronos();
    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== HANDLERS =====
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createProno = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
        cote: Number(form.cote),
        stake: Number(form.stake) || 1,
        externalProvider: form.externalProvider || null,
        externalFixtureId: form.externalFixtureId || null,
      };
      let data;
      if (editingId) {
        const resp = await axios.put(`${API_BASE}/api/admin/pronostics/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = resp.data;
        alert("Pronostic mis à jour ✅");
        setPronos((prev) => prev.map((p) => (p._id === editingId ? data : p)));
        setEditingId(null);
      } else {
        const resp = await axios.post(`${API_BASE}/api/admin/pronostics`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = resp.data;
        alert("Pronostic ajouté ✅");
        setPronos((prev) => [data, ...prev]);
      }
      setForm((f) => ({
        ...f,
        equipe1: "",
        equipe2: "",
        cote: "",
        resultat: "En attente",
        details: "",
        audioUrl: "",
        label: "standard",
        stake: 1,
        externalProvider: "",
        externalFixtureId: "",
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

  const editProno = (p) => {
    setForm({
      label: p.label || "standard",
      details: p.details || "",
      audioUrl: p.audioUrl || "",
      sport: p.sport || "Football",
      date: p.date ? new Date(p.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      equipe1: p.equipe1 || "",
      equipe2: p.equipe2 || "",
      type: p.type || "1N2",
      cote: p.cote ? String(p.cote) : "",
      resultat: p.resultat || "En attente",
      stake: p.stake ?? 1,
      externalProvider: p.externalProvider || "",
      externalFixtureId: p.externalFixtureId || "",
    });
    setEditingId(p._id);
    setTab("add");
  };

  // Actions user
  const act = async (id, url, body = {}) => {
    try {
      const { data } = await axios.patch(`${API_BASE}/api/admin/users/${id}/${url}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
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

  return (
    <section className="py-12">
      <h1 className="text-3xl font-extrabold text-primary mb-6 text-center">Panneau d’administration</h1>

      <div className="flex flex-wrap gap-3 justify-center mb-8">
        <Tab tab={tab} id="stats" setTab={setTab}>Statistiques</Tab>
        <Tab tab={tab} id="add" setTab={setTab}>Ajouter un pronostic</Tab>
        <Tab tab={tab} id="list" setTab={setTab}>Liste des pronostics</Tab>
        <Tab tab={tab} id="users" setTab={setTab}>Utilisateurs</Tab>
      </div>

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
                        <td className="py-2">{new Date(u.createdAt).toLocaleString()}</td>
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

      {tab === "add" && (
        <form onSubmit={createProno} className="max-w-3xl mx-auto bg-black p-6 rounded-xl border border-primary">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Sport">
              <select name="sport" value={form.sport} onChange={onChange} className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2">
                <option>Football</option><option>Basketball</option><option>Tennis</option><option>Rugby</option><option>Autre</option>
              </select>
            </Field>
            <Field label="Date & heure">
              <input type="datetime-local" name="date" value={form.date} onChange={onChange} className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2" />
            </Field>
            <Field label="Équipe 1"><input name="equipe1" value={form.equipe1} onChange={onChange} className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2" /></Field>
            <Field label="Équipe 2"><input name="equipe2" value={form.equipe2} onChange={onChange} className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2" /></Field>
            <Field label="Type (ex: 1N2, Over/Under, BTTS)"><input name="type" value={form.type} onChange={onChange} className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2" /></Field>
            <Field label="Cote"><input type="number" step="0.01" name="cote" value={form.cote} onChange={onChange} className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2" /></Field>
            <Field className="md:col-span-2" label="Résultat"><input name="resultat" value={form.resultat} onChange={onChange} className="w-full bg-[#0c0c0c] border border-[#222] rounded-lg p-2" /></Field>
          </div>

          {/* Section */}
          <label className="block mt-4">Section</label>
          <select className="w-full bg-[#0b0b0b] border border-[#222] p-2 rounded" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}>
            <option value="standard">Standard</option>
            <option value="prono_en_or">Prono en or</option>
            <option value="strategie_bankroll">Stratégie bankroll</option>
          </select>

          {/* Détails */}
          <label className="block mt-3">Détails / Analyse</label>
          <textarea rows="5" className="w-full bg-[#0b0b0b] border border-[#222] p-2 rounded" placeholder="Analyse, justification, points clés..." value={form.details} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}></textarea>

          {/* Vocal */}
          <label className="block mt-3">Vocal (MP3/WAV/M4A/OGG)</label>
          <input type="file" accept=".mp3,.wav,.m4a,.ogg" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const url = await uploadAudio(file);
              setForm((f) => ({ ...f, audioUrl: url }));
              alert("Audio uploadé ✅");
            } catch (err) {
              alert(err?.response?.data?.message || "Upload audio échoué");
            }
          }} />
          {form.audioUrl && (<audio controls className="mt-2 w-full"><source src={`${API_BASE}${form.audioUrl}`} /></audio>)}

          {/* Stake / Provider / FixtureId */}
          <label className="block mt-4">Stake (unités)</label>
          <input type="number" step="0.1" min="0" className="w-full bg-[#0b0b0b] border border-[#222] p-2 rounded" value={form.stake} onChange={(e) => setForm((f) => ({ ...f, stake: e.target.value }))} />

          <label className="block mt-3">Fournisseur live</label>
          <select className="w-full bg-[#0b0b0b] border border-[#222] p-2 rounded" value={form.externalProvider} onChange={(e) => setForm((f) => ({ ...f, externalProvider: e.target.value }))}>
            <option value="">— Aucun —</option>
            <option value="apifootball">API-FOOTBALL</option>
            <option value="sportmonks">Sportmonks</option>
          </select>

          <label className="block mt-3">Fixture ID du match</label>
          <input className="w-full bg-[#0b0b0b] border border-[#222] p-2 rounded" placeholder="ex: 123456 (ID provider)" value={form.externalFixtureId} onChange={(e) => setForm((f) => ({ ...f, externalFixtureId: e.target.value }))} />

          <button type="submit" className="mt-6 bg-primary text-black px-6 py-2 rounded-lg font-semibold hover:scale-105">{editingId ? "Mettre à jour" : "Enregistrer"}</button>
        </form>
      )}

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
                      <td className="py-2">{p.equipe1} vs {p.equipe2}</td>
                      <td className="py-2">{p.type}</td>
                      <td className="py-2">{p.cote}</td>
                      <td className="py-2">{p.resultat}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => editProno(p)} className="text-yellow-400 hover:text-yellow-300 mr-2">Modifier</button>
                        <button onClick={() => deleteProno(p._id)} className="text-red-400 hover:text-red-300">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="max-w-6xl mx-auto">
          {loadingUsers ? (
            <p className="text-center text-gray-400">Chargement des utilisateurs…</p>
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
                          <td className="py-2">{u.isAdmin ? "Admin" : "Membre"}</td>
                          <td className="py-2">{u.isBanned ? "Oui" : "Non"}</td>
                          <td className="py-2">
                            {sub?.status === "active" ? (sub.plan === "yearly" ? "Annuel" : "Mensuel") : sub?.status === "trial" ? "Essai" : "—"}
                          </td>
                          <td className="py-2">{sub?.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : "—"}</td>
                          <td className="py-2 text-right">
                            <div className="flex flex-wrap gap-2 justify-end">
                              {u.isBanned ? (
                                <Btn onClick={() => unbanUser(u._id)} label="Débannir" variant="green" />
                              ) : (
                                <Btn onClick={() => banUser(u._id)} label="Bannir" variant="red" />
                              )}
                              {u.isAdmin ? (
                                <Btn onClick={() => removeAdmin(u._id)} label="Retirer admin" variant="gray" />
                              ) : (
                                <Btn onClick={() => makeAdmin(u._id)} label="Promouvoir admin" variant="yellow" />
                              )}
                              <Btn onClick={() => grantMonthly(u._id)} label="Donner 30j" variant="primary" />
                              <Btn onClick={() => grantYearly(u._id)}  label="Donner 365j" variant="primary" />
                              <Btn onClick={() => revokeSub(u._id)} label="Révoquer abo" variant="gray" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end items-center gap-3 mt-4">
                <button disabled={usersPage <= 1} onClick={() => loadUsers(usersPage - 1)} className="px-3 py-1 rounded bg-[#111] border border-primary disabled:opacity-50">← Précédent</button>
                <span className="text-gray-400">Page {usersPage} / {usersPages}</span>
                <button disabled={usersPage >= usersPages} onClick={() => loadUsers(usersPage + 1)} className="px-3 py-1 rounded bg-[#111] border border-primary disabled:opacity-50">Suivant →</button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

function Tab({ tab, id, setTab, children }) {
  const active = tab === id;
  return (
    <button onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg ${active ? "bg-primary text-black" : "bg-black border border-primary text-white"}`}>
      {children}
    </button>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-sm mb-1 text-gray-300">{label}</label>
      {children}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-black p-5 rounded-xl border border-primary text-center">
      <div className="text-gray-400 text-sm">{label}</div>
      <div className="text-3xl font-bold text-white mt-1">{value ?? "—"}</div>
    </div>
  );
}

function Btn({ onClick, label, variant = "primary" }) {
  const styles = {
    primary: "bg-primary text-black",
    red: "bg-red-500/90 text-white",
    green: "bg-green-500/90 text-white",
    yellow: "bg-yellow-400 text-black",
    gray: "bg-gray-600 text-white",
  }[variant];
  return <button onClick={onClick} className={`px-3 py-1 rounded ${styles} hover:opacity-90`}>{label}</button>;
}
