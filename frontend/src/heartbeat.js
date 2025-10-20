// frontend/src/heartbeat.js
import axios from "axios";
import { API_BASE } from "./config";

let timer = null;
let started = false;

export function startHeartbeat() {
  if (started) return;
  started = true;

  const send = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // pas connecté
      await axios.post(`${API_BASE}/api/presence/heartbeat`);
    } catch (e) {
      // silencieux
    }
  };

  // toutes les 10 secondes
  timer = setInterval(send, 10000);
  // ping immédiat au start
  send();

  // pause/reprise quand l'onglet change
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    send();
  });
  
  // 🔥 Déconnexion automatique quand l'utilisateur ferme la page
  window.addEventListener("beforeunload", async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    try {
      // Utiliser sendBeacon pour envoyer la requête même si la page se ferme
      const blob = new Blob([JSON.stringify({ token })], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE}/api/auth/logout`, blob);
    } catch (e) {
      // silencieux
    }
  });
}
