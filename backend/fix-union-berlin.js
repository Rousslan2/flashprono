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

console.log("🔧 Correction spécifique: Union Berlin vs Borussia Mönchengladbach");
console.log("=" .repeat(70));

async function fixUnionBerlinPrediction() {
  try {
    // Trouver la prédiction spécifique
    const unionBerlinPrediction = await Pronostic.findOne({
      equipe1: "Union Berlin",
      equipe2: "Borussia Mönchengladbach",
      type: "Double chance : Union Berlin or draw",
      statut: "perdu"
    });

    if (!unionBerlinPrediction) {
      console.log("❌ Prédiction Union Berlin non trouvée ou déjà corrigée");
      return false;
    }

    console.log(`📋 Prédiction trouvée:`);
    console.log(`   ID: ${unionBerlinPrediction._id}`);
    console.log(`   Match: ${unionBerlinPrediction.equipe1} vs ${unionBerlinPrediction.equipe2}`);
    console.log(`   Type: ${unionBerlinPrediction.type}`);
    console.log(`   Score: ${unionBerlinPrediction.scoreLive}`);
    console.log(`   Statut actuel: ${unionBerlinPrediction.statut}`);
    console.log(`   Date: ${unionBerlinPrediction.createdAt}`);

    // Vérifier que c'est bien gagnant
    const scoreMatch = unionBerlinPrediction.scoreLive.match(/(\d+)-(\d+)/);
    if (scoreMatch) {
      const [_, homeScoreStr, awayScoreStr] = scoreMatch;
      const homeScore = parseInt(homeScoreStr);
      const awayScore = parseInt(awayScoreStr);

      console.log(`\n🔍 Analyse:`);
      console.log(`   Score: ${homeScore}-${awayScore}`);
      console.log(`   Union Berlin (équipe1) a gagné: ${homeScore > awayScore}`);
      console.log(`   Double chance "Union Berlin or draw" devrait gagner: ${homeScore >= awayScore}`);

      if (homeScore >= awayScore) {
        // Corriger la prédiction
        unionBerlinPrediction.statut = "gagnant";
        unionBerlinPrediction.resultat = "gagnant";
        unionBerlinPrediction.dateValidation = new Date();
        unionBerlinPrediction.correctionNote = `Corrigé manuellement le ${new Date().toISOString()}: Double chance Union Berlin or draw - Union Berlin a gagné ${homeScore}-${awayScore}`;

        await unionBerlinPrediction.save();

        // Corriger aussi les UserBets associés
        const syncResult = await UserBet.updateMany(
          { pronoId: unionBerlinPrediction._id },
          {
            $set: {
              resultat: "gagnant",
              dateValidation: new Date()
            }
          }
        );

        console.log(`\n✅ CORRECTION APPLIQUÉE:`);
        console.log(`   Statut changé: perdu → gagnant`);
        console.log(`   UserBets synchronisés: ${syncResult.modifiedCount}`);
        console.log(`   Raison: Double chance "Union Berlin or draw" - Union Berlin a gagné ${homeScore}-${awayScore}`);

        return true;
      } else {
        console.log(`\n❌ Pas de correction nécessaire - score ne correspond pas`);
        return false;
      }
    } else {
      console.log(`❌ Format de score non reconnu: ${unionBerlinPrediction.scoreLive}`);
      return false;
    }

  } catch (error) {
    console.error("❌ Erreur lors de la correction:", error);
    return false;
  }
}

// Exécution
async function main() {
  await connectDB();
  const success = await fixUnionBerlinPrediction();

  console.log("\n🎯 Correction terminée!");
  console.log(success ? "✅ Prédiction Union Berlin corrigée avec succès" : "❌ Échec de la correction");

  process.exit(0);
}

main().catch(console.error);