// backend/routes/statsRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Pronostic from "../models/Pronostic.js";

const router = express.Router();

/**
 * Utilitaire: calcule les stats à partir d'une liste de pronos
 * Hypothèse ROI: mise 1u par prono
 * - win -> gain = (cote - 1)
 * - lose -> -1
 * - pending -> 0 (ignoré pour le winrate/roi)
 */
function computeStats(list = []) {
  let total = 0;
  let wins = 0;
  let losses = 0;
  let units = 0;

  for (const p of list) {
    const res = (p.resultat || "").toLowerCase();
    const cote = Number(p.cote) || 0;

    if (res.includes("gagnant") || res.includes("win")) {
      total++;
      wins++;
      units += Math.max(cote - 1, 0);
    } else if (res.includes("perdu") || res.includes("lose")) {
      total++;
      losses++;
      units -= 1;
    }
  }

  const winrate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const roi = total > 0 ? Math.round((units / total) * 100) : 0;

  return { total, wins, losses, winrate, roi, units: Number(units.toFixed(2)) };
}

/**
 * GET /api/stats/public
 * Stats “marketing” visibles sans connexion
 * - sur 7 jours et 30 jours
 */
router.get("/public", async (_req, res, next) => {
  try {
    const now = new Date();
    const d7 = new Date(now); d7.setDate(now.getDate() - 7);
    const d30 = new Date(now); d30.setDate(now.getDate() - 30);

    const [last7, last30] = await Promise.all([
      Pronostic.find({ date: { $gte: d7 } }).select("cote resultat date"),
      Pronostic.find({ date: { $gte: d30 } }).select("cote resultat date"),
    ]);

    res.json({
      last7: computeStats(last7),
      last30: computeStats(last30),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * GET /api/stats/summary
 * Stats détaillées pour MEMBRES (protégé):
 * - semaine en cours / mois en cours
 * - semaine passée / mois passé
 */
router.get("/summary", protect, async (_req, res, next) => {
  try {
    const now = new Date();

    // semaine en cours (lundi 00:00 → dimanche 23:59:59)
    const day = (now.getDay() + 6) % 7; // 0=>lundi
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - day); weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7); weekEnd.setMilliseconds(-1);

    // semaine passée
    const lastWeekStart = new Date(weekStart); lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart); lastWeekEnd.setMilliseconds(-1);

    // mois en cours
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1); monthEnd.setMilliseconds(-1);

    // mois passé
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1); lastMonthEnd.setMilliseconds(-1);

    const [cw, lw, cm, lm] = await Promise.all([
      Pronostic.find({ date: { $gte: weekStart, $lte: weekEnd } }).select("cote resultat date sport equipe1 equipe2"),
      Pronostic.find({ date: { $gte: lastWeekStart, $lte: lastWeekEnd } }).select("cote resultat date sport equipe1 equipe2"),
      Pronostic.find({ date: { $gte: monthStart, $lte: monthEnd } }).select("cote resultat date sport equipe1 equipe2"),
      Pronostic.find({ date: { $gte: lastMonthStart, $lte: lastMonthEnd } }).select("cote resultat date sport equipe1 equipe2"),
    ]);

    res.json({
      currentWeek: { range: { from: weekStart, to: weekEnd }, stats: computeStats(cw), items: cw },
      lastWeek:    { range: { from: lastWeekStart, to: lastWeekEnd }, stats: computeStats(lw), items: lw },
      currentMonth:{ range: { from: monthStart, to: monthEnd }, stats: computeStats(cm), items: cm },
      lastMonth:   { range: { from: lastMonthStart, to: lastMonthEnd }, stats: computeStats(lm), items: lm },
    });
  } catch (e) {
    next(e);
  }
});

export default router;
