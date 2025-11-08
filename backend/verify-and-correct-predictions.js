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

console.log("🔍 Vérification et correction des prédictions");
console.log("=" .repeat(60));

// Liste des prédictions à vérifier depuis les données utilisateur
const predictionsToCheck = [
  { equipe1: "Paris FC", equipe2: "Rennes", type: "Double chance : Paris FC or draw", expected: "perdu", score: "0-1" },
  { equipe1: "Pisa", equipe2: "Cremonese", type: "Double chance : draw or Cremonese", expected: "perdu", score: "1-0" },
  { equipe1: "Twente", equipe2: "Telstar", type: "Double chance : Twente or draw", expected: "gagnant", score: "0-0" },
  { equipe1: "Genclerbirligi", equipe2: "Istanbul Basaksehir", type: "Double chance : draw or Istanbul Basaksehir", expected: "perdu", score: "2-1" },
  { equipe1: "Adelaide United", equipe2: "Western Sydney Wanderers", type: "Double chance : Adelaide United or draw", expected: "gagnant", score: "2-1" },
  { equipe1: "Rizespor", equipe2: "Fatih Karagümrük", type: "Double chance : Rizespor or draw", expected: "gagnant", score: "1-0" },
  { equipe1: "Alanyaspor", equipe2: "Gazişehir Gaziantep", type: "Double chance : Alanyaspor or draw", expected: "gagnant", score: "2-0" },
  { equipe1: "Wisla Plock", equipe2: "Pogon Szczecin", type: "Double chance : Wisla Plock or draw", expected: "gagnant", score: "1-0" },
  { equipe1: "Everton de Vina", equipe2: "Union Espanola", type: "Double chance : Everton de Vina or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Palestino", equipe2: "Deportes Limache", type: "Double chance : Palestino or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Sunderland", equipe2: "Everton", type: "Double chance : Sunderland or draw", expected: "gagnant", score: "2-1" },
  { equipe1: "Lazio", equipe2: "Cagliari", type: "Double chance : Lazio or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Cracovia Krakow", equipe2: "Zaglebie Lubin", type: "Double chance : Cracovia Krakow or draw", expected: "gagnant", score: "2-1" },
  { equipe1: "Coquimbo Unido", equipe2: "Union La Calera", type: "Double chance : Coquimbo Unido or draw", expected: "gagnant", score: "1-0" },
  { equipe1: "FC Porto", equipe2: "SC Braga", type: "Double chance : FC Porto or draw", expected: "gagnant", score: "2-1" },
  { equipe1: "U. Catolica", equipe2: "O'Higgins", type: "Double chance : U. Catolica or draw", expected: "en cours", score: "null-null" },
  { equipe1: "AC Milan", equipe2: "AS Roma", type: "Double chance : draw or AS Roma", expected: "perdu", score: "1-0" },
  { equipe1: "Stade Brestois 29", equipe2: "Lyon", type: "Double chance : Stade Brestois 29 or draw", expected: "gagnant", score: "2-1" },
  { equipe1: "AEK Athens FC", equipe2: "Panetolikos", type: "Double chance : AEK Athens FC or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Sampdoria", equipe2: "Mantova", type: "Double chance : Sampdoria or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Besiktas", equipe2: "Fenerbahce", type: "Double chance : Besiktas or draw", expected: "en cours", score: "null-null" },
  { equipe1: "FC Nordsjaelland", equipe2: "Odense", type: "Double chance : FC Nordsjaelland or draw", expected: "gagnant", score: "2-0" },
  { equipe1: "Parma", equipe2: "Bologna", type: "Double chance : draw or Bologna", expected: "perdu", score: "2-1" },
  { equipe1: "Manchester City", equipe2: "Bournemouth", type: "Double chance : Manchester City or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Monza", equipe2: "Spezia", type: "Double chance : Monza or draw", expected: "gagnant", score: "1-0" },
  { equipe1: "Toulouse", equipe2: "Le Havre", type: "Double chance : Toulouse or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Nantes", equipe2: "Metz", type: "Double chance : Nantes or draw", expected: "gagnant", score: "2-0" },
  { equipe1: "Lille", equipe2: "Angers", type: "Double chance : Lille or draw", expected: "gagnant", score: "1-0" },
  { equipe1: "Sonderjyske", equipe2: "Vejle", type: "Double chance : Sonderjyske or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Bari", equipe2: "Cesena", type: "Double chance : Bari or draw", expected: "gagnant", score: "2-1" },
  { equipe1: "Modena", equipe2: "Juve Stabia", type: "Double chance : Modena or draw", expected: "gagnant", score: "1-0" },
  { equipe1: "Kayserispor", equipe2: "Kasimpasa", type: "Double chance : draw or Kasimpasa", expected: "en cours", score: "null-null" },
  { equipe1: "Torino", equipe2: "Pisa", type: "Double chance : Torino or draw", expected: "gagnant", score: "1-0" },
  { equipe1: "Fiorentina", equipe2: "Lecce", type: "Double chance : Fiorentina or draw", expected: "gagnant", score: "2-0" },
  { equipe1: "Yunnan Yukun", equipe2: "Qingdao Youth Island", type: "Double chance : Yunnan Yukun or draw", expected: "gagnant", score: "3-1" },
  { equipe1: "Konyaspor", equipe2: "Samsunspor", type: "Double chance : draw or Samsunspor", expected: "en cours", score: "null-null" },
  { equipe1: "Verona", equipe2: "Inter", type: "Double chance : draw or Inter", expected: "en cours", score: "null-null" },
  { equipe1: "Qingdao Jonoon", equipe2: "Wuhan Three Towns", type: "Double chance : Qingdao Jonoon or draw", expected: "gagnant", score: "2-1" },
  { equipe1: "Shandong Luneng", equipe2: "Tianjin Teda", type: "Double chance : Shandong Luneng or draw", expected: "gagnant", score: "3-0" },
  { equipe1: "Auckland", equipe2: "Adelaide United", type: "Double chance : Auckland or draw", expected: "gagnant", score: "1-0" },
  { equipe1: "Liverpool", equipe2: "Aston Villa", type: "Double chance : Liverpool or draw", expected: "gagnant", score: "2-1" },
  { equipe1: "Cremonese", equipe2: "Juventus", type: "Double chance : draw or Juventus", expected: "gagnant", score: "1-2" },
  { equipe1: "Palermo", equipe2: "Pescara", type: "Double chance : Palermo or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Casa Pia", equipe2: "Estrela", type: "Double chance : Casa Pia or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Atromitos", equipe2: "Kifisia", type: "Double chance : draw or Kifisia", expected: "en cours", score: "null-null" },
  { equipe1: "FC Copenhagen", equipe2: "FC Fredericia", type: "Double chance : FC Copenhagen or draw", expected: "gagnant", score: "3-0" },
  { equipe1: "Galatasaray", equipe2: "Trabzonspor", type: "Double chance : Galatasaray or draw", expected: "gagnant", score: "2-1" },
  { equipe1: "Napoli", equipe2: "Como", type: "Double chance : Napoli or draw", expected: "en cours", score: "null-null" },
  { equipe1: "Shelbourne", equipe2: "St Patrick's Athl.", type: "Double chance : Shelbourne or draw", expected: "gagnant", score: "2-0" },
  { equipe1: "Shamrock Rovers", equipe2: "Sligo Rovers", type: "Double chance : Shamrock Rovers or draw", expected: "gagnant", score: "1-0" }
];

async function verifyAndCorrectPredictions() {
  try {
    console.log(`📊 Vérification de ${predictionsToCheck.length} prédictions...`);

    let corrected = 0;
    let verified = 0;

    for (const expected of predictionsToCheck) {
      verified++;

      // Chercher la prédiction dans la base de données
      const dbPrediction = await Pronostic.findOne({
        equipe1: expected.equipe1,
        equipe2: expected.equipe2,
        type: expected.type,
        statut: "perdu" // On ne corrige que celles marquées comme perdues
      });

      if (dbPrediction) {
        console.log(`\n🔍 TROUVÉ: ${expected.equipe1} vs ${expected.equipe2}`);
        console.log(`   Type: ${expected.type}`);
        console.log(`   Score actuel: ${dbPrediction.scoreLive}`);
        console.log(`   Score attendu: ${expected.score}`);
        console.log(`   Statut actuel: ${dbPrediction.statut}`);
        console.log(`   Statut attendu: ${expected.expected}`);

        // Analyser si la correction est nécessaire
        const correctionNeeded = analyzeCorrection(expected, dbPrediction);

        if (correctionNeeded.needsCorrection) {
          console.log(`   ✅ CORRECTION NÉCESSAIRE: ${correctionNeeded.reason}`);

          // Appliquer la correction
          dbPrediction.statut = correctionNeeded.correctStatus;
          dbPrediction.resultat = correctionNeeded.correctStatus;
          dbPrediction.dateValidation = new Date();
          dbPrediction.correctionNote = `Correction automatique: ${correctionNeeded.reason} - ${new Date().toISOString()}`;

          await dbPrediction.save();

          // Corriger les UserBets
          const syncResult = await UserBet.updateMany(
            { pronoId: dbPrediction._id },
            {
              $set: {
                resultat: correctionNeeded.correctStatus,
                dateValidation: new Date()
              }
            }
          );

          console.log(`   🔄 UserBets synchronisés: ${syncResult.modifiedCount}`);
          corrected++;
        } else {
          console.log(`   ℹ️ Statut correct: ${correctionNeeded.reason}`);
        }
      } else {
        console.log(`\n⚠️ NON TROUVÉ: ${expected.equipe1} vs ${expected.equipe2} (${expected.type})`);
      }

      // Petite pause pour éviter de surcharger
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📈 RÉSULTATS:`);
    console.log(`   Vérifiées: ${verified}`);
    console.log(`   Corrigées: ${corrected}`);
    console.log(`   Taux de correction: ${verified > 0 ? ((corrected/verified) * 100).toFixed(1) : 0}%`);

    return { verified, corrected };

  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
    return { verified: 0, corrected: 0 };
  }
}

function analyzeCorrection(expected, dbPrediction) {
  const type = expected.type.toLowerCase().trim();
  const score = expected.score;

  // Extraire le score
  const scoreMatch = score.match(/(\d+)-(\d+)/);
  if (!scoreMatch) {
    return {
      needsCorrection: false,
      reason: "Score non analysable",
      correctStatus: expected.expected
    };
  }

  const [_, homeScoreStr, awayScoreStr] = scoreMatch;
  const homeScore = parseInt(homeScoreStr);
  const awayScore = parseInt(awayScoreStr);

  // Double Chance Analysis
  if (type.includes("double chance") || type.includes(" or ")) {
    if (type.includes(" or draw") && type.includes(expected.equipe1.toLowerCase())) {
      // Double chance 1X (Equipe1 or draw)
      if (homeScore >= awayScore) {
        return {
          needsCorrection: expected.expected !== "gagnant",
          reason: `Double chance 1X gagnante: ${expected.equipe1} gagne (${homeScore}-${awayScore}) ou match nul`,
          correctStatus: "gagnant"
        };
      }
    }

    if (type.includes("draw or") && type.includes(expected.equipe2.toLowerCase())) {
      // Double chance X2 (draw or Equipe2)
      if (awayScore >= homeScore) {
        return {
          needsCorrection: expected.expected !== "gagnant",
          reason: `Double chance X2 gagnante: ${expected.equipe2} gagne (${homeScore}-${awayScore}) ou match nul`,
          correctStatus: "gagnant"
        };
      }
    }
  }

  return {
    needsCorrection: false,
    reason: "Analyse incomplète ou statut correct",
    correctStatus: expected.expected
  };
}

// Exécution
async function main() {
  await connectDB();
  const result = await verifyAndCorrectPredictions();

  console.log(`\n🎯 VÉRIFICATION TERMINÉE!`);
  console.log(`📊 ${result.corrected}/${result.verified} corrections appliquées`);

  process.exit(0);
}

main().catch(console.error);