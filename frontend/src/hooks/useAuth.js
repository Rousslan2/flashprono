export function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
}

// ➕ Abonnement actif OU essai en cours
export function isSubscriptionActive() {
  const user = getUser();
  const sub = user?.subscription;
  if (!sub || !sub.expiresAt) return false;
  const notExpired = new Date(sub.expiresAt) > new Date();
  return notExpired && (sub.status === "active" || sub.status === "trial");
}
