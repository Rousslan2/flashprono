import express from "express";
import Pronostic from "../models/Pronostic.js";
import UserBet from "../models/UserBet.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { checkAndUpdatePronosticResults, checkAllPendingPronostics, determinePronosticResult } from "../services/pronosticChecker.js";

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

// PUT pronostic — réservé admin + SYNC UserBets
router.put("/:id", protect, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const allowed = [
    "sport","equipe1","equipe2","cote","type","resultat","scoreLive","date",
    "competition","bookmaker","confiance","image","analyse","statut","categorie"
  ];
  const update = {};
  for (const k of allowed) if (k in req.body) update[k] = req.body[k];
  const prono = await Pronostic.findByIdAndUpdate(id, update, { new: true });
  if (!prono) return res.status(404).json({ message: "Pronostic introuvable" });
  
  // 🔥 SYNC: Mettre à jour tous les UserBets liés à ce prono
  if (update.resultat) {
    await UserBet.updateMany(
      { pronoId: id },
      { $set: { resultat: update.resultat } }
    );
    console.log(`✅ UserBets synchronisés pour prono ${id}: ${update.resultat}`);
  }
  
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

// 🔍 Vérifier TOUS les pronos en attente (admin uniquement) - NOUVEAU
router.post("/check-all-pending", protect, requireAdmin, async (req, res) => {
  try {
    console.log("🔍 Vérification COMPLÈTE de tous les pronos en attente lancée par", req.user.email);
    const result = await checkAllPendingPronostics();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        checked: result.checked,
        updated: result.updated,
        dates: result.dates
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ✏️ Mettre à jour manuellement le score d'un prono (admin uniquement)
router.post("/:id/manual-score", protect, requireAdmin, async (req, res) => {
  try {
    const { homeScore, awayScore } = req.body;
    
    console.log(`✏️ Score manuel demandé pour ${req.params.id}: ${homeScore}-${awayScore}`);
    
    if (homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ success: false, message: "Score manquant" });
    }
    
    const prono = await Pronostic.findById(req.params.id);
    if (!prono) {
      return res.status(404).json({ success: false, message: "Prono introuvable" });
    }
    
    console.log(`🎯 Prono trouvé: ${prono.equipe1} vs ${prono.equipe2} - Type: ${prono.type}`);
    
    // Déterminer le résultat selon le type de pari
    const result = determinePronosticResult(
      prono,
      prono.equipe1, // homeTeam
      prono.equipe2, // awayTeam
      parseInt(homeScore),
      parseInt(awayScore)
    );
    
    console.log(`📊 Résultat calculé: ${result}`);
    
    if (!result) {
      return res.status(400).json({ 
        success: false, 
        message: `Impossible de déterminer le résultat pour le type "${prono.type}". Vérifie le type de pari.` 
      });
    }
    
    // Mettre à jour le prono
    prono.scoreLive = `${homeScore}-${awayScore}`;
    prono.statut = result;
    prono.resultat = result;
    await prono.save();
    
    // Sync UserBets
    const syncResult = await UserBet.updateMany(
      { pronoId: prono._id },
      { $set: { resultat: result, scoreLive: `${homeScore}-${awayScore}` } }
    );
    
    console.log(`✅ Score manuel: ${prono.equipe1} vs ${prono.equipe2} = ${homeScore}-${awayScore} → ${result} (${syncResult.modifiedCount} UserBets sync)`);
    
    res.json({
      success: true,
      message: "Score mis à jour avec succès",
      resultat: result,
      scoreLive: `${homeScore}-${awayScore}`,
      prono: {
        equipe1: prono.equipe1,
        equipe2: prono.equipe2,
        type: prono.type
      }
    });
  } catch (error) {
    console.error("❌ Erreur score manuel:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur"
    });
  }
});

export default router;
