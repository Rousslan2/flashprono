import express from "express";
import { protect } from "../middleware/auth.js"; // 👈 import nommé + .js obligé en ESM
import User from "../models/User.js";

const router = express.Router();

router.post("/heartbeat", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastSeen: new Date() });
  } catch {}
  res.json({ ok: true });
});

export default router;
