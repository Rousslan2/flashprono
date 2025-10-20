import mongoose from "mongoose";

const UserBetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    pronoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pronostic",
      required: true,
    },
    mise: {
      type: Number,
      required: true,
      default: 10,
    },
    // Snapshot du prono au moment du suivi
    equipe1: String,
    equipe2: String,
    type: String,
    cote: Number,
    resultat: String,
    date: Date,
    followedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index pour retrouver rapidement les paris d'un user
UserBetSchema.index({ userId: 1, followedAt: -1 });

export default mongoose.model("UserBet", UserBetSchema);
