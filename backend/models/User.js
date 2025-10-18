import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    plan: { type: String, enum: ["monthly", "yearly", "trial", null], default: null },
    status: { type: String, enum: ["active", "inactive", "trial"], default: "inactive" },
    stripeId: { type: String, default: null },   // id d’abonnement Stripe (si tu l’utilises)
    expiresAt: { type: Date, default: null },    // date de fin d’accès
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },  // hashé (bcrypt) côté routes auth
    isAdmin:  { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false }, // ban global

    subscription: { type: SubscriptionSchema, default: () => ({}) },
    trialUsed:    { type: Boolean, default: false }, // essai gratuit déjà utilisé ?

    // 🆕 Champ ajouté : dernière activité pour détecter qui est en ligne
    lastSeen: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
