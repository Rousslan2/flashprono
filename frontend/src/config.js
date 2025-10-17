// =========================================
// ⚙️ CONFIGURATION API FLASHPRONO FRONTEND
// =========================================

// URL backend en production (publique Railway)
const PROD_API = "https://flashprono-production.up.railway.app";

// Détecte si on tourne sur un domaine Railway (production)
const isProd =
  typeof window !== "undefined" &&
  /railway\.app$/i.test(window.location.hostname);

// En dev (localhost), on garde la variable Vite si elle existe, sinon 5000
let devBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// Normalisation (au cas où)
if (devBase.startsWith("//")) devBase = "https:" + devBase;
if (!/^https?:\/\//i.test(devBase)) devBase = `https://${devBase.replace(/^\/+/, "")}`;
devBase = devBase.replace(/\/+$/, "");

// Choix final
export const API_BASE = (isProd ? PROD_API : devBase).replace(/\/+$/, "");

// Log de contrôle
console.log("[FlashProno] API_BASE =", API_BASE, "| isProd =", isProd);
