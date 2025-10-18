import axios from "axios";
import { API_BASE } from "./config";

axios.defaults.baseURL = API_BASE;
axios.defaults.timeout = 7000; // ⏳ Moins long = plus réactif (7s au lieu de 15s)

// 🔐 Ajout automatique du token s’il existe
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ⚠️ Gestion claire des erreurs
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    // 401 = non autorisé → session expirée
    if (status === 401) {
      console.warn("Session expirée ou non autorisée");
    }

    // ❌ Timeout, réseau ou erreur serveur
    if (err.code === "ECONNABORTED" || !err.response) {
      console.warn("⏱️ Serveur injoignable ou trop lent");
    }

    return Promise.reject(err);
  }
);

console.log(`[FlashProno] Axios initialisé → ${API_BASE}`);
