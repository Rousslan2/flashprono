import axios from "axios";
import { API_BASE } from "./config";
import { isAuthenticated } from "./hooks/useAuth";

let intervalId = null;

export function startHeartbeat() {
  if (intervalId) return;
  const sendPing = async () => {
    if (!isAuthenticated()) return;
    const token = localStorage.getItem("token");
    try {
      await axios.post(`${API_BASE}/api/presence/heartbeat`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
    } catch {
      // on ignore les erreurs réseau
    }
  };
  sendPing();
  intervalId = setInterval(sendPing, 30_000); // toutes les 30 secondes
}

export function stopHeartbeat() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
