import { useState, useEffect } from 'react';
import { listenUserUpdate } from '../utils/userSync';
import axios from 'axios';
import { API_BASE } from '../config';

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

export async function logout() {
  // 🔥 Appeler la route de déconnexion
  try {
    const token = getToken();
    if (token) {
      await axios.post(
        `${API_BASE}/api/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }
  } catch (err) {
    console.error('❌ Erreur logout:', err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }
}

// ➕ Abonnement actif OU essai en cours
export function isSubscriptionActive() {
  const user = getUser();
  const sub = user?.subscription;
  if (!sub || !sub.expiresAt) return false;
  const notExpired = new Date(sub.expiresAt) > new Date();
  return notExpired && (sub.status === "active" || sub.status === "trial");
}

// 🔥 Hook pour écouter les changements d'utilisateur en temps réel
export function useRealtimeUser() {
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const unsubscribe = listenUserUpdate((userData) => {
      setUser(userData);
    });

    // Écouter aussi les changements directs du localStorage (autre onglet)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        setUser(getUser());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return user;
}
