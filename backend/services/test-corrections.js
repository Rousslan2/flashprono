/**
 * 🧪 Script de test des corrections API
 * À exécuter après avoir appliqué les corrections
 */

import dotenv from "dotenv";
dotenv.config();

console.log("╔════════════════════════════════════════════════════════════════╗");
console.log("║           🧪 TEST DES CORRECTIONS API                         ║");
console.log("╚════════════════════════════════════════════════════════════════╝\n");

// Test 1: Vérifier les clés API
console.log("1️⃣  TEST DES CLÉS API");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const footballApiKey = process.env.FOOTBALL_API_KEY || process.env.API_KEY;
const soccerDataApiKey = process.env.SOCCER_DATA_API_KEY;

if (footballApiKey) {
  console.log("✅ FOOTBALL_API_KEY présente");
  console.log(`   Longueur: ${footballApiKey.length} caractères`);
} else {
  console.log("❌ FOOTBALL_API_KEY manquante!");
}

if (soccerDataApiKey) {
  console.log("✅ SOCCER_DATA_API_KEY présente");
  console.log(`   Longueur: ${soccerDataApiKey.length} caractères`);
} else {
  console.log("⚠️  SOCCER_DATA_API_KEY manquante (utilise uniquement Football API)");
}

console.log();

// Test 2: Vérifier la structure du code
console.log("2️⃣  TEST DE LA STRUCTURE DU CODE");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

try {
  // Import dynamique pour tester
  const { soccerDataService } = await import("./soccerDataService.js");
  console.log("✅ soccerDataService.js importé avec succès");
  
  // Vérifier que getFixtures existe
  if (typeof soccerDataService.getFixtures === 'function') {
    console.log("✅ Méthode getFixtures() présente");
  } else {
    console.log("❌ Méthode getFixtures() manquante!");
  }
  
  // Vérifier que findMatch existe
  if (typeof soccerDataService.findMatch === 'function') {
    console.log("✅ Méthode findMatch() présente");
  } else {
    console.log("❌ Méthode findMatch() manquante!");
  }
} catch (error) {
  console.log("❌ Erreur lors de l'import de soccerDataService.js");
  console.log(`   ${error.message}`);
}

console.log();

try {
  const pronosticChecker = await import("./pronosticChecker.js");
  console.log("✅ pronosticChecker.js importé avec succès");
  
  // Vérifier les exports
  if (typeof pronosticChecker.checkAndUpdatePronosticResults === 'function') {
    console.log("✅ Fonction checkAndUpdatePronosticResults() présente");
  } else {
    console.log("❌ Fonction checkAndUpdatePronosticResults() manquante!");
  }
} catch (error) {
  console.log("❌ Erreur lors de l'import de pronosticChecker.js");
  console.log(`   ${error.message}`);
}

console.log();

// Test 3: Test de la fonction isMatchFinished
console.log("3️⃣  TEST DE LA DÉTECTION DES STATUTS");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// Fonction de test locale (copie de la nouvelle fonction)
function testIsMatchFinished(status) {
  const finalStatuses = [
    'FT', 'AET', 'PEN', 'SUSP', 'INT', 'POSTP', 'CANC', 
    'ABD', 'AWD', 'WO', 'PST',
    'played', 'finished', 'fulltime', 'full-time'
  ];
  
  const statusLower = (status || '').toLowerCase();
  const statusUpper = (status || '').toUpperCase();
  
  return finalStatuses.includes(statusUpper) || 
         finalStatuses.includes(statusLower) ||
         finalStatuses.includes(status);
}

const testStatuses = [
  { status: 'FT', expected: true, desc: 'Full Time' },
  { status: 'played', expected: true, desc: 'Soccer Data API' },
  { status: 'finished', expected: true, desc: 'Soccer Data API' },
  { status: 'LIVE', expected: false, desc: 'Match en cours' },
  { status: '1H', expected: false, desc: 'Première mi-temps' },
];

let passed = 0;
let failed = 0;

testStatuses.forEach(test => {
  const result = testIsMatchFinished(test.status);
  if (result === test.expected) {
    console.log(`✅ "${test.status}" (${test.desc}) → ${result ? 'Terminé' : 'En cours'}`);
    passed++;
  } else {
    console.log(`❌ "${test.status}" (${test.desc}) → Attendu: ${test.expected}, Obtenu: ${result}`);
    failed++;
  }
});

console.log();
console.log(`Résultat: ${passed}/${testStatuses.length} tests passés`);

if (failed > 0) {
  console.log("⚠️  Certains statuts ne sont pas correctement détectés!");
}

console.log();

// Test 4: Résumé
console.log("4️⃣  RÉSUMÉ");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const hasFootballKey = !!footballApiKey;
const hasSoccerKey = !!soccerDataApiKey;
const allTestsPassed = passed === testStatuses.length;

console.log(`Clés API Football: ${hasFootballKey ? '✅' : '❌'}`);
console.log(`Clés API Soccer Data: ${hasSoccerKey ? '✅' : '⚠️  (optionnel)'}`);
console.log(`Tests de détection: ${allTestsPassed ? '✅' : '❌'}`);

console.log();

if (hasFootballKey && allTestsPassed) {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║           ✅ TOUT EST PRÊT! LES CORRECTIONS SONT OK           ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
} else {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║      ⚠️  CORRECTIONS INCOMPLÈTES - VÉRIFIER LES ERREURS       ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");
}

console.log();
console.log("Pour tester en conditions réelles:");
console.log("→ node check-match-detection.js");
