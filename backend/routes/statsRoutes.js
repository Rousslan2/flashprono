import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Pronostic from "../models/Pronostic.js";
import UserBet from "../models/UserBet.js";
import { io } from "../server.js";

const router = express.Router();

// 📊 Stats utilisateur (basées sur SES paris suivis)
router.get("/my-stats", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userBets = await UserBet.find({ userId });
    
    // Filtrer les paris terminés
    const finishedBets = userBets.filter(b => {
      const res = (b.resultat || "").toLowerCase();
      return res.includes("gagnant") || res.includes("win") || res.includes("perdu") || res.includes("lose");
    });

    const totalBets = finishedBets.length;
    
    if (totalBets === 0) {
      return res.json({
        pronosSuivis: 0,
        tauxReussite: 0,
        roi: 0,
        gains: 0
      });
    }

    // Calculer les gagnants
    const winners = finishedBets.filter(b => {
      const res = (b.resultat || "").toLowerCase();
      return res.includes("gagnant") || res.includes("win");
    });

    const winCount = winners.length;
    const tauxReussite = Math.round((winCount / totalBets) * 100);

    // Calcul ROI avec les vraies mises de l'user
    let totalMise = 0;
    let totalRetour = 0;

    finishedBets.forEach(b => {
      const mise = b.mise || 10;
      totalMise += mise;
      
      const res = (b.resultat || "").toLowerCase();
      if (res.includes("gagnant") || res.includes("win")) {
        const cote = b.cote || 1;
        totalRetour += mise * cote;
      }
    });

    const gains = totalRetour - totalMise;
    const roi = totalMise > 0 ? Math.round((gains / totalMise) * 100) : 0;

    res.json({
      pronosSuivis: totalBets,
      tauxReussite,
      roi,
      gains: Math.round(gains * 100) / 100
    });
  } catch (e) {
    next(e);
  }
});

// ✅ Suivre un prono
router.post("/follow/:pronoId", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pronoId = req.params.pronoId;
    const { mise } = req.body;

    // Vérifier si déjà suivi
    const existing = await UserBet.findOne({ userId, pronoId });
    if (existing) {
      return res.status(400).json({ message: "Tu suis déjà ce prono" });
    }

    // Récupérer le prono
    const prono = await Pronostic.findById(pronoId);
    if (!prono) {
      return res.status(404).json({ message: "Pronostic introuvable" });
    }

    // Créer le suivi
    const userBet = await UserBet.create({
      userId,
      pronoId,
      mise: mise || 10,
      equipe1: prono.equipe1,
      equipe2: prono.equipe2,
      type: prono.type,
      cote: prono.cote,
      resultat: prono.resultat,
      date: prono.date,
    });

    res.json({ ok: true, userBet });
  } catch (e) {
    next(e);
  }
});

// ❌ Ne plus suivre un prono
router.delete("/unfollow/:pronoId", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pronoId = req.params.pronoId;

    const deleted = await UserBet.findOneAndDelete({ userId, pronoId });
    if (!deleted) {
      return res.status(404).json({ message: "Tu ne suis pas ce prono" });
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// 📋 Liste des pronos suivis par l'user
router.get("/my-bets", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const bets = await UserBet.find({ userId }).sort({ followedAt: -1 });
    res.json(bets);
  } catch (e) {
    next(e);
  }
});

// ✅ Vérifier si un prono est suivi
router.get("/is-following/:pronoId", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const pronoId = req.params.pronoId;
    const bet = await UserBet.findOne({ userId, pronoId });
    res.json({ isFollowing: !!bet, bet });
  } catch (e) {
    next(e);
  }
});

export default router;
