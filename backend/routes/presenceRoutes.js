// backend/routes/presenceRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// Cache pour éviter de spammer Socket.io
const lastEmit = new Map();
const EMIT_COOLDOWN = 5000; // 5 secondes entre chaque émission pour un user

// 👣 Heartbeat: appelée par le front toutes les 10s quand l'utilisateur est connecté
router.post("/heartbeat", protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    await User.findByIdAndUpdate(req.user._id || req.user.id, { lastSeen: new Date() });
    
    // 🔥 Émettre événement seulement si cooldown passé
    const now = Date.now();
    const lastEmitTime = lastEmit.get(userId) || 0;
    
    if (now - lastEmitTime > EMIT_COOLDOWN) {
      const { io } = await import("../server.js");
      io.emit("online:update");
      lastEmit.set(userId, now);
    }
  } catch (e) {
    // on ne fail pas le client pour un heartbeat
    console.error("presence heartbeat error:", e?.message);
  }
  res.json({ ok: true });
});

export default router;
