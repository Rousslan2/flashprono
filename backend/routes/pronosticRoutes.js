import express from "express";
import Pronostic from "../models/Pronostic.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

function hasActiveAccess(user) {
  const sub = user?.subscription;
  if (!sub || !sub.expiresAt) return false;
  const notExpired = new Date(sub.expiresAt) > new Date();
  // Accès si abonnement "active" OU essai "trial", tant que non expiré
  return notExpired && (sub.status === "active" || sub.status === "trial");
}

// GET pronostics — accès réservé aux utilisateurs avec accès actif (abonné ou essai)
router.get("/", protect, async (req, res) => {
  if (!hasActiveAccess(req.user)) {
    return res.status(403).json({ message: "Accès réservé aux abonnés ou essai actif." });
  }
  const pronos = await Pronostic.find().sort({ createdAt: -1 });
  res.json(pronos);
});

// POST pronostic — réservé admin
router.post("/", protect, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });
  const prono = await Pronostic.create(req.body);
  res.json(prono);
});

export default router;
