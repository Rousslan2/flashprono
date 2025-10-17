import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../config";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, form, { timeout: 15000 });
      if (!data?.token || !data?.user) throw new Error("Réponse inattendue du serveur.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-update"));
      navigate(next, { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Échec de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">Connexion</h1>

      <form onSubmit={onSubmit} className="bg-black p-6 rounded-xl border border-primary">
        <label className="block text-sm text-gray-300 mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          className="w-full mb-4 p-2 rounded-lg bg-[#0c0c0c] border border-[#222]"
          required
        />

        <label className="block text-sm text-gray-300 mb-1">Mot de passe</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={onChange}
          className="w-full mb-6 p-2 rounded-lg bg-[#0c0c0c] border border-[#222]"
          required
        />

        {err && <p className="text-red-400 mb-4">{err}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-black px-4 py-2 rounded-lg font-semibold hover:scale-105 transition disabled:opacity-60"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </section>
  );
}
