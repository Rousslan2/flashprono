import mongoose from "mongoose";
import dotenv from "dotenv";

// Configuration
dotenv.config();

// Connexion à la base de données
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Erreur MongoDB:", error.message);
    process.exit(1);
  }
};

// Modèles
const pronosticSchema = new mongoose.Schema({
  equipe1: String,
  equipe2: String,
  type: String,
  statut: String,
  resultat: String,
  scoreLive: String,
  createdAt: Date,
  dateValidation: Date,
  correctionNote: String,
  sport: String,
  date: Date,
  cote: String,
  label: String,
  details: String,
  audioUrl: String
});

const Pronostic = mongoose.model('Pronostic', pronosticSchema);

console.log("🔍 Debug des pronostics en cours");
console.log("=" .repeat(60));

async function debugOngoingPredictions() {
  try {
    // Récupérer tous les pronostics en cours
    const ongoingPronostics = await Pronostic.find({
      statut: "en cours",
      sport: "Football"
    }).sort({ date: 1 });

    console.log(`📊 ${ongoingPronostics.length} pronostic(s) en cours trouvés`);

    if (ongoingPronostics.length === 0) {
      console.log("✅ Aucun pronostic en cours");
      return;
    }

    // Analyser chaque pronostic
    for (let i = 0; i < ongoingPronostics.length; i++) {
      const p = ongoingPronostics[i];
      const matchDate = new Date(p.date);
      const now = new Date();
      const hoursSinceMatch = (now - matchDate) / (1000 * 60 * 60);

      console.log(`\n${i + 1}. ${p.equipe1} vs ${p.equipe2}`);
      console.log(`   Type: ${p.type}`);
      console.log(`   Date: ${matchDate.toLocaleString('fr-FR')}`);
      console.log(`   Heures écoulées: ${hoursSinceMatch.toFixed(1)}h`);
      console.log(`   Statut: ${p.statut}`);
      console.log(`   Score: ${p.scoreLive || 'N/A'}`);

      // Déterminer si le match devrait être terminé
      let shouldBeFinished = false;
      let reason = "";

      if (hoursSinceMatch > 3) {
        shouldBeFinished = true;
        reason = "Plus de 3h depuis le début du match";
      } else if (hoursSinceMatch > 2 && p.scoreLive && p.scoreLive.includes('-')) {
        // Si on a un score et que ça fait plus de 2h, c'est probablement fini
        shouldBeFinished = true;
        reason = "Score présent + plus de 2h écoulées";
      }

      if (shouldBeFinished) {
        console.log(`   ❌ DEVRAIT ÊTRE TERMINÉ: ${reason}`);
      } else {
        console.log(`   ✅ Normalement en cours`);
      }
    }

    // Statistiques
    const totalOngoing = ongoingPronostics.length;
    const oldMatches = ongoingPronostics.filter(p => {
      const hoursSince = (new Date() - new Date(p.date)) / (1000 * 60 * 60);
      return hoursSince > 3;
    }).length;

    const matchesWithScore = ongoingPronostics.filter(p => p.scoreLive && p.scoreLive.includes('-')).length;

    console.log(`\n📈 STATISTIQUES:`);
    console.log(`   Total en cours: ${totalOngoing}`);
    console.log(`   Matchs de +3h: ${oldMatches}`);
    console.log(`   Avec score: ${matchesWithScore}`);
    console.log(`   Taux potentiellement bloqué: ${totalOngoing > 0 ? ((oldMatches / totalOngoing) * 100).toFixed(1) : 0}%`);

    if (oldMatches > 0) {
      console.log(`\n⚠️ ${oldMatches} pronostic(s) semblent bloqués en "en cours"`);
      console.log(`💡 Solution: Exécuter une vérification manuelle des résultats`);
    }

  } catch (error) {
    console.error("❌ Erreur debug:", error);
  }
}

// Exécution
async function main() {
  await connectDB();
  await debugOngoingPredictions();

  console.log(`\n🎯 DEBUG TERMINÉ`);
  process.exit(0);
}

main().catch(console.error);