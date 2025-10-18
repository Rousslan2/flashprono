// frontend/src/heartbeat.js
import { API_BASE } from "./config";
import { isAuthenticated } from "./hooks/useAuth";

let intervalId = null;

export function startHeartbeat() {
  if (intervalId) return;

  const ping = () => {
    if (!isAuthenticated()) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch(`${API_BASE}/api/presence/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: "{}",
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {}).finally(() => clearTimeout(timeout));
  };

  ping();
  intervalId = setInterval(ping, 10_000);
}

export function stopHeartbeat() {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
}
