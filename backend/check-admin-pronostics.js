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

console.log("🔍 Vérification des pronostics dans l'admin");
console.log("=" .repeat(60));

async function checkAdminPronostics() {
  try {
    // Récupérer tous les pronostics (comme dans l'admin)
    const allPronostics = await Pronostic.find({}).sort({ createdAt: -1 });

    console.log(`📊 Total des pronostics en base: ${allPronostics.length}`);

    // Statistiques par statut
    const stats = {
      total: allPronostics.length,
      enAttente: 0,
      enCours: 0,
      gagnant: 0,
      perdu: 0,
      rembourse: 0,
      autres: 0
    };

    // Statistiques par sport
    const sports = {};

    // Statistiques par type de pari
    const types = {};

    // Derniers pronostics (comme affiché dans l'admin)
    const recentPronostics = allPronostics.slice(0, 10);

    console.log(`\n📋 Statistiques par statut:`);
    allPronostics.forEach(prono => {
      const statut = prono.statut || prono.resultat || "Non défini";

      if (statut.toLowerCase().includes("attente")) stats.enAttente++;
      else if (statut.toLowerCase().includes("cours")) stats.enCours++;
      else if (statut.toLowerCase().includes("gagnant") || statut.toLowerCase().includes("win")) stats.gagnant++;
      else if (statut.toLowerCase().includes("perdu") || statut.toLowerCase().includes("lose")) stats.perdu++;
      else if (statut.toLowerCase().includes("rembourse")) stats.rembourse++;
      else stats.autres++;

      // Sport
      const sport = prono.sport || "Non défini";
      sports[sport] = (sports[sport] || 0) + 1;

      // Type de pari
      const type = prono.type || "Non défini";
      types[type] = (types[type] || 0) + 1;
    });

    console.log(`   En attente: ${stats.enAttente}`);
    console.log(`   En cours: ${stats.enCours}`);
    console.log(`   Gagnants: ${stats.gagnant}`);
    console.log(`   Perdus: ${stats.perdu}`);
    console.log(`   Remboursés: ${stats.rembourse}`);
    console.log(`   Autres: ${stats.autres}`);

    console.log(`\n🏆 Statistiques par sport:`);
    Object.entries(sports).forEach(([sport, count]) => {
      console.log(`   ${sport}: ${count}`);
    });

    console.log(`\n🎯 Top 10 types de paris:`);
    Object.entries(types)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([type, count]) => {
        console.log(`   ${type}: ${count}`);
      });

    console.log(`\n📅 Derniers 10 pronostics (comme dans l'admin):`);
    recentPronostics.forEach((prono, i) => {
      const date = prono.createdAt ? prono.createdAt.toISOString().split('T')[0] : 'N/A';
      const statut = prono.statut || prono.resultat || 'N/A';
      console.log(`${i + 1}. ${date} - ${prono.equipe1 || 'N/A'} vs ${prono.equipe2 || 'N/A'} (${prono.type || 'N/A'}) - ${statut}`);
    });

    // Vérifier si tous les pronostics sont visibles
    console.log(`\n🔍 Analyse de visibilité:`);

    const footballPronostics = allPronostics.filter(p =>
      (p.sport || "").toLowerCase().includes("foot")
    );

    console.log(`   Pronostics Football: ${footballPronostics.length}/${allPronostics.length}`);

    const recentFootball = footballPronostics.slice(0, 50); // Comme limité dans l'admin
    console.log(`   Pronostics Football récents (limite 50): ${recentFootball.length}`);

    // Vérifier les pronostics manquants
    const userProvidedPronostics = [
      "Paris FC vs Rennes",
      "Pisa vs Cremonese",
      "Twente vs Telstar",
      "Genclerbirligi vs Istanbul Basaksehir",
      "Adelaide United vs Western Sydney Wanderers",
      "Rizespor vs Fatih Karagümrük",
      "Alanyaspor vs Gazişehir Gaziantep",
      "Wisla Plock vs Pogon Szczecin",
      "Everton de Vina vs Union Espanola",
      "Palestino vs Deportes Limache",
      "Sunderland vs Everton",
      "Lazio vs Cagliari",
      "Cracovia Krakow vs Zaglebie Lubin",
      "Coquimbo Unido vs Union La Calera",
      "FC Porto vs SC Braga",
      "U. Catolica vs O'Higgins",
      "AC Milan vs AS Roma",
      "Stade Brestois 29 vs Lyon",
      "AEK Athens FC vs Panetolikos",
      "Sampdoria vs Mantova",
      "Besiktas vs Fenerbahce",
      "FC Nordsjaelland vs Odense",
      "Parma vs Bologna",
      "Manchester City vs Bournemouth",
      "Monza vs Spezia",
      "Toulouse vs Le Havre",
      "Nantes vs Metz",
      "Lille vs Angers",
      "Sonderjyske vs Vejle",
      "Bari vs Cesena",
      "Modena vs Juve Stabia",
      "Kayserispor vs Kasimpasa",
      "Torino vs Pisa",
      "Fiorentina vs Lecce",
      "Yunnan Yukun vs Qingdao Youth Island",
      "Konyaspor vs Samsunspor",
      "Verona vs Inter",
      "Qingdao Jonoon vs Wuhan Three Towns",
      "Shandong Luneng vs Tianjin Teda",
      "Auckland vs Adelaide United",
      "Liverpool vs Aston Villa",
      "Cremonese vs Juventus",
      "Palermo vs Pescara",
      "Casa Pia vs Estrela",
      "Atromitos vs Kifisia",
      "FC Copenhagen vs FC Fredericia",
      "Galatasaray vs Trabzonspor",
      "Napoli vs Como",
      "Shelbourne vs St Patrick's Athl.",
      "Shamrock Rovers vs Sligo Rovers"
    ];

    console.log(`\n🔎 Vérification des pronostics utilisateur:`);
    console.log(`   Pronostics fournis par l'utilisateur: ${userProvidedPronostics.length}`);

    let foundInDB = 0;
    let notFoundInDB = 0;

    userProvidedPronostics.forEach(matchName => {
      const found = allPronostics.some(prono => {
        const dbMatch = `${prono.equipe1} vs ${prono.equipe2}`;
        return dbMatch.toLowerCase().includes(matchName.toLowerCase()) ||
               matchName.toLowerCase().includes(dbMatch.toLowerCase());
      });

      if (found) {
        foundInDB++;
      } else {
        notFoundInDB++;
        console.log(`   ❌ Non trouvé: ${matchName}`);
      }
    });

    console.log(`   Trouvés en base: ${foundInDB}/${userProvidedPronostics.length}`);
    console.log(`   Non trouvés en base: ${notFoundInDB}/${userProvidedPronostics.length}`);

    if (notFoundInDB > 0) {
      console.log(`\n⚠️ CONCLUSION: ${notFoundInDB} pronostics ne sont pas visibles dans l'admin`);
      console.log(`   Raisons possibles:`);
      console.log(`   - Limite de 50 pronostics dans l'admin (route: limit(50))`);
      console.log(`   - Pronostics plus anciens non affichés`);
      console.log(`   - Problème de tri (sort by createdAt)`);
      console.log(`   - Filtres appliqués côté frontend`);
    } else {
      console.log(`\n✅ Tous les pronostics sont visibles dans l'admin`);
    }

    return {
      total: allPronostics.length,
      found: foundInDB,
      notFound: notFoundInDB,
      stats: stats
    };

  } catch (error) {
    console.error("❌ Erreur lors de la vérification:", error);
    return null;
  }
}

// Exécution
async function main() {
  await connectDB();
  const result = await checkAdminPronostics();

  console.log(`\n🎯 VÉRIFICATION TERMINÉE!`);
  if (result) {
    console.log(`📊 Résumé: ${result.found}/${result.found + result.notFound} pronostics visibles dans l'admin`);
  }

  process.exit(0);
}

main().catch(console.error);