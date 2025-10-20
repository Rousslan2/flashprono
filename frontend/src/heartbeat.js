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
  
  // 🔥 NE PAS enregistrer de déconnexion automatique
  // On se base sur lastSeen (2 min d'inactivité = offline)
  // La déconnexion est enregistrée SEULEMENT si l'user clique sur "Se déconnecter"
}
