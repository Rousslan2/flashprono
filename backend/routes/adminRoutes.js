// backend/routes/adminRoutes.js
import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { logAdminAction } from "../middleware/logMiddleware.js";
import User from "../models/User.js";
import Pronostic from "../models/Pronostic.js";
import ConnectionHistory from "../models/ConnectionHistory.js";
import { io } from "../server.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Upload audio (admin)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "audio");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname).toLowerCase());
  },
});
const audioFilter = (_req, file, cb) =>
  cb(null, /\.(mp3|wav|m4a|ogg)$/i.test(file.originalname));
const upload = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: 25 * 1024 * 1024 },
});

// 🔒 garde global (auth + admin)
router.use(protect);
router.use(requireAdmin);

// =====================
// 📊 STATS
// =====================
router.get("/stats", async (_req, res, next) => {
  try {
    const now = new Date();

    const [totalUsers, activeSubs, trialActive, totalPronos, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({
          "subscription.status": "active",
          "subscription.expiresAt": { $gt: now },
        }),
        User.countDocuments({
          "subscription.status": "trial",
          "subscription.expiresAt": { $gt: now },
        }),
        Pronostic.countDocuments(),
        User.find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .select("name email createdAt subscription.status isAdmin isBanned"),
      ]);

    res.json({ totalUsers, activeSubs, trialActive, totalPronos, recentUsers });
  } catch (e) {
    next(e);
  }
});

// ==============================
// ⚽ PRONOSTICS CRUD (PAGINÉ)
// ==============================
router.get("/pronostics", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "25"), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Pronostic.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Pronostic.countDocuments(),
    ]);

    res.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    });
  } catch (e) {
    next(e);
  }
});

// ==============================
// 🔄 FORCE CHECK RESULTS (ADMIN)
// ==============================
router.post("/pronostics/check-results", async (req, res, next) => {
  try {
    const { checkAndUpdatePronosticResults } = await import("../services/pronosticChecker.js");

    console.log("🔄 Vérification forcée des résultats par admin");

    // Vérifier TOUS les pronostics (pas seulement en attente/en cours)
    const allPronostics = await Pronostic.find({ sport: "Football" });
    console.log(`📊 Vérification de TOUS les pronostics: ${allPronostics.length}`);

    const result = await checkAndUpdatePronosticResults();

    if (result) {
      res.json({
        success: true,
        message: `${result.updated} pronostic(s) mis à jour sur ${result.checked} vérifié(s) (${allPronostics.length} au total)`,
        checked: result.checked,
        updated: result.updated,
        live: result.live,
        total: allPronostics.length
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la vérification"
      });
    }
  } catch (error) {
    console.error("❌ Erreur vérification forcée:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post("/pronostics", async (req, res, next) => {
  try {
    const { sport, date, equipe1, equipe2, type, cote, resultat, label, details, audioUrl } = req.body;
    if (!sport || !date || !equipe1 || !equipe2 || !type || !cote) {
      return res.status(400).json({ message: "Champs requis manquants." });
    }
    const prono = await Pronostic.create({
      sport,
      date,
      equipe1,
      equipe2,
      type,
      cote,
      resultat: resultat || "En attente",
      label: label || "standard",
      details: details || "",
      audioUrl: audioUrl || "",
    });
    
    // 🔥 Émettre un événement Socket.io
    io.emit("prono:created", prono);
    
    res.json(prono);
  } catch (e) {
    next(e);
  }
});

router.put("/pronostics/:id", async (req, res, next) => {
  try {
    const prono = await Pronostic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prono) return res.status(404).json({ message: "Pronostic introuvable." });
    
    // 🔥 Émettre un événement Socket.io
    io.emit("prono:updated", prono);
    
    res.json(prono);
  } catch (e) {
    next(e);
  }
});

router.delete("/pronostics/:id", async (req, res, next) => {
  try {
    const prono = await Pronostic.findByIdAndDelete(req.params.id);
    if (!prono) return res.status(404).json({ message: "Pronostic introuvable." });
    
    // 🔥 Émettre un événement Socket.io
    io.emit("prono:deleted", { _id: req.params.id });
    
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// ==================================
// 👥 UTILISATEURS (PAGINÉ + ACTIONS)
// ==================================
router.get("/users", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "25"), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      User.find({}, "name email isAdmin isBanned createdAt subscription lastSeen")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    next(e);
  }
});

// ✅ Nouvel endpoint: utilisateurs en ligne (vu dans les 2 dernières minutes)
router.get("/online-users", async (_req, res, next) => {
  try {
    const since = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes
    const users = await User.find({ 
      lastSeen: { $gte: since } 
    })
    .select("name email isAdmin lastSeen")
    .sort({ lastSeen: -1 })
    .limit(100); // Limite à 100 pour la performance
    
    res.json({ 
      count: users.length, 
      users,
      timestamp: new Date()
    });
  } catch (e) {
    next(e);
  }
});

// 🔥 NOUVEAU : Historique des connexions
router.get("/connection-history", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "50"), 1), 200);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ConnectionHistory.find({})
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      ConnectionHistory.countDocuments(),
    ]);

    res.json({ 
      items, 
      total, 
      page, 
      pages: Math.ceil(total / limit) 
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/users/:id/ban", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBanned: true } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    logAdminAction("BAN", req.user, user);
    
    // 🔥 Émettre un événement Socket.io
    io.emit("user:updated", user);
    
    res.json({ ok: true, user });
  } catch (e) { next(e); }
});

router.patch("/users/:id/unban", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBanned: false } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    logAdminAction("UNBAN", req.user, user);
    io.emit("user:updated", user);
    res.json({ ok: true, user });
  } catch (e) { next(e); }
});

router.patch("/users/:id/make-admin", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isAdmin: true } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    logAdminAction("MAKE_ADMIN", req.user, user);
    io.emit("user:updated", user);
    res.json({ ok: true, user });
  } catch (e) { next(e); }
});

router.patch("/users/:id/remove-admin", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isAdmin: false } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    logAdminAction("REMOVE_ADMIN", req.user, user);
    io.emit("user:updated", user);
    res.json({ ok: true, user });
  } catch (e) { next(e); }
});

router.patch("/users/:id/grant-subscription", async (req, res, next) => {
  try {
    const { plan } = req.body; // "monthly" | "yearly"
    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ message: "Plan invalide." });
    }
    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === "monthly") expiresAt.setDate(now.getDate() + 30);
    if (plan === "yearly")  expiresAt.setDate(now.getDate() + 365);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "subscription.plan": plan,
          "subscription.status": "active",
          "subscription.expiresAt": expiresAt,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    logAdminAction(`GRANT_${plan.toUpperCase()}`, req.user, user);
    io.emit("user:updated", user);
    res.json({ ok: true, user });
  } catch (e) { next(e); }
});

router.patch("/users/:id/revoke-subscription", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "subscription.plan": null,
          "subscription.status": "inactive",
          "subscription.expiresAt": null,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    logAdminAction("REVOKE_SUBSCRIPTION", req.user, user);
    io.emit("user:updated", user);
    res.json({ ok: true, user });
  } catch (e) { next(e); }
});

// 🔥 NOUVEAU : Modifier les jours restants d'abonnement
router.patch("/users/:id/modify-subscription-days", async (req, res, next) => {
  try {
    const { days } = req.body; // nombre de jours à ajouter ou retirer
    if (typeof days !== 'number') {
      return res.status(400).json({ message: "Nombre de jours invalide." });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    const now = new Date();
    let expiresAt = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : new Date();
    
    // Si l'abo est expiré, on repart d'aujourd'hui
    if (expiresAt < now) expiresAt = new Date(now);
    
    // Ajouter ou retirer les jours
    expiresAt.setDate(expiresAt.getDate() + days);

    user.subscription = user.subscription || {};
    user.subscription.expiresAt = expiresAt;
    
    // Si l'abo était inactif et qu'on ajoute des jours, on le réactive
    if (days > 0 && user.subscription.status === "inactive") {
      user.subscription.status = "active";
      user.subscription.plan = user.subscription.plan || "monthly";
    }

    await user.save();
    logAdminAction(`MODIFY_DAYS_${days > 0 ? '+' : ''}${days}`, req.user, user);
    io.emit("user:updated", user);
    res.json({ ok: true, user });
  } catch (e) { next(e); }
});

// 🗑️ NOUVEAU : Supprimer complètement un compte utilisateur
router.delete("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    
    // Empêcher la suppression de son propre compte
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte." });
    }

    await User.findByIdAndDelete(req.params.id);
    logAdminAction("DELETE_USER", req.user, user);
    res.json({ ok: true, message: "Utilisateur supprimé avec succès." });
  } catch (e) { next(e); }
});

router.post("/upload/audio", upload.single("audio"), async (req, res, next) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });
    if (!req.file) return res.status(400).json({ message: "Aucun fichier" });
    const url = `/uploads/audio/${req.file.filename}`;
    res.json({ ok: true, url });
  } catch (e) { next(e); }
});

// 🔄 Vérifier et mettre à jour les résultats depuis l'API
router.post("/check-results", async (req, res, next) => {
  try {
    const axios = (await import("axios")).default;
    const API_KEY = process.env.FOOTBALL_API_KEY;
    
    if (!API_KEY) {
      return res.status(400).json({ 
        message: "API Football non configurée",
        updated: 0 
      });
    }

    // Récupérer les pronos d'aujourd'hui et hier
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const pronos = await Pronostic.find({
      date: { $gte: yesterday },
      sport: { $regex: /football/i },
      resultat: { $in: ["En attente", "en attente", "", null] },
    });

    console.log(`🔍 ${pronos.length} pronos à vérifier`);

    if (pronos.length === 0) {
      return res.json({ 
        message: "Aucun prono à vérifier", 
        updated: 0,
        details: [] 
      });
    }

    // Appeler l'API pour les matchs d'aujourd'hui et hier
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    console.log(`📅 Dates API: ${yesterdayStr} et ${todayStr}`);
    
    const [todayData, yesterdayData] = await Promise.all([
      axios.get(`https://v3.football.api-sports.io/fixtures`, {
        params: { date: todayStr },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
        timeout: 10000,
      }),
      axios.get(`https://v3.football.api-sports.io/fixtures`, {
        params: { date: yesterdayStr },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
        timeout: 10000,
      }),
    ]);

    const allMatches = [
      ...(todayData.data.response || []),
      ...(yesterdayData.data.response || []),
    ];

    console.log(`⚽ ${allMatches.length} matchs reçus de l'API`);

    let updated = 0;
    const details = [];

    // Fonction de similarité améliorée
    const similarity = (str1, str2) => {
      const s1 = str1.toLowerCase().trim();
      const s2 = str2.toLowerCase().trim();
      
      // Exact match
      if (s1 === s2) return 1;
      
      // Contains
      if (s1.includes(s2) || s2.includes(s1)) return 0.8;
      
      // Split words and check common words
      const words1 = s1.split(/\s+/);
      const words2 = s2.split(/\s+/);
      const commonWords = words1.filter(w => words2.includes(w)).length;
      
      if (commonWords > 0) {
        return commonWords / Math.max(words1.length, words2.length);
      }
      
      return 0;
    };

    for (const prono of pronos) {
      const team1 = prono.equipe1.toLowerCase().trim();
      const team2 = prono.equipe2.toLowerCase().trim();

      // Chercher le match avec score de similarité
      let bestMatch = null;
      let bestScore = 0;

      for (const m of allMatches) {
        const home = m.teams.home.name.toLowerCase();
        const away = m.teams.away.name.toLowerCase();
        
        // Score pour match1 (home=team1, away=team2)
        const score1 = (similarity(home, team1) + similarity(away, team2)) / 2;
        
        // Score pour match2 (home=team2, away=team1)
        const score2 = (similarity(home, team2) + similarity(away, team1)) / 2;
        
        const score = Math.max(score1, score2);
        
        if (score > bestScore && score > 0.5) { // Seuil de 50% de similarité
          bestScore = score;
          bestMatch = m;
        }
      }

      if (!bestMatch) {
        details.push({
          prono: `${prono.equipe1} vs ${prono.equipe2}`,
          status: "❌ Match non trouvé dans l'API",
          action: "Vérifie les noms des équipes"
        });
        continue;
      }

      const matchStatus = bestMatch.fixture.status.short;
      
      if (matchStatus !== "FT") {
        details.push({
          prono: `${prono.equipe1} vs ${prono.equipe2}`,
          status: `⏳ Match en cours ou pas commencé (${matchStatus})`,
          action: `Trouvé: ${bestMatch.teams.home.name} vs ${bestMatch.teams.away.name}`
        });
        continue;
      }

      // Match terminé, déterminer le résultat
      const homeScore = bestMatch.goals.home;
      const awayScore = bestMatch.goals.away;
      const type = prono.type.toLowerCase();

      let resultat = "En attente";

      // Logique de calcul du résultat
      if (type.includes("1") && !type.includes("1n") && !type.includes("12")) {
        resultat = homeScore > awayScore ? "Gagnant" : "Perdu";
      } else if (type.includes("2") && !type.includes("2n") && !type.includes("12")) {
        resultat = awayScore > homeScore ? "Gagnant" : "Perdu";
      } else if (type.includes("x") || type.includes("nul") || type.includes("draw")) {
        resultat = homeScore === awayScore ? "Gagnant" : "Perdu";
      } else if (type.includes("1n")) {
        resultat = homeScore >= awayScore ? "Gagnant" : "Perdu";
      } else if (type.includes("2n")) {
        resultat = awayScore >= homeScore ? "Gagnant" : "Perdu";
      } else if (type.includes("12")) {
        resultat = homeScore !== awayScore ? "Gagnant" : "Perdu";
      } else if (type.includes("btts") || type.includes("both")) {
        resultat = homeScore > 0 && awayScore > 0 ? "Gagnant" : "Perdu";
      } else if (type.includes("over")) {
        const totalGoals = homeScore + awayScore;
        const threshold = parseFloat(type.match(/[0-9.]+/)?.[0] || "2.5");
        resultat = totalGoals > threshold ? "Gagnant" : "Perdu";
      } else if (type.includes("under")) {
        const totalGoals = homeScore + awayScore;
        const threshold = parseFloat(type.match(/[0-9.]+/)?.[0] || "2.5");
        resultat = totalGoals < threshold ? "Gagnant" : "Perdu";
      } else {
        details.push({
          prono: `${prono.equipe1} vs ${prono.equipe2}`,
          status: `⚠️ Type de pari non reconnu: ${prono.type}`,
          action: `Match: ${bestMatch.teams.home.name} ${homeScore}-${awayScore} ${bestMatch.teams.away.name}`
        });
        continue;
      }

      // Mettre à jour le prono
      prono.resultat = resultat;
      await prono.save();
      updated++;

      details.push({
        prono: `${prono.equipe1} vs ${prono.equipe2}`,
        status: `✅ ${bestMatch.teams.home.name} ${homeScore}-${awayScore} ${bestMatch.teams.away.name} → ${resultat}`,
        action: `Similarité: ${Math.round(bestScore * 100)}%`
      });

      console.log(
        `✅ ${prono.equipe1} vs ${prono.equipe2}: ${homeScore}-${awayScore} → ${resultat}`
      );
      
      io.emit("prono:updated", prono);
    }

    res.json({ 
      message: `${updated} résultat(s) mis à jour sur ${pronos.length} vérifié(s)`,
      updated,
      total: pronos.length,
      details
    });
  } catch (e) {
    console.error("❌ Erreur check-results:", e.message);
    next(e);
  }
});

export default router;
