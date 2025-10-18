// frontend/src/heartbeat.js
import axios from "axios";

let timer = null;
let started = false;

export function startHeartbeat() {
  if (started) return;
  started = true;

  const send = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // pas connecté
      await axios.post("/api/presence/heartbeat");
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
}
