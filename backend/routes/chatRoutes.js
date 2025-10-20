import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Message from "../models/Message.js";
import { io } from "../server.js";

const router = express.Router();

// 📋 Récupérer les derniers messages
router.get("/messages", protect, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "100"), 200);
    
    const messages = await Message.find({})
      .sort({ timestamp: -1 })
      .limit(limit);
    
    // Inverser pour avoir du plus ancien au plus récent
    res.json(messages.reverse());
  } catch (e) {
    next(e);
  }
});

// 💬 Envoyer un message
router.post("/messages", protect, async (req, res, next) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message vide" });
    }
    
    if (message.length > 1000) {
      return res.status(400).json({ message: "Message trop long (max 1000 caractères)" });
    }
    
    const newMessage = await Message.create({
      userId: req.user._id,
      userName: req.user.name,
      userIsAdmin: req.user.isAdmin || false,
      message: message.trim(),
    });
    
    // Émettre le message à tous les clients connectés
    io.emit("chat:message", newMessage);
    
    res.json(newMessage);
  } catch (e) {
    next(e);
  }
});

// 🗑️ Supprimer un message (admin uniquement)
router.delete("/messages/:id", protect, async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin uniquement" });
    }
    
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message introuvable" });
    }
    
    // Notifier tous les clients
    io.emit("chat:delete", { _id: req.params.id });
    
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
