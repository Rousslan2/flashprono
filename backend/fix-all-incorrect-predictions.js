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

console.log("🔧 Correction massive des prédictions incorrectement marquées");
console.log("=" .repeat(70));

async function fixAllIncorrectPredictions() {
  try {
    // Récupérer toutes les prédictions marquées comme "perdu"
    const lostPredictions = await Pronostic.find({
      statut: "perdu",
      sport: "Football"
    });

    console.log(`📊 Trouvé ${lostPredictions.length} prédictions marquées "perdu"`);

    let fixedCount = 0;
    let totalChecked = 0;

    for (const prono of lostPredictions) {
      totalChecked++;

      try {
        const result = analyzeAndCorrectPrediction(prono);

        if (result && result.shouldBeGagnant) {
          console.log(`\n🔍 CORRECTION: ${prono.equipe1} vs ${prono.equipe2}`);
          console.log(`   Type: ${prono.type}`);
          console.log(`   Score: ${prono.scoreLive}`);
          console.log(`   Raison: ${result.reason}`);

          // Corriger la prédiction
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

          console.log(`   ✅ Corrigé: ${syncResult.modifiedCount} UserBets synchronisés`);
          fixedCount++;
        }

      } catch (error) {
        console.error(`   ❌ Erreur traitement:`, error.message);
      }
    }

    console.log(`\n📈 RÉSULTATS DE LA CORRECTION:`);
    console.log(`   Total vérifié: ${totalChecked}`);
    console.log(`   Corrigé: ${fixedCount}`);
    console.log(`   Pourcentage: ${totalChecked > 0 ? ((fixedCount/totalChecked) * 100).toFixed(1) : 0}%`);

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
          reason: `Double chance 1X: ${prono.equipe1} gagne (${homeScore}-${awayScore}) ou match nul`
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
          reason: `Double chance X2: ${prono.equipe2} gagne (${homeScore}-${awayScore}) ou match nul`
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
          reason: `Double chance 12: pas de match nul (${homeScore}-${awayScore})`
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
          reason: `Victoire ${prono.equipe1} confirmée (${homeScore}-${awayScore})`
        };
      }
    }

    if (type.includes(prono.equipe2.toLowerCase()) || type === "2") {
      if (awayScore > homeScore) {
        return {
          shouldBeGagnant: true,
          reason: `Victoire ${prono.equipe2} confirmée (${homeScore}-${awayScore})`
        };
      }
    }
  }

  // Nul/Draw
  if (type.includes("nul") || type.includes("draw") || type === "x") {
    if (homeScore === awayScore) {
      return {
        shouldBeGagnant: true,
        reason: `Match nul confirmé (${homeScore}-${awayScore})`
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
  const result = await fixAllIncorrectPredictions();

  console.log("\n🎯 CORRECTION MASSIVE TERMINÉE!");
  if (result) {
    console.log(`📊 Statistiques: ${result.fixed}/${result.total} corrections appliquées (${result.percentage}%)`);
  }

  process.exit(0);
}

main().catch(console.error);