// backend/routes/presenceRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/heartbeat", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastSeen: new Date() });
  } catch (err) {
    console.error("Erreur présence:", err.message);
  }
  res.json({ ok: true });
});

export default router;
