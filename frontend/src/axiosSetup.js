
import axios from "axios";
import { API_BASE } from "./config";

axios.defaults.baseURL = API_BASE;
axios.defaults.timeout = 15000;

// Inclure le token si présent
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    // Stopper tout "chargement infini" côté UI en exposant des erreurs claires
    const status = err?.response?.status;
    if (status === 401) {
      // Token expiré → on peut nettoyer
      // localStorage.removeItem("token");
      // localStorage.removeItem("user");
    }
    return Promise.reject(err);
  }
);

console.log("[FlashProno] Axios configuré →", API_BASE);
