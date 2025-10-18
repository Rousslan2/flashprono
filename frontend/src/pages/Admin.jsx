import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";

export default function Admin() {
  const token = localStorage.getItem("token");
  const [tab, setTab] = useState("stats");
  const [editingId, setEditingId] = useState(null);

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
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
  });

  const [pronos, setPronos] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPages, setUsersPages] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [online, setOnline] = useState({ users: [], count: 0, loading: false });

  const uploadAudio = async (file) => {
    const fd = new FormData();
    fd.append("audio", file);
    const token = localStorage.getItem("token");
    const { data } = await axios.post(`${API_BASE}/api/admin/upload/audio`, fd, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data.url;
  };

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

  const loadOnline = async () => {
    try {
      setOnline((o) => ({ ...o, loading: true }));
      const { data } = await axios.get(`${API_BASE}/api/admin/online-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOnline({
        users: data.users || [],
        count: data.count || 0,
        loading: false,
      });
    } catch {
      setOnline((o) => ({ ...o, loading: false }));
      alert("Erreur chargement des utilisateurs en ligne");
    }
  };

  useEffect(() => {
    loadStats();
    loadPronos();
    loadUsers(1);
  }, []);

  useEffect(() => {
    if (tab !== "online") return;
    loadOnline();
    const iv = setInterval(loadOnline, 15000);
    return () => clearInterval(iv);
  }, [tab]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createProno = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, date: new Date(form.date).toISOString(), cote: Number(form.cote) };
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
        <Tab tab={tab} id="online" setTab={setTab}>En ligne</Tab>
      </div>

      {tab === "online" && (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl">Utilisateurs en ligne (≤ 2 min)</h3>
            <span className="px-2 py-1 text-sm rounded bg-primary text-black font-semibold">{online.count} en ligne</span>
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
                    const isOnline = last ? (Date.now() - last.getTime()) < 2 * 60 * 1000 : false;
                    return (
                      <tr key={u._id} className="border-t border-[#222]">
                        <td className="py-2">{u.name}</td>
                        <td className="py-2">{u.email}</td>
                        <td className="py-2">{u.isAdmin ? "Admin" : "Membre"}</td>
                        <td className="py-2">{last ? last.toLocaleTimeString() : "—"}</td>
                        <td className="py-2">
                          <span className={`inline-flex items-center gap-2 font-semibold ${isOnline ? "text-green-400" : "text-red-400"}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-400" : "bg-red-500"}`}></span>
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
    <button onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg ${active ? "bg-primary text-black" : "bg-black border border-primary text-white"}`}>
      {children}
    </button>
  );
}
