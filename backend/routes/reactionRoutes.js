import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Reaction from "../models/Reaction.js";

const router = express.Router();

// 👍 Ajouter/Modifier une réaction
router.post("/:pronoId", protect, async (req, res) => {
  try {
    const { pronoId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    if (!emoji || !["🔥", "💪", "⚽", "🎯", "👍", "❤️", "😍", "👑", "💰", "🚀"].includes(emoji)) {
      return res.status(400).json({ message: "Emoji invalide" });
    }

    // Remplacer la réaction existante ou créer une nouvelle
    const reaction = await Reaction.findOneAndUpdate(
      { pronoId, userId },
      { emoji },
      { upsert: true, new: true }
    );

    res.json({ success: true, reaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Supprimer sa réaction
router.delete("/:pronoId", protect, async (req, res) => {
  try {
    const { pronoId } = req.params;
    const userId = req.user._id;

    await Reaction.findOneAndDelete({ pronoId, userId });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📊 Récupérer les réactions d'un prono
router.get("/:pronoId", async (req, res) => {
  try {
    const { pronoId } = req.params;

    const reactions = await Reaction.find({ pronoId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    // Grouper par emoji
    const grouped = {};
    reactions.forEach(r => {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = {
          emoji: r.emoji,
          count: 0,
          users: []
        };
      }
      grouped[r.emoji].count++;
      grouped[r.emoji].users.push({
        id: r.userId._id,
        name: r.userId.name
      });
    });

    res.json({ 
      reactions: Object.values(grouped),
      total: reactions.length 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
