// =============================
// 🔐 AUTH MIDDLEWARE FLASHPRONO
// =============================

import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * protect()
 * - Vérifie le token JWT (header Authorization: Bearer xxx)
 * - Charge l'utilisateur (sans password)
 * - Bloque si compte banni
 * - Met l'abonnement/essai en "inactive" si expiré
 * - Attache l'utilisateur à req.user
 */
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }

      // ❌ compte banni
      if (user.isBanned) {
        return res.status(403).json({ message: "Compte banni." });
      }

      // ⏰ expire -> inactive
      const sub = user.subscription;
      if (sub?.expiresAt) {
        const now = new Date();
        const expiration = new Date(sub.expiresAt);
        if (expiration < now && sub.status !== "inactive") {
          console.log(`⏰ Abonnement expiré automatiquement pour ${user.email}`);
          user.subscription.status = "inactive";
          user.subscription.plan = null;
          user.subscription.expiresAt = null;
          await user.save();
        }
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error("Erreur middleware protect:", error.message);
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }
  }

  return res.status(401).json({ message: "Pas de token d’authentification" });
};

/**
 * requireAdmin()
 * - À utiliser après protect()
 * - Bloque l'accès si l'utilisateur n'est pas admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Accès administrateur requis." });
  }
  next();
};
