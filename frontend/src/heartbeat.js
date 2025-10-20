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
  
  // 🔥 Détecter la vraie fermeture de page (pas le refresh)
  let isReloading = false;
  
  // F5 ou Ctrl+R détecté
  window.addEventListener("keydown", (e) => {
    if ((e.key === "F5") || (e.ctrlKey && e.key === "r")) {
      isReloading = true;
    }
  });
  
  // Navigation interne détectée
  let isNavigating = false;
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link && link.href && link.href.includes(window.location.host)) {
      isNavigating = true;
    }
  });
  
  window.addEventListener("beforeunload", (e) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    // Si c'est un reload ou navigation interne, on n'enregistre pas
    if (isReloading || isNavigating) {
      sessionStorage.setItem("wasReloading", "true");
      return;
    }
    
    // Marquer qu'on ferme vraiment
    sessionStorage.setItem("isClosing", "true");
    
    try {
      // Envoyer la déconnexion
      const blob = new Blob([JSON.stringify({ token })], { type: 'application/json' });
      navigator.sendBeacon(`${API_BASE}/api/auth/logout`, blob);
    } catch (err) {
      // silencieux
    }
  });
  
  // Au chargement, vérifier si c'était un reload
  window.addEventListener("load", () => {
    const wasReloading = sessionStorage.getItem("wasReloading");
    const wasClosing = sessionStorage.getItem("isClosing");
    
    if (wasReloading) {
      // C'était un reload, pas une vraie fermeture
      console.log("🔄 Reload détecté");
      sessionStorage.removeItem("wasReloading");
    }
    
    if (wasClosing) {
      // La page s'est rechargée alors qu'on avait détecté une fermeture
      // = C'était finalement un reload
      sessionStorage.removeItem("isClosing");
    }
  });
}
