import mongoose from "mongoose";

const LiveSchema = new mongoose.Schema(
  {
    isLive: { type: Boolean, default: false },
    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },
    minute: { type: String, default: "" },
    status: { type: String, default: "" },
    lastUpdate: { type: Date, default: null },
    provider: { type: String, default: "" },
  },
  { _id: false }
);

const PronosticSchema = new mongoose.Schema(
  {
    sport: { type: String, required: true },
    date: { type: Date, required: true },
    equipe1: { type: String, required: true },
    equipe2: { type: String, required: true },
    type: { type: String, required: true },
    cote: { type: Number, required: true },
    resultat: { type: String, default: "En attente" },

    label: { type: String, enum: ["standard", "prono_en_or", "strategie_bankroll"], default: "standard" },
    details: { type: String, default: "" },
    audioUrl: { type: String, default: "" },

    live: { type: LiveSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model("Pronostic", PronosticSchema);
