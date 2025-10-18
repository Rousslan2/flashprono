// frontend/src/heartbeat.js
import axios from "axios";
import { API_BASE } from "./config";
import { isAuthenticated } from "./hooks/useAuth";

let intervalId = null;

export function startHeartbeat() {
  if (intervalId) return;

  const ping = () => {
    if (!isAuthenticated()) return;
    const token = localStorage.getItem("token");
    const url = `${API_BASE}/api/presence/heartbeat`;
    const headers = { Authorization: `Bearer ${token}` };

    // ✅ Envoi “fire-and-forget” (ne bloque jamais l’UI)
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify({})], { type: "application/json" });
        // sendBeacon ne permet pas d'ajouter des headers → fallback si besoin
        const ok = navigator.sendBeacon(url, blob);
        if (ok) return;
      }
    } catch {}

    // Fallback Axios: timeout court, on n’attend pas (pas d’await)
    axios.post(url, {}, { headers, timeout: 4000 }).catch(() => {});
  };

  ping();
  intervalId = setInterval(ping, 30000); // 30s
}

export function stopHeartbeat() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}
