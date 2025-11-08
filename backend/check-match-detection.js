import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_KEY = process.env.FOOTBALL_API_KEY;
const API_BASE_URL = "https://v3.football.api-sports.io";

console.log("🔍 Analyse de la détection de matchs");
console.log("=" .repeat(50));

// Test de détection pour FC Andorra vs Granada CF
async function checkMatchDetection() {
  try {
    console.log("🏟️ Recherche du match: FC Andorra vs Granada CF");

    // Tester différentes dates autour du 17 octobre
    const testDates = [
      "2024-10-17", // Date originale
      "2024-10-16", // Jour précédent
      "2024-10-18", // Jour suivant
      "2024-10-19"  // Jour d'après
    ];

    for (const date of testDates) {
      console.log(`\n📅 Test date: ${date}`);

      try {
        const response = await axios.get(`${API_BASE_URL}/fixtures`, {
          params: { date: date },
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
        });

        const matches = response.data.response || [];
        console.log(`   📊 ${matches.length} matchs trouvés`);

        // Chercher FC Andorra ou Granada CF
        const andorraMatches = matches.filter(match =>
          match.teams.home.name.toLowerCase().includes('andorra') ||
          match.teams.away.name.toLowerCase().includes('andorra') ||
          match.teams.home.name.toLowerCase().includes('granada') ||
          match.teams.away.name.toLowerCase().includes('granada')
        );

        if (andorraMatches.length > 0) {
          console.log(`   ✅ MATCHS TROUVÉS:`);
          andorraMatches.forEach((match, i) => {
            console.log(`      ${i+1}. ${match.teams.home.name} vs ${match.teams.away.name}`);
            console.log(`         Ligue: ${match.league.name} (${match.league.country})`);
            console.log(`         Statut: ${match.fixture.status.short}`);
            console.log(`         Score: ${match.goals.home}-${match.goals.away}`);
            console.log(`         Date: ${new Date(match.fixture.timestamp * 1000).toLocaleString('fr-FR')}`);
          });
        } else {
          console.log(`   ❌ Aucun match Andorra/Granada trouvé`);
        }

      } catch (error) {
        console.log(`   ❌ Erreur pour ${date}:`, error.response?.status || error.message);
      }

      // Pause pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test des ligues espagnoles
    console.log(`\n🇪🇸 Test des ligues espagnoles:`);
    try {
      const leaguesResponse = await axios.get(`${API_BASE_URL}/leagues`, {
        params: { country: "Spain" },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      });

      const spanishLeagues = leaguesResponse.data.response || [];
      console.log(`   📊 ${spanishLeagues.length} ligues espagnoles trouvées`);

      spanishLeagues.slice(0, 10).forEach(league => {
        console.log(`   - ${league.league.name} (${league.league.id})`);
      });

    } catch (error) {
      console.log(`   ❌ Erreur ligues espagnoles:`, error.response?.status || error.message);
    }

  } catch (error) {
    console.log("❌ Erreur générale:", error.message);
  }
}

// Test de correspondance d'équipe
function testTeamMatching() {
  console.log(`\n🏆 Test de correspondance d'équipes:`);

  const testCases = [
    { prono: "FC Andorra", api: "FC Andorra" },
    { prono: "FC Andorra", api: "Andorra CF" },
    { prono: "Granada CF", api: "Granada CF" },
    { prono: "Granada CF", api: "Granada" },
    { prono: "FC Andorra", api: "FC Andorra" }
  ];

  testCases.forEach(test => {
    const similarity = calculateTeamSimilarity(test.prono, test.api);
    console.log(`   "${test.prono}" vs "${test.api}" = ${similarity.toFixed(2)}`);
  });
}

// Fonction de similarité (copiée du pronosticChecker)
function calculateTeamSimilarity(pronoTeam, matchTeam) {
  const pronoNormalized = normalizeTeamName(pronoTeam);
  const matchNormalized = normalizeTeamName(matchTeam);

  // Direct match
  if (pronoNormalized === matchNormalized) {
    return 1.0;
  }

  // Fuzzy matching with word overlap
  const pronoWords = pronoNormalized.split(' ').filter(word => word.length > 2);
  const matchWords = matchNormalized.split(' ').filter(word => word.length > 2);

  let matches = 0;
  for (const pronoWord of pronoWords) {
    for (const matchWord of matchWords) {
      if (pronoWord.includes(matchWord) || matchWord.includes(pronoWord)) {
        matches++;
        break;
      }
    }
  }

  return pronoWords.length > 0 ? matches / pronoWords.length : 0;
}

function normalizeTeamName(teamName) {
  return teamName
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\b(fc|cf|ac|as|ogc|ssc|olympique|football club|sport|de|united|afc|ufc)\b/g, '') // Remove common terms
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

// Exécution
async function main() {
  testTeamMatching();
  await checkMatchDetection();
}

main().catch(console.error);