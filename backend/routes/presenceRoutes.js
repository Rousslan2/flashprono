// backend/routes/presenceRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// 👣 Heartbeat: appelée par le front toutes les 10s quand l'utilisateur est connecté
router.post("/heartbeat", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id || req.user.id, { lastSeen: new Date() });
  } catch (e) {
    // on ne fail pas le client pour un heartbeat
    console.error("presence heartbeat error:", e?.message);
  }
  res.json({ ok: true });
});

export default router;
