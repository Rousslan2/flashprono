import express from "express";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/heartbeat", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { lastSeen: new Date() });
  } catch {}
  res.json({ ok: true });
});

export default router;
