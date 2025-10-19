// =========================================
// 🚀 FLASHPRONO - SERVER PRINCIPAL BACKEND
// =========================================

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import { connectDB } from "./config/db.js";

// 🔐 Middlewares
import { errorHandler } from "./middleware/errorMiddleware.js";
import { logAdminAction } from "./middleware/logMiddleware.js";

// 📦 Routes
import authRoutes from "./routes/authRoutes.js";
import pronosticRoutes from "./routes/pronosticRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import presenceRoutes from "./routes/presenceRoutes.js"; // 👈 présence en ligne

// 📊 Modèles
import User from "./models/User.js";

// ⚙️ Initialisation
dotenv.config();
connectDB();

// ✅ Créer l'app AVANT tout app.use(...)
const app = express();

// =============================
// 🌐 CONFIGURATION GLOBALE CORS (robuste)
// =============================
const FRONT = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");

const baseWhitelist = [
  FRONT, // depuis ton .env (ex. https://flashprono.com)
  "https://flashprono.com",
  "https://www.flashprono.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://frontend-production-14f9.up.railway.app",
].filter(Boolean);

const WHITELIST = new Set(baseWhitelist.map((u) => u.replace(/\/+$/, "")));

const corsHandler = cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Postman / cURL
    const cleanOrigin = origin.replace(/\/+$/, "");
    if (WHITELIST.has(cleanOrigin)) return cb(null, true);
    if (cleanOrigin.endsWith(".flashprono.com")) return cb(null, true);
    console.warn("❌ CORS refusé pour :", origin);
    return cb(new Error(`CORS bloqué pour ${origin}`), false);
  },
  credentials: true,
  optionsSuccessStatus: 204, // ✅ important pour les pré-requêtes
});

app.use(corsHandler);
// ✅ FIX preflight global (OPTIONS → 204 + headers)
app.options("*", corsHandler); // <<< AJOUT CRUCIAL

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 Fichiers statiques (vocaux, etc.)
app.use("/uploads", express.static("uploads"));

// =============================
// 🩺 ROUTE DE TEST / STATUS API
// =============================
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    clientUrl: process.env.FRONTEND_URL || FRONT,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    mongoUriSet: !!process.env.MONGO_URI,
    message: "✅ FlashProno API opérationnelle",
  });
});

// =============================
// 📁 ROUTES PRINCIPALES
// =============================
app.use("/api/auth", authRoutes);
app.use("/api/pronostics", pronosticRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/presence", presenceRoutes); // 👈 présence

// =============================
// 🧾 LOG ADMIN TEST
// =============================
app.post("/api/admin/log-test", (req, res) => {
  const { action, adminEmail, targetEmail } = req.body;
  logAdminAction(action, { email: adminEmail }, { email: targetEmail });
  res.json({ ok: true, message: "Log admin enregistré en console ✅" });
});

// =============================
// 🕛 CRON JOB : NETTOYAGE AUTO
// =============================
cron.schedule(
  "0 3 * * *",
  async () => {
    try {
      const now = new Date();
      const result = await User.updateMany(
        {
          "subscription.expiresAt": { $lt: now },
          "subscription.status": { $ne: "inactive" },
        },
        {
          $set: {
            "subscription.status": "inactive",
            "subscription.plan": null,
            "subscription.expiresAt": null,
          },
        }
      );
      console.log(
        `🧹 Cron: ${result.modifiedCount} abonnement(s)/essai(s) expiré(s) désactivé(s).`
      );
    } catch (e) {
      console.error("Cron error:", e);
    }
  },
  { timezone: "Europe/Paris" }
);

// =============================
// 🧱 MIDDLEWARE ERREUR GLOBAL
// =============================
app.use(errorHandler);

// =============================
// 🏁 ROUTE PAR DÉFAUT
// =============================
app.get("/", (_req, res) => {
  res.send("🌍 FlashProno Backend en ligne 🚀");
});

// =============================
// 🚀 LANCEMENT SERVEUR
// =============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Serveur FlashProno actif sur le port ${PORT}`);
});
