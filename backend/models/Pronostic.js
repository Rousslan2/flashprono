import mongoose from "mongoose";

const pronosticSchema = new mongoose.Schema({
  // Nouveaux champs
  details: { type: String, default: "" },
  audioUrl: { type: String, default: "" },
  label: { type: String, enum: ["standard","prono_en_or","strategie_bankroll"], default: "standard" },
  sport: { type: String, required: true },
  equipe1: { type: String, required: true },
  equipe2: { type: String, required: true },
  cote: { type: Number, required: true },
  type: { type: String, required: true },
  resultat: { type: String, default: "en attente" },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Pronostic", pronosticSchema);
