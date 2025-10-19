// =========================================
// 💳 STRIPE - ROUTES PAIEMENT FLASHPRONO
// =========================================

import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";
import dotenv from "dotenv";
dotenv.config();

// Import Stripe compatible ESM
const Stripe = (await import("stripe")).default;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const router = express.Router();
console.log("Stripe key loaded:", process.env.STRIPE_SECRET_KEY ? "✅ OK" : "❌ MISSING");

// 🧩 Utilitaires pour URLs sûres
const trimSlash = (s = "") => s.replace(/\/+$/, "");
const withHttps = (u = "") => (/^https?:\/\//i.test(u) ? u : `https://${u}`);
const getFrontBase = (req) => {
  const envBase = trimSlash(process.env.FRONTEND_URL || process.env.CLIENT_URL || "");
  const origin = trimSlash(req.headers.origin || "");
  const base = envBase || origin;
  return withHttps(base);
};

// =========================================
// 🔹 CRÉER UNE SESSION STRIPE CHECKOUT
// =========================================
router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    const { plan } = req.body;
    const prices = { monthly: 2990, yearly: 29900 };
    if (!prices[plan]) return res.status(400).json({ message: "Plan invalide" });

    const front = getFrontBase(req);
    const success_url = `${front}/success?plan=${plan}&session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${front}/abonnements`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `Abonnement ${plan}` },
            unit_amount: prices[plan],
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: req.user?.email,
      success_url,
      cancel_url,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err?.message || err);
    return res.status(500).json({ message: err?.message || "Erreur Stripe" });
  }
});

// =========================================
// 🔹 CONFIRMER LA SESSION STRIPE
// =========================================
router.post("/confirm", protect, async (req, res) => {
  const { session_id, plan } = req.body;
  if (!session_id || !plan) return res.status(400).json({ message: "session_id ou plan manquant" });

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") return res.status(400).json({ message: "Paiement non confirmé" });

    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === "monthly") expiresAt.setDate(now.getDate() + 30);
    if (plan === "yearly") expiresAt.setDate(now.getDate() + 365);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          "subscription.plan": plan,
          "subscription.status": "active",
          "subscription.stripeId": session.id,
          "subscription.expiresAt": expiresAt,
        },
      },
      { new: true }
    ).select("-password");

    return res.json({ ok: true, user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: e.message });
  }
});

// =========================================
// 🔹 ACTIVER UN ESSAI GRATUIT DE 7 JOURS
// =========================================
router.post("/trial", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (user.trialUsed) return res.status(400).json({ message: "Essai déjà utilisé." });

    const sub = user.subscription || {};
    const now = new Date();
    if (sub.expiresAt && new Date(sub.expiresAt) > now && (sub.status === "active" || sub.status === "trial")) {
      return res.status(400).json({ message: "Vous avez déjà un accès actif." });
    }

    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + 7); // 🔥 Essai gratuit de 7 jours

    user.subscription = {
      plan: "trial",
      status: "trial",
      stripeId: null,
      expiresAt,
    };
    user.trialUsed = true;

    await user.save();
    return res.json({ ok: true, user });
  } catch (e) {
    console.error("Trial error:", e);
    return res.status(500).json({ message: e.message });
  }
});

export default router;
