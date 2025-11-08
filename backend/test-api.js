import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const API_KEY = process.env.FOOTBALL_API_KEY;
const API_BASE_URL = "https://v3.football.api-sports.io";

console.log("🔍 Test de l'API Football");
console.log("API Key:", API_KEY ? "Présente" : "Manquante");

if (!API_KEY) {
  console.log("❌ Clé API manquante");
  process.exit(1);
}

async function testAPI() {
  try {
    console.log("🌐 Test de connexion à l'API...");

    const response = await axios.get(`${API_BASE_URL}/fixtures`, {
      params: { date: "2024-11-08" },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
    });

    console.log("✅ API fonctionnelle!");
    console.log(`📊 ${response.data.response?.length || 0} matchs trouvés pour aujourd'hui`);

    if (response.data.response && response.data.response.length > 0) {
      console.log("\n📋 Exemples de matchs:");
      response.data.response.slice(0, 3).forEach((match, i) => {
        console.log(`${i + 1}. ${match.teams.home.name} vs ${match.teams.away.name} - ${match.fixture.status.short}`);
      });
    }

  } catch (error) {
    console.log("❌ Erreur API:", error.response?.status || error.message);
    if (error.response?.status === 403) {
      console.log("🔑 Problème d'authentification - vérifier la clé API");
    }
  }
}

testAPI();