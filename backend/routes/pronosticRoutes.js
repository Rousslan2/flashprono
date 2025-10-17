import express from "express";
import Pronostic from "../models/Pronostic.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

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
    const filter = {};
  if (req.query.categorie) filter.categorie = req.query.categorie;
  const pronos = await Pronostic.find(filter).sort({ createdAt: -1 });
  res.json(pronos);
});

// POST pronostic — réservé admin
router.post("/", protect, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });
  const prono = await Pronostic.create(req.body);
  res.json(prono);
});

export default router;


// PUT pronostic — réservé admin
router.put("/:id", protect, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const allowed = [
    "sport","equipe1","equipe2","cote","type","resultat","date",
    "competition","bookmaker","confiance","image","analyse","statut","categorie"
  ];
  const update = {};
  for (const k of allowed) if (k in req.body) update[k] = req.body[k];
  const prono = await Pronostic.findByIdAndUpdate(id, update, { new: true });
  if (!prono) return res.status(404).json({ message: "Pronostic introuvable" });
  res.json(prono);
});
