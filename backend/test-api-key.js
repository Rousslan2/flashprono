import axios from "axios";

const API_KEY = "f7ed67f2c2mshfb221f84cbbf6fep11f408jsn13cc322e0d3c";

/**
 * 🔑 Test de la clé API Football
 */
async function testAPIKey() {
  console.log("🔑 Test de la clé API Football");
  console.log("═".repeat(60));
  console.log(`Clé: ${API_KEY.substring(0, 20)}...`);
  console.log("═".repeat(60) + "\n");

  const tests = [
    {
      name: "Aujourd'hui (2025-11-08)",
      date: "2025-11-08"
    },
    {
      name: "Hier (2025-11-07)",
      date: "2025-11-07"
    },
    {
      name: "Il y a 3 jours (2025-11-05)",
      date: "2025-11-05"
    },
    {
      name: "Il y a 7 jours (2025-11-01)",
      date: "2025-11-01"
    }
  ];

  for (const test of tests) {
    console.log(`\n📅 Test: ${test.name}`);
    console.log("─".repeat(60));

    try {
      const { data } = await axios.get(`https://v3.football.api-sports.io/fixtures`, {
        params: { date: test.date },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
        timeout: 10000,
      });

      const matches = data.response || [];
      console.log(`✅ Réponse reçue: ${matches.length} matchs`);

      if (matches.length > 0) {
        console.log(`\n📋 Premiers matchs (5 max):`);
        matches.slice(0, 5).forEach((m, i) => {
          const home = m.teams.home.name;
          const away = m.teams.away.name;
          const score = `${m.goals.home ?? '?'}-${m.goals.away ?? '?'}`;
          const status = m.fixture.status.short;
          const league = m.league.name;
          
          console.log(`   ${i+1}. ${home} vs ${away}`);
          console.log(`      Score: ${score} | Statut: ${status} | Ligue: ${league}`);
        });
      } else {
        console.log(`⚠️  Aucun match trouvé pour cette date`);
      }

      // Vérifier le quota restant
      if (data.parameters) {
        console.log(`\n📊 Infos API:`);
        console.log(`   Requêtes: ${data.results || 0} résultats`);
      }

      // Petite pause entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 1500));

    } catch (error) {
      console.log(`❌ ERREUR: ${error.message}`);
      
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data?.message || 'N/A'}`);
        
        if (error.response.status === 403) {
          console.log(`\n⚠️  ACCÈS REFUSÉ (403)`);
          console.log(`   → La clé API est peut-être invalide ou expirée`);
          console.log(`   → Ou le quota est dépassé`);
        } else if (error.response.status === 429) {
          console.log(`\n⚠️  RATE LIMIT DÉPASSÉ (429)`);
          console.log(`   → Trop de requêtes, attendre avant de réessayer`);
        }
      }
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log("✅ Tests terminés");
  console.log("═".repeat(60));
}

testAPIKey();