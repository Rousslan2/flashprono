import { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Register() {
  const [params] = useSearchParams();
  const plan = params.get("plan") || "";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      // 1) Créer le compte
      await axios.post(`${API_BASE}/api/auth/register`, { name, email, password });
      // 2) Login auto
      const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 3) Redirige : si un plan a été choisi, envoie sur /abonnements pour payer
      if (plan && plan !== "trial") {
        navigate("/abonnements");
      } else {
        navigate("/dashboard");
      }
    } catch (e) {
      alert("Inscription impossible (email déjà utilisé ?).");
    }
  };

  return (
    <section className="py-20 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6 text-center">Créer un compte</h1>
      <div className="bg-black p-6 rounded-xl border border-primary">
        <label className="block mb-3">
          <span className="text-sm text-gray-300">Nom</span>
          <input
            className="w-full mt-1 px-3 py-2 rounded bg-[#111] text-white outline-none"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Votre nom"
          />
        </label>
        <label className="block mb-3">
          <span className="text-sm text-gray-300">Email</span>
          <input
            type="email"
            className="w-full mt-1 px-3 py-2 rounded bg-[#111] text-white outline-none"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
          />
        </label>
        <label className="block mb-6">
          <span className="text-sm text-gray-300">Mot de passe</span>
          <input
            type="password"
            className="w-full mt-1 px-3 py-2 rounded bg-[#111] text-white outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button className="w-full bg-primary text-black font-semibold rounded-lg py-2" onClick={submit}>
          S’inscrire
        </button>

        <p className="text-gray-400 mt-4 text-center">
          Déjà un compte ? <a href={`/login${plan ? `?plan=${plan}` : ""}`} className="text-primary underline">Se connecter</a>
        </p>
      </div>
    </section>
  );
}
