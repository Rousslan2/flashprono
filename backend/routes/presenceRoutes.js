// backend/routes/presenceRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // ✅ bon chemin
import User from "../models/User.js";

const router = express.Router();

// 🔁 Système de présence (appelé régulièrement depuis le front)
router.post("/heartbeat", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastSeen: new Date() });
  } catch (err) {
    console.error("Erreur mise à jour présence :", err.message);
  }
  res.json({ ok: true });
});

export default router;
