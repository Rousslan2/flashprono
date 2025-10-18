// backend/models/User.js
import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    plan: { type: String, enum: ["monthly", "yearly", "trial", null], default: null },
    status: { type: String, enum: ["active", "inactive", "trial"], default: "inactive" },
    stripeId: { type: String, default: null },
    expiresAt: { type: Date, default: null },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    isAdmin:  { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    subscription: { type: SubscriptionSchema, default: () => ({}) },
    trialUsed:    { type: Boolean, default: false },
    // 👇 Nouveau champ pour la présence en ligne
    lastSeen:     { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
