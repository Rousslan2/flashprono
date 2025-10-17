// frontend/src/config.js
let base = import.meta.env.VITE_API_BASE || "http://localhost:5000";

// si on a "//domaine", ajoute https:
if (base.startsWith("//")) base = "https:" + base;

// si pas de protocole ET/OU un slash en début → force https://domaine
if (!/^https?:\/\//i.test(base)) base = `https://${base.replace(/^\/+/, "")}`;

// supprime le slash final
export const API_BASE = base.replace(/\/+$/, "");

// petit log une fois en prod (utile pour vérifier)
console.log("[FlashProno] API_BASE =", API_BASE);
