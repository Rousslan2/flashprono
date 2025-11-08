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

console.log("🔍 Recherche et correction: Union Berlin predictions");
console.log("=" .repeat(60));

async function findAndFixUnionBerlin() {
  try {
    // Recherche large pour Union Berlin
    const unionBerlinPredictions = await Pronostic.find({
      $or: [
        { equipe1: /union berlin/i },
        { equipe2: /union berlin/i },
        { equipe1: /union/i },
        { equipe2: /union/i }
      ],
      statut: "perdu"
    }).sort({ createdAt: -1 }).limit(10);

    console.log(`📊 Trouvé ${unionBerlinPredictions.length} prédictions Union Berlin marquées "perdu"`);

    for (let i = 0; i < unionBerlinPredictions.length; i++) {
      const prono = unionBerlinPredictions[i];
      console.log(`\n${i + 1}. ${prono.equipe1} vs ${prono.equipe2}`);
      console.log(`   Type: ${prono.type}`);
      console.log(`   Score: ${prono.scoreLive}`);
      console.log(`   Statut: ${prono.statut}`);
      console.log(`   Date: ${prono.createdAt}`);

      // Vérifier si c'est la prédiction double chance Union Berlin or draw
      if (prono.type.includes("Double chance") &&
          prono.type.includes("Union Berlin") &&
          prono.type.includes("or draw") &&
          prono.scoreLive.includes("4-0")) {

        console.log(`\n🎯 TROUVÉ! Prédiction à corriger:`);
        console.log(`   ID: ${prono._id}`);

        // Analyser le score
        const scoreMatch = prono.scoreLive.match(/(\d+)-(\d+)/);
        if (scoreMatch) {
          const [_, homeScoreStr, awayScoreStr] = scoreMatch;
          const homeScore = parseInt(homeScoreStr);
          const awayScore = parseInt(awayScoreStr);

          console.log(`   Score analysé: ${homeScore}-${awayScore}`);
          console.log(`   Union Berlin a gagné: ${homeScore > awayScore}`);
          console.log(`   Double chance devrait gagner: ${homeScore >= awayScore}`);

          if (homeScore >= awayScore) {
            // Corriger
            prono.statut = "gagnant";
            prono.resultat = "gagnant";
            prono.dateValidation = new Date();
            prono.correctionNote = `Corrigé automatiquement le ${new Date().toISOString()}: Double chance Union Berlin or draw - Union Berlin a gagné ${homeScore}-${awayScore}`;

            await prono.save();

            // Corriger UserBets
            const syncResult = await UserBet.updateMany(
              { pronoId: prono._id },
              {
                $set: {
                  resultat: "gagnant",
                  dateValidation: new Date()
                }
              }
            );

            console.log(`\n✅ CORRECTION APPLIQUÉE:`);
            console.log(`   Statut: perdu → gagnant`);
            console.log(`   UserBets synchronisés: ${syncResult.modifiedCount}`);
            console.log(`   Raison: Double chance "Union Berlin or draw" gagnante`);

            return true;
          }
        }
      }
    }

    console.log(`\n❌ Aucune prédiction Union Berlin double chance trouvée à corriger`);
    return false;

  } catch (error) {
    console.error("❌ Erreur:", error);
    return false;
  }
}

// Recherche générale des prédictions perdues récentes
async function showRecentLostPredictions() {
  try {
    console.log(`\n📋 Dernières prédictions marquées "perdu" (10 dernières):`);

    const recentLost = await Pronostic.find({
      statut: "perdu",
      sport: "Football"
    }).sort({ createdAt: -1 }).limit(10);

    for (let i = 0; i < recentLost.length; i++) {
      const prono = recentLost[i];
      console.log(`${i + 1}. ${prono.equipe1} vs ${prono.equipe2} (${prono.type}) - ${prono.scoreLive} - ${prono.createdAt.toISOString().split('T')[0]}`);
    }

  } catch (error) {
    console.error("❌ Erreur recherche:", error);
  }
}

// Exécution
async function main() {
  await connectDB();

  const fixed = await findAndFixUnionBerlin();
  await showRecentLostPredictions();

  console.log("\n🎯 Recherche terminée!");
  console.log(fixed ? "✅ Prédiction Union Berlin corrigée" : "❌ Aucune correction appliquée");

  process.exit(0);
}

main().catch(console.error);