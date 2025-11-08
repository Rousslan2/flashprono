// Quick test to verify the fixed logic
import { determinePronosticResult } from "./services/pronosticChecker.js";

console.log("🧪 Test des corrections apportées au système de pronostics");
console.log("=" .repeat(60));

// Test cases to verify the fixes
const testCases = [
  {
    name: "Double Chance 1X (Equipe1 or draw) - Équipe1 gagne",
    type: "Double chance : Manchester City or draw",
    equipe1: "Manchester City",
    equipe2: "Everton", 
    homeTeam: "Manchester City",
    awayTeam: "Everton",
    homeScore: 2,
    awayScore: 1,
    expected: "gagnant"
  },
  {
    name: "Double Chance X2 (draw or Equipe2) - Match nul",
    type: "Double chance : draw or Manchester United",
    equipe1: "Manchester United",
    equipe2: "Chelsea",
    homeTeam: "Chelsea", 
    awayTeam: "Manchester United",
    homeScore: 1,
    awayScore: 1,
    expected: "gagnant"
  },
  {
    name: "Double Chance 12 (Equipe1 or Equipe2) - Pas match nul",
    type: "Double chance : Arsenal or Liverpool",
    equipe1: "Arsenal",
    equipe2: "Liverpool",
    homeTeam: "Arsenal",
    awayTeam: "Liverpool", 
    homeScore: 2,
    awayScore: 1,
    expected: "gagnant"
  }
];

console.log("\n🔍 Test des cas de double chance corrigés:");

for (const testCase of testCases) {
  console.log(`\n📋 Test: ${testCase.name}`);
  console.log(`   Type: ${testCase.type}`);
  console.log(`   Match: ${testCase.homeTeam} ${testCase.homeScore}-${testCase.awayScore} ${testCase.awayTeam}`);
  
  const result = determinePronosticResult(
    {
      type: testCase.type,
      equipe1: testCase.equipe1,
      equipe2: testCase.equipe2
    },
    testCase.homeTeam,
    testCase.awayTeam,
    testCase.homeScore,
    testCase.awayScore
  );
  
  const status = result === testCase.expected ? "✅ CORRECT" : "❌ INCORRECT";
  console.log(`   Résultat: ${result} (attendu: ${testCase.expected}) ${status}`);
}

console.log("\n" + "=".repeat(60));
console.log("🎯 Tests des corrections terminés!");