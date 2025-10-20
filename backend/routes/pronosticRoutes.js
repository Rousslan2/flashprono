import express from "express";
import Pronostic from "../models/Pronostic.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { checkAndUpdatePronosticResults } from "../services/pronosticChecker.js";

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

// 🔄 Vérifier manuellement les résultats (admin uniquement)
router.post("/check-results", protect, requireAdmin, async (req, res) => {
  try {
    console.log("🔄 Vérification manuelle des résultats lancée par", req.user.email);
    const result = await checkAndUpdatePronosticResults();
    
    if (result) {
      res.json({
        success: true,
        message: `${result.updated} pronostic(s) mis à jour sur ${result.checked} vérifié(s)`,
        checked: result.checked,
        updated: result.updated
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
