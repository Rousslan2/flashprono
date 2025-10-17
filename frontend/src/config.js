// ⚙️ API base - force prod when hosted, fallback local for dev
const PROD_API = "https://flashprono-production.up.railway.app";
const isProd = typeof window !== "undefined" && /railway\.app$/i.test(window.location.hostname);
let devBase = import.meta.env.VITE_API_BASE || "http://localhost:5000";
if (devBase.startsWith("//")) devBase = "https:" + devBase;
if (!/^https?:\/\//i.test(devBase)) devBase = `https://${devBase.replace(/^\/+/, "")}`;
devBase = devBase.replace(/\/+$/, "");
export const API_BASE = (isProd ? PROD_API : devBase).replace(/\/+$/, "");
console.log("[FlashProno] API_BASE =", API_BASE, "| isProd =", isProd);
