import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { logAdminAction } from "../middleware/logMiddleware.js";
import User from "../models/User.js";
import Pronostic from "../models/Pronostic.js";

const router = express.Router();

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

router.use(protect);
router.use(requireAdmin);

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

router.get("/pronostics", async (_req, res, next) => {
  try {
    const list = await Pronostic.find({}).sort({ createdAt: -1 }).limit(50);
    res.json(list);
  } catch (e) {
    next(e);
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
    res.json(prono);
  } catch (e) {
    next(e);
  }
});

router.put("/pronostics/:id", async (req, res, next) => {
  try {
    const prono = await Pronostic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!prono) return res.status(404).json({ message: "Pronostic introuvable." });
    res.json(prono);
  } catch (e) {
    next(e);
  }
});

router.delete("/pronostics/:id", async (req, res, next) => {
  try {
    const prono = await Pronostic.findByIdAndDelete(req.params.id);
    if (!prono) return res.status(404).json({ message: "Pronostic introuvable." });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

router.patch("/pronostics/:id/live", async (req, res, next) => {
  try {
    const { isLive, homeScore, awayScore, minute, status } = req.body;
    const update = {
      "live.isLive": !!isLive,
      "live.homeScore": typeof homeScore === "number" ? homeScore : 0,
      "live.awayScore": typeof awayScore === "number" ? awayScore : 0,
      "live.minute": minute ?? "",
      "live.status": status ?? "",
      "live.lastUpdate": new Date(),
    };
    const prono = await Pronostic.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );
    if (!prono) return res.status(404).json({ message: "Pronostic introuvable." });
    res.json(prono);
  } catch (e) {
    next(e);
  }
});

router.post("/upload/audio", upload.single("audio"), async (req, res, next) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Accès refusé" });
    if (!req.file) return res.status(400).json({ message: "Aucun fichier" });
    const url = `/uploads/audio/${req.file.filename}`;
    res.json({ ok: true, url });
  } catch (e) {
    next(e);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1"), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || "25"), 1), 100);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find({}, "name email isAdmin isBanned createdAt subscription")
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

router.patch("/users/:id/ban", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { isBanned: true } },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });
    logAdminAction("BAN", req.user, user);
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
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
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
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
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
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
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
});

router.patch("/users/:id/grant-subscription", async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({ message: "Plan invalide." });
    }
    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === "monthly") expiresAt.setDate(now.getDate() + 30);
    if (plan === "yearly") expiresAt.setDate(now.getDate() + 365);
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
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
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
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
});

export default router;
