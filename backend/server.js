// =========================================
// 🚀 FLASHPRONO - SERVER PRINCIPAL BACKEND
// =========================================

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
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
import presenceRoutes from "./routes/presenceRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

// 📊 Modèles
import User from "./models/User.js";

// ⚙️ Initialisation
dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

// =============================
// 🔥 SOCKET.IO - TEMPS RÉEL
// =============================
const FRONT = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");
const baseWhitelist = [
  FRONT,
  "https://flashprono.com",
  "https://www.flashprono.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const WHITELIST = new Set(baseWhitelist.map((u) => u.replace(/\/+$/, "")));

const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const clean = origin.replace(/\/+$/, "");
      if (WHITELIST.has(clean) || clean.endsWith(".flashprono.com")) {
        return cb(null, true);
      }
      return cb(new Error("CORS bloqué"), false);
    },
    credentials: true,
  },
});

// Gestion des connexions Socket.io
io.on("connection", (socket) => {
  console.log("✅ Client connecté:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client déconnecté:", socket.id);
  });
});

// Exporter io pour l'utiliser dans les routes
export { io };

// =============================
// 🌐 CONFIGURATION CORS
// =============================
app.set("trust proxy", 1);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const clean = origin.replace(/\/+$/, "");
    if (WHITELIST.has(clean)) return cb(null, true);
    if (clean.endsWith(".flashprono.com")) return cb(null, true);
    console.warn("❌ CORS refusé pour :", origin);
    return cb(new Error(`CORS bloqué pour ${origin}`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📁 Fichiers statiques
app.use("/uploads", express.static("uploads"));

// =============================
// 🩺 ROUTE DE TEST
// =============================
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    clientUrl: process.env.FRONTEND_URL || FRONT,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    mongoUriSet: !!process.env.MONGO_URI,
    socketConnected: io.engine.clientsCount,
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
app.use("/api/presence", presenceRoutes);
app.use("/api/stats", statsRoutes);

// =============================
// 🧾 LOG ADMIN TEST
// =============================
app.post("/api/admin/log-test", (req, res) => {
  const { action, adminEmail, targetEmail } = req.body;
  logAdminAction(action, { email: adminEmail }, { email: targetEmail });
  res.json({ ok: true, message: "Log admin enregistré en console ✅" });
});

// =============================
// 🕛 CRON JOB
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
// 🧱 MIDDLEWARE ERREUR
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
httpServer.listen(PORT, () => {
  console.log(`✅ Serveur FlashProno actif sur le port ${PORT}`);
  console.log(`🔥 Socket.io prêt pour le temps réel`);
});
