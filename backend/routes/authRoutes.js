import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ConnectionHistory from "../models/ConnectionHistory.js";

const router = express.Router();

// Inscription
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: "Utilisateur déjà existant" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
    
    // 🔥 Mettre à jour lastSeen
    user.lastSeen = new Date();
    await user.save();
    
    // 🔥 Enregistrer la connexion dans l'historique
    try {
      const historyEntry = await ConnectionHistory.create({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        action: "login",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown',
      });
      
      // Émettre événement Socket.io pour l'historique
      const { io } = await import("../server.js");
      io.emit("connection:new", historyEntry);
      io.emit("online:update"); // Notifier changement utilisateurs en ligne
    } catch (err) {
      console.error('❌ Erreur enregistrement historique:', err);
    }
    
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔥 Déconnexion explicite
router.post("/logout", async (req, res) => {
  try {
    // Accepter le token depuis header OU depuis le body (pour sendBeacon)
    let token = req.headers.authorization?.split(' ')[1];
    
    // Si pas dans le header, chercher dans les cookies ou le body
    if (!token && req.body?.token) {
      token = req.body.token;
    }
    
    if (!token) return res.json({ ok: true });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (user) {
      // Enregistrer la déconnexion
      const historyEntry = await ConnectionHistory.create({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        action: "logout",
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'] || 'Unknown',
      });
      
      // Émettre événements Socket.io
      const { io } = await import("../server.js");
      io.emit("connection:new", historyEntry);
      io.emit("online:update");
    }
    
    res.json({ ok: true });
  } catch (err) {
    // Token invalide ou expiré, on ignore
    res.json({ ok: true });
  }
});

export default router;
