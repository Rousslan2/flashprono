import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_KEY = process.env.FOOTBALL_API_KEY;
const API_BASE_URL = "https://v3.football.api-sports.io";

console.log("🔍 Recherche spécifique: FC Andorra vs Granada CF");
console.log("=" .repeat(60));

// Recherche approfondie du match FC Andorra vs Granada CF
async function findAndorraGranadaMatch() {
  try {
    console.log("🏟️ Recherche du match FC Andorra vs Granada CF du 17 octobre 2024");

    // Tester un mois complet autour de cette date
    const startDate = new Date('2024-09-17');
    const endDate = new Date('2024-11-17');

    console.log(`📅 Période de recherche: ${startDate.toISOString().split('T')[0]} à ${endDate.toISOString().split('T')[0]}`);

    let foundMatches = [];

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];

      try {
        const response = await axios.get(`${API_BASE_URL}/fixtures`, {
          params: { date: dateStr },
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
        });

        const matches = response.data.response || [];

        // Chercher spécifiquement FC Andorra et Granada CF
        const andorraMatches = matches.filter(match => {
          const home = match.teams.home.name.toLowerCase();
          const away = match.teams.away.name.toLowerCase();

          const hasAndorra = home.includes('andorra') || away.includes('andorra');
          const hasGranada = home.includes('granada') || away.includes('granada');

          return hasAndorra && hasGranada;
        });

        if (andorraMatches.length > 0) {
          console.log(`\n🎯 MATCH TROUVÉ le ${dateStr}:`);
          andorraMatches.forEach(match => {
            console.log(`   🏟️ ${match.teams.home.name} vs ${match.teams.away.name}`);
            console.log(`   🏆 Ligue: ${match.league.name} (${match.league.country})`);
            console.log(`   📊 Score: ${match.goals.home}-${match.goals.away}`);
            console.log(`   ⏰ Statut: ${match.fixture.status.short}`);
            console.log(`   📅 Date/heure: ${new Date(match.fixture.timestamp * 1000).toLocaleString('fr-FR')}`);
            console.log(`   🆔 Match ID: ${match.fixture.id}`);
            console.log(`   🌍 Stade: ${match.fixture.venue.name}, ${match.fixture.venue.city}`);

            foundMatches.push({
              date: dateStr,
              match: match
            });
          });
        }

        // Afficher progression tous les 5 jours
        if (date.getDate() % 5 === 0) {
          console.log(`   🔄 Recherche en cours... ${dateStr} (${matches.length} matchs ce jour-là)`);
        }

      } catch (error) {
        if (error.response?.status !== 403) { // Ignorer maintenance API
          console.log(`   ❌ Erreur ${dateStr}:`, error.response?.status || error.message);
        }
      }

      // Pause pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n📊 RÉSULTATS DE LA RECHERCHE:`);
    console.log(`   Total de matchs trouvés: ${foundMatches.length}`);

    if (foundMatches.length === 0) {
      console.log(`\n❌ CONCLUSION: Le match FC Andorra vs Granada CF n'est pas dans l'API Football`);
      console.log(`   Possibles raisons:`);
      console.log(`   - Match annulé ou reporté`);
      console.log(`   - Ligue non couverte par l'API`);
      console.log(`   - Erreur dans le nom des équipes`);
      console.log(`   - Match joué dans une compétition mineure`);

      // Tester les noms d'équipes
      console.log(`\n🔍 Test des noms d'équipes dans l'API:`);
      await testTeamNames();
    }

  } catch (error) {
    console.log("❌ Erreur générale:", error.message);
  }
}

// Tester si les noms d'équipes existent dans l'API
async function testTeamNames() {
  try {
    // Tester FC Andorra
    console.log(`\n🏟️ Recherche "FC Andorra":`);
    const andorraResponse = await axios.get(`${API_BASE_URL}/teams`, {
      params: { search: "Andorra" },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    });

    const andorraTeams = andorraResponse.data.response || [];
    console.log(`   📊 ${andorraTeams.length} équipes trouvées avec "Andorra"`);

    andorraTeams.slice(0, 5).forEach(team => {
      console.log(`   - ${team.team.name} (${team.team.country}) - ID: ${team.team.id}`);
    });

    // Tester Granada
    console.log(`\n🏟️ Recherche "Granada":`);
    const granadaResponse = await axios.get(`${API_BASE_URL}/teams`, {
      params: { search: "Granada" },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    });

    const granadaTeams = granadaResponse.data.response || [];
    console.log(`   📊 ${granadaTeams.length} équipes trouvées avec "Granada"`);

    granadaTeams.slice(0, 5).forEach(team => {
      console.log(`   - ${team.team.name} (${team.team.country}) - ID: ${team.team.id}`);
    });

  } catch (error) {
    console.log(`❌ Erreur recherche équipes:`, error.response?.status || error.message);
  }
}

// Exécution
findAndorraGranadaMatch().catch(console.error);