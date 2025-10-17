import React, { useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e)=>{
    e.preventDefault();
    setError(""); setLoading(true);
    try{
      const {data} = await axios.post(`${API_BASE}/api/auth/login`, {email,password});
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    }catch(err){
      const msg = err?.response?.data?.message || "Erreur réseau";
      setError(msg);
    }finally{ setLoading(false); }
  };

  return (
    <section className="container-mobile py-8 sm:py-12">
      <div className="max-w-md mx-auto card p-5 sm:p-6">
        <h1 className="text-center text-2xl sm:text-3xl font-extrabold text-[#38ff73]">Connexion</h1>
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input className="input mt-1" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-400">Mot de passe</label>
            <input type="password" className="input mt-1" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button className="btn btn-primary w-full py-3 text-base" disabled={loading}>
            {loading ? "Connexion…" : "Se connecter"}
          </button>
          <p className="text-center text-sm text-gray-400">
            Pas de compte ? <Link to="/register" className="text-[#38ff73]">Créer un compte</Link>
          </p>
        </form>
      </div>
    </section>
  );
}
