import mongoose from "mongoose";

const pronosticSchema = new mongoose.Schema({
  details: { type: String, default: "" },
  audioUrl: { type: String, default: "" },
  label: { type: String, enum: ["standard","prono_en_or","strategie_bankroll"], default: "standard" },
  sport: { type: String, required: true },
  equipe1: { type: String, required: true },
  equipe2: { type: String, required: true },
  cote: { type: Number, required: true },
  type: { type: String, required: true },
  resultat: { type: String, default: "en attente" },
  date: { type: Date, default: Date.now },
  competition: { type: String },
  bookmaker: { type: String },
  confiance: { type: Number, min: 0, max: 100, default: 50 },
  image: { type: String },
  analyse: { type: String },
  statut: { type: String, enum: ['en attente','gagné','perdu','remboursé'], default: 'en attente' },
  categorie: { type: String, enum: ['standard','pronos_en_or','strategie_bankroll'], default: 'standard' },
}, { timestamps: true });

export default mongoose.model("Pronostic", pronosticSchema);
