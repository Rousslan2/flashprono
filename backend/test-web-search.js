import dotenv from "dotenv";
dotenv.config();

import { webSearchService } from "./services/webSearchService.js";

console.log("🔧 Debug - GEMINI_API_KEY in test:", process.env.GEMINI_API_KEY ? "YES" : "NO");
console.log("🔧 Debug - Service model:", webSearchService.model ? "INITIALIZED" : "NULL");

/**
 * 🧪 Test du service de recherche web pour les résultats de matchs
 */
async function testWebSearch() {
  console.log("🧪 Test du service de recherche web...\n");
  console.log("🔑 Clé API Gemini:", process.env.GEMINI_API_KEY ? "CONFIGURÉE" : "MANQUANTE");
  console.log("🔗 Clé API:", process.env.GEMINI_API_KEY?.substring(0, 20) + "...");
  console.log("");

  // Test simple d'abord
  console.log("🧪 Test simple avec un match connu...\n");

  const testMatch = {
    equipe1: "PSG",
    equipe2: "Monaco",
    date: "2024-11-03"
  };

  try {
    const result = await webSearchService.searchWithRetry(
      testMatch.equipe1,
      testMatch.equipe2,
      testMatch.date
    );

    if (result) {
      console.log(`✅ SUCCÈS: ${result.homeScore}-${result.awayScore} (Status: ${result.status})`);
    } else {
      console.log(`❌ ÉCHEC: Aucun résultat trouvé`);
    }
  } catch (error) {
    console.error(`❌ ERREUR:`, error.message);
  }

  console.log("\n🏁 Test terminé");
  return;

  for (const match of testMatches) {
    console.log(`🔍 Test: ${match.equipe1} vs ${match.equipe2} (${match.date})`);

    try {
      const result = await webSearchService.searchWithRetry(
        match.equipe1,
        match.equipe2,
        match.date
      );

      if (result) {
        console.log(`✅ Résultat trouvé: ${result.homeScore}-${result.awayScore} (Status: ${result.status})`);
      } else {
        console.log(`❌ Aucun résultat trouvé`);
      }
    } catch (error) {
      console.error(`❌ Erreur test:`, error.message);
    }

    console.log(""); // Ligne vide
    // Délai entre les tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("🏁 Tests terminés");
}

// Exécuter les tests
testWebSearch().catch(console.error);