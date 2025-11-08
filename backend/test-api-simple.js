import dotenv from "dotenv";
dotenv.config();

import { soccerDataService } from "./services/soccerDataService.js";

/**
 * 🧪 Test simple de l'API Soccer Data
 */
async function testSoccerDataAPI() {
  console.log("🧪 Test Soccer Data API - Recherche de matchs\n");
  
  // Test avec la date d'aujourd'hui
  const today = new Date().toISOString().split("T")[0];
  console.log(`📅 Date de recherche: ${today}\n`);
  
  try {
    // 1. Tester getFixtures()
    console.log("1️⃣ Test getFixtures (tous les matchs du jour):");
    console.log("─".repeat(60));
    
    const matches = await soccerDataService.getFixtures(today);
    
    console.log(`\n✅ Résultat: ${matches.length} matchs trouvés\n`);
    
    if (matches.length > 0) {
      console.log("📋 Premiers matchs trouvés:");
      matches.slice(0, 5).forEach((match, i) => {
        const home = match.teams?.home?.name || "N/A";
        const away = match.teams?.away?.name || "N/A";
        const score = match.score ? `${match.score.home}-${match.score.away}` : "N/A";
        const status = match.status?.status || "N/A";
        
        console.log(`   ${i+1}. ${home} vs ${away}`);
        console.log(`      Score: ${score} | Statut: ${status}`);
      });
      
      // 2. Tester findMatch() avec un des matchs trouvés
      if (matches.length > 0) {
        console.log(`\n2️⃣ Test findMatch (recherche d'un match spécifique):`);
        console.log("─".repeat(60));
        
        const testMatch = matches[0];
        const equipe1 = testMatch.teams?.home?.name;
        const equipe2 = testMatch.teams?.away?.name;
        
        console.log(`Recherche: "${equipe1}" vs "${equipe2}"`);
        
        const result = await soccerDataService.findMatch(equipe1, equipe2, today);
        
        if (result) {
          console.log(`\n✅ Match trouvé !`);
          console.log(`   Score: ${result.goals.home}-${result.goals.away}`);
          console.log(`   Statut: ${result.fixture.status.short} (${result.fixture.status.long})`);
        } else {
          console.log(`\n❌ Match non trouvé (bizarre...)`);
        }
      }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ Test terminé avec succès!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ Erreur lors du test:", error.message);
    console.error("Stack:", error.stack);
  }
}

// Exécuter le test
testSoccerDataAPI().catch(console.error);