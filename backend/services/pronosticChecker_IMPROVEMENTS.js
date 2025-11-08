// ========================================
// CORRECTIONS POUR pronosticChecker.js
// ========================================

// 1. AMÉLIORATION: Fonction isMatchFinished avec PLUS de statuts
/**
 * Check if match is finished (IMPROVED - more statuses covered)
 */
function isMatchFinished(status) {
  // Liste complète des statuts finaux
  const finalStatuses = [
    'FT',      // Full Time
    'AET',     // After Extra Time
    'PEN',     // Penalties
    'SUSP',    // Suspended
    'INT',     // Interrupted
    'POSTP',   // Postponed
    'CANC',    // Cancelled
    'ABD',     // Abandoned
    'AWD',     // Awarded
    'WO',      // Walk Over
    'PST',     // Postponed (alternate)
    'CANC',    // Cancelled (alternate)
    'TBD',     // To Be Determined (consider as not finished actually)
    // Ajout de statuts de l'API Soccer Data
    'played',
    'finished',
    'fulltime',
    'full-time'
  ];
  
  const statusLower = (status || '').toLowerCase();
  const statusUpper = (status || '').toUpperCase();
  
  const isFinished = finalStatuses.includes(statusUpper) || 
                     finalStatuses.includes(statusLower) ||
                     finalStatuses.includes(status);
  
  if (isFinished) {
    console.log(`   ✅ Match TERMINÉ détecté: statut="${status}"`);
  }
  
  return isFinished;
}

// 2. AMÉLIORATION: Fonction isMatchLive avec plus de statuts
/**
 * Check if match is live (IMPROVED)
 */
function isMatchLive(status) {
  const liveStatuses = [
    'NS',     // Not Started
    '1H',     // First Half
    'HT',     // Half Time
    '2H',     // Second Half
    'ET',     // Extra Time
    'BT',     // Break Time
    'P',      // Penalty
    'LIVE',   // Live
    'INT',    // Interrupted (can be considered live)
    // Ajout de statuts de l'API Soccer Data
    'playing',
    'inprogress',
    'in_progress',
    'live'
  ];
  
  const statusLower = (status || '').toLowerCase();
  const statusUpper = (status || '').toUpperCase();
  
  return liveStatuses.includes(statusUpper) || 
         liveStatuses.includes(statusLower) ||
         liveStatuses.includes(status);
}

// 3. AMÉLIORATION: Logique de vérification avec PLUSIEURS tentatives
// À insérer dans la boucle de vérification des pronostics

async function checkPronosticWithFallbacks(prono, today, yesterday) {
  let matchData = null;
  let source = null;
  
  console.log(`\n⚽ Vérification: ${prono.equipe1} vs ${prono.equipe2} (${prono.type})`);
  
  // 🔄 TENTATIVE 1: Soccer Data API (toutes compétitions)
  try {
    console.log(`   1️⃣ Tentative Soccer Data API...`);
    const soccerResult = await soccerDataService.findMatch(
      prono.equipe1,
      prono.equipe2,
      today
    );

    if (soccerResult && soccerResult.goals.home !== null && soccerResult.goals.away !== null) {
      matchData = {
        homeScore: soccerResult.goals.home,
        awayScore: soccerResult.goals.away,
        homeTeam: soccerResult.teams.home.name,
        awayTeam: soccerResult.teams.away.name,
        status: soccerResult.fixture.status.short,
        source: "soccer_data_api"
      };
      source = "soccer_data_api";
      console.log(`   ✅ Soccer Data: Match trouvé ${soccerResult.goals.home}-${soccerResult.goals.away} (statut: ${soccerResult.fixture.status.short})`);
    } else {
      console.log(`   ❌ Soccer Data: Aucun résultat trouvé`);
    }
  } catch (error) {
    console.log(`   ❌ Soccer Data: Erreur - ${error.message}`);
  }
  
  // 🔄 TENTATIVE 2: API Football principale (si Soccer Data a échoué)
  if (!matchData) {
    try {
      console.log(`   2️⃣ Tentative API Football...`);
      const matchingMatch = findBestMatch(prono, allMatches); // allMatches depuis le cache
      
      if (matchingMatch) {
        const status = matchingMatch.fixture.status.short;
        const homeScore = matchingMatch.goals.home;
        const awayScore = matchingMatch.goals.away;
        
        if (homeScore !== null && awayScore !== null) {
          matchData = {
            homeScore,
            awayScore,
            homeTeam: matchingMatch.teams.home.name,
            awayTeam: matchingMatch.teams.away.name,
            status,
            elapsed: matchingMatch.fixture.status.elapsed,
            source: "api_football"
          };
          source = "api_football";
          console.log(`   ✅ API Football: Match trouvé ${homeScore}-${awayScore} (statut: ${status})`);
        } else {
          console.log(`   ⚠️ API Football: Match trouvé mais scores null`);
        }
      } else {
        console.log(`   ❌ API Football: Aucun match correspondant`);
      }
    } catch (error) {
      console.log(`   ❌ API Football: Erreur - ${error.message}`);
    }
  }
  
  // 🔄 TENTATIVE 3: Vérifier aussi la veille (pour les matchs de fin de soirée)
  if (!matchData) {
    try {
      console.log(`   3️⃣ Tentative Soccer Data API (hier)...`);
      const soccerResultYesterday = await soccerDataService.findMatch(
        prono.equipe1,
        prono.equipe2,
        yesterday
      );

      if (soccerResultYesterday && soccerResultYesterday.goals.home !== null) {
        matchData = {
          homeScore: soccerResultYesterday.goals.home,
          awayScore: soccerResultYesterday.goals.away,
          homeTeam: soccerResultYesterday.teams.home.name,
          awayTeam: soccerResultYesterday.teams.away.name,
          status: soccerResultYesterday.fixture.status.short,
          source: "soccer_data_api_yesterday"
        };
        source = "soccer_data_api_yesterday";
        console.log(`   ✅ Soccer Data (hier): Match trouvé ${soccerResultYesterday.goals.home}-${soccerResultYesterday.goals.away}`);
      }
    } catch (error) {
      console.log(`   ❌ Soccer Data (hier): Erreur - ${error.message}`);
    }
  }
  
  // ⚠️ Aucune source n'a trouvé le match
  if (!matchData) {
    console.log(`   ❌ AUCUNE SOURCE n'a trouvé le match: ${prono.equipe1} vs ${prono.equipe2}`);
    console.log(`      Équipes recherchées: "${prono.equipe1}" et "${prono.equipe2}"`);
    console.log(`      Type de pari: ${prono.type}`);
    console.log(`      Date du prono: ${prono.date}`);
    return null;
  }
  
  return { matchData, source };
}

// 4. AMÉLIORATION: Meilleure détection dans la boucle principale
// Remplacer la partie existante par :
/*
for (const prono of pendingPronostics) {
  try {
    const result = await checkPronosticWithFallbacks(prono, today, yesterday);
    
    if (!result) {
      continue; // Passer au pronostic suivant si aucune donnée trouvée
    }
    
    const { matchData, source } = result;
    const { homeScore, awayScore, homeTeam, awayTeam, status, elapsed } = matchData;
    
    console.log(`   📊 Données du match:`);
    console.log(`      Score: ${homeScore}-${awayScore}`);
    console.log(`      Statut: ${status}`);
    console.log(`      Source: ${source}`);

    // Match terminé (enhanced status detection)
    if (isMatchFinished(status)) {
      const result = determinePronosticResult(
        prono,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore
      );

      if (result && prono.statut !== result) {
        // Update pronostic
        prono.statut = result;
        prono.resultat = result;
        prono.scoreLive = `${homeScore}-${awayScore}`;
        prono.dateValidation = new Date();
        await prono.save();

        // Update all UserBets
        const syncResult = await UserBet.updateMany(
          { pronoId: prono._id },
          {
            $set: {
              resultat: result,
              scoreLive: `${homeScore}-${awayScore}`,
              dateValidation: new Date()
            }
          }
        );

        console.log(`   🔄 SYNC UserBets: ${syncResult.modifiedCount} paris synchronisés pour prono ${prono._id}`);
        updatedCount++;

        console.log(
          `   ✅ Pronostic terminé (${source}): ${prono.equipe1} vs ${prono.equipe2} - ${result} (${homeScore}-${awayScore})`
        );

        // Emit socket event
        io.emit("prono:updated", {
          pronosticId: prono._id,
          statut: result,
          resultat: result,
          scoreLive: `${homeScore}-${awayScore}`,
          equipe1: prono.equipe1,
          equipe2: prono.equipe2,
          type: prono.type,
          cote: prono.cote,
          matchStatus: status,
          source: source
        });
      } else {
        console.log(`   ℹ️ Statut déjà correct: ${result}`);
      }
    }
    // Match en cours (enhanced detection)
    else if (isMatchLive(status) && source !== "soccer_data_api_yesterday") {
      const liveScore = elapsed ? `${homeScore}-${awayScore} (${elapsed}')` : `${homeScore}-${awayScore}`;
      liveMatchCount++;

      if (prono.statut !== "en cours" || prono.scoreLive !== liveScore) {
        prono.statut = "en cours";
        prono.resultat = "en cours";
        prono.scoreLive = liveScore;
        await prono.save();

        console.log(
          `   🔴 Match en cours: ${prono.equipe1} vs ${prono.equipe2} - ${homeScore}-${awayScore}${elapsed ? ` (${elapsed}')` : ''}`
        );

        // Emit live score event
        io.emit("pronostic:live", {
          pronosticId: prono._id,
          statut: "en cours",
          resultat: "en cours",
          scoreLive: liveScore,
          elapsed: elapsed || null,
          matchStatus: status,
          equipe1: prono.equipe1,
          equipe2: prono.equipe2,
          type: prono.type,
          cote: prono.cote,
        });
      }
    }
  } catch (pronoError) {
    console.error(`   ❌ Erreur traitement prono ${prono._id}:`, pronoError.message);
  }
  
  // Petite pause entre chaque pronostic pour éviter surcharge
  await new Promise(resolve => setTimeout(resolve, 500));
}
*/

console.log(`
📝 INSTRUCTIONS D'INTÉGRATION:
1. Remplacer les fonctions isMatchFinished() et isMatchLive() 
2. Intégrer la fonction checkPronosticWithFallbacks()
3. Remplacer la boucle principale de vérification des pronostics
4. S'assurer que soccerDataService est bien importé et configuré

⚠️ IMPORTANT: 
- Tester d'abord en environnement de dev
- Vérifier que SOCCER_DATA_API_KEY est dans le .env
- Surveiller les logs pour voir quelle source fonctionne le mieux
`);
