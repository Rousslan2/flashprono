// backend/models/Pronostic.js
import mongoose from "mongoose";

const PronosticSchema = new mongoose.Schema(
  {
    sport: { type: String, required: true },
    date:  { type: Date, required: true },
    equipe1: { type: String, required: true },
    equipe2: { type: String, required: true },
    type:    { type: String, required: true }, // ex: "1N2"
    cote:    { type: Number, required: true },

    // Résultat manuel/auto
    resultat: { type: String, enum: ["En attente", "Gagnant", "Perdant", "Nul"], default: "En attente" },

    // Optionnel: unités (pour performance)
    stake: { type: Number, default: 1 },

    // Catégories existantes
    label: { type: String, enum: ["standard", "prono_en_or", "strategie_bankroll"], default: "standard" },
    details: { type: String, default: "" },
    audioUrl: { type: String, default: "" },

    // === Live (NOUVEAU) ===
    externalProvider: { type: String, enum: ["apifootball", "sportmonks", null], default: null },
    externalFixtureId: { type: String, default: null },

    status: { type: String, default: "NS" },      // "NS","1H","HT","2H","FT", ...
    scoreHome: { type: Number, default: 0 },
    scoreAway: { type: Number, default: 0 },
    lastSyncedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Pronostic", PronosticSchema);
