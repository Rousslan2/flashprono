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
  correctionNote: String
});

const userBetSchema = new mongoose.Schema({
  pronoId: mongoose.Schema.Types.ObjectId,
  resultat: String,
  dateValidation: Date
});

const Pronostic = mongoose.model('Pronostic', pronosticSchema);
const UserBet = mongoose.model('UserBet', userBetSchema);

console.log("🔧 Correction des prédictions incorrectement marquées");
console.log("=" .repeat(60));

/**
 * Corriger les prédictions qui ont été mal marquées
 */
async function fixIncorrectPredictions() {
  try {
    // Récupérer tous les prédictions marquées comme "perdu" depuis le 15 octobre
    const cutoffDate = new Date('2024-10-15');

    const incorrectPredictions = await Pronostic.find({
      statut: "perdu",
      sport: "Football",
      createdAt: { $gte: cutoffDate }
    });

    console.log(`📊 Trouvé ${incorrectPredictions.length} prédictions marquées "perdu" depuis le 15 octobre`);

    let fixedCount = 0;
    let totalChecked = 0;

    for (const prono of incorrectPredictions) {
      totalChecked++;

      try {
        console.log(`\n🔍 Vérification: ${prono.equipe1} vs ${prono.equipe2} (${prono.type})`);
        console.log(`   Score actuel: ${prono.scoreLive}`);
        console.log(`   Date création: ${prono.createdAt}`);

        const result = analyzeAndCorrectPrediction(prono);

        if (result && result.shouldBeGagnant) {
          // Marquer comme gagnant
          prono.statut = "gagnant";
          prono.resultat = "gagnant";
          prono.dateValidation = new Date();
          prono.correctionNote = `Corrigé automatiquement le ${new Date().toISOString()}: ${result.reason}`;

          await prono.save();

          // Corriger aussi les UserBets associés
          const syncResult = await UserBet.updateMany(
            { pronoId: prono._id },
            {
              $set: {
                resultat: "gagnant",
                dateValidation: new Date()
              }
            }
          );

          console.log(`   ✅ CORRIGÉ: ${prono.type} → gagnante (${result.reason})`);
          console.log(`   🔄 UserBets: ${syncResult.modifiedCount} paris synchronisés`);

          fixedCount++;
        } else {
          console.log(`   ℹ️ Conserve le statut "perdu" (${result?.reason || 'non applicable'})`);
        }

      } catch (error) {
        console.error(`   ❌ Erreur lors de la correction:`, error.message);
      }
    }

    console.log(`\n📈 Résumé de la correction:`);
    console.log(`   Total vérifié: ${totalChecked}`);
    console.log(`   Corrigé: ${fixedCount}`);
    console.log(`   Pourcentage de correction: ${totalChecked > 0 ? ((fixedCount/totalChecked) * 100).toFixed(1) : 0}%`);

    return {
      total: totalChecked,
      fixed: fixedCount,
      percentage: totalChecked > 0 ? (fixedCount/totalChecked) * 100 : 0
    };

  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
    return null;
  }
}

/**
 * Analyser et corriger une prédiction spécifique
 */
function analyzeAndCorrectPrediction(prono) {
  const type = prono.type.toLowerCase().trim();
  const score = prono.scoreLive;

  // Cas problématiques identifiés
  if (!score || score === "null-null") {
    return {
      shouldBeGagnant: false,
      reason: "Score non disponible"
    };
  }

  // Extraire le score
  const scoreMatch = score.match(/(\d+)-(\d+)/);
  if (!scoreMatch) {
    return {
      shouldBeGagnant: false,
      reason: "Format de score non reconnu"
    };
  }

  const [_, homeScoreStr, awayScoreStr] = scoreMatch;
  const homeScore = parseInt(homeScoreStr);
  const awayScore = parseInt(awayScoreStr);

  // Double Chance Patterns à corriger
  if (type.includes("double chance") || type.includes(" or ") ||
      type.includes("1x") || type.includes("x2") || type.includes("12")) {

    // Double chance 1X (Equipe1 or draw)
    if ((type.includes(" or draw") || type.includes("1x")) &&
        (type.includes(prono.equipe1.toLowerCase()) || type.includes("draw"))) {

      // Si c'est un match nul ou si équipe1 gagne
      if (homeScore === awayScore || homeScore > awayScore) {
        return {
          shouldBeGagnant: true,
          reason: "Double chance 1X: match nul ou équipe1 gagne"
        };
      }
    }

    // Double chance X2 (draw or Equipe2)
    if ((type.includes("draw or") || type.includes("x2")) &&
        (type.includes("draw") || type.includes(prono.equipe2.toLowerCase()))) {

      // Si c'est un match nul ou si équipe2 gagne
      if (homeScore === awayScore || awayScore > homeScore) {
        return {
          shouldBeGagnant: true,
          reason: "Double chance X2: match nul ou équipe2 gagne"
        };
      }
    }

    // Double chance 12 (Equipe1 or Equipe2)
    if (type.includes(" or ") && !type.includes("draw") &&
        (type.includes(prono.equipe1.toLowerCase()) || type.includes(prono.equipe2.toLowerCase()))) {

      // Si ce n'est pas un match nul
      if (homeScore !== awayScore) {
        return {
          shouldBeGagnant: true,
          reason: "Double chance 12: pas de match nul"
        };
      }
    }
  }

  // Victoire spécifique d'équipe
  if (type.includes("victoire") || type.includes("win") ||
      type === "1" || type === "2") {

    // Si l'équipe mentionnée gagne réellement
    if (type.includes(prono.equipe1.toLowerCase()) || type === "1") {
      if (homeScore > awayScore) {
        return {
          shouldBeGagnant: true,
          reason: "Victoire équipe1 confirmée"
        };
      }
    }

    if (type.includes(prono.equipe2.toLowerCase()) || type === "2") {
      if (awayScore > homeScore) {
        return {
          shouldBeGagnant: true,
          reason: "Victoire équipe2 confirmée"
        };
      }
    }
  }

  // Nul/Draw
  if (type.includes("nul") || type.includes("draw") || type === "x") {
    if (homeScore === awayScore) {
      return {
        shouldBeGagnant: true,
        reason: "Match nul confirmé"
      };
    }
  }

  return {
    shouldBeGagnant: false,
    reason: "Statut correct ou non déterminable"
  };
}

// Exécution
async function main() {
  await connectDB();
  const result = await fixIncorrectPredictions();

  console.log("\n🎯 Correction terminée!");
  if (result) {
    console.log(`📊 Statistiques: ${result.fixed}/${result.total} corrections appliquées`);
  }

  process.exit(0);
}

main().catch(console.error);