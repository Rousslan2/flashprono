import axios from "axios";
import Pronostic from "../models/Pronostic.js";
import UserBet from "../models/UserBet.js";
import User from "../models/User.js";
import { io } from "../server.js";
import { findMatchScore } from "./flashscoreScraper.js";

const API_KEY = process.env.FOOTBALL_API_KEY || "";
const API_BASE_URL = "https://v3.football.api-sports.io";

// Cache pour éviter les requêtes répétées
let matchesCache = {
  data: [],
  timestamp: null,
  date: null
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * 🔍 Vérifier TOUS les pronostics en attente, date par date
 * Utile pour rattraper les matchs des jours précédents
 */
export async function checkAllPendingPronostics() {
  try {
    console.log("🔍 Début de la vérification COMPLÈTE de tous les pronos en attente...");

    if (!API_KEY) {
      console.error("❌ Clé API Football manquante");
      return { success: false, message: "Clé API manquante" };
    }

    // 1. Récupérer TOUS les pronostics en attente ou en cours
    const pendingPronostics = await Pronostic.find({
      statut: { $in: ["en attente", "en cours"] },
      sport: "Football",
    }).sort({ date: 1 }); // Tri par date croissante

    if (pendingPronostics.length === 0) {
      console.log("✅ Aucun pronostic en attente");
      return { success: true, checked: 0, updated: 0, message: "Aucun prono en attente" };
    }

    console.log(`📊 ${pendingPronostics.length} pronostic(s) à vérifier`);

    // 2. Grouper les pronos par date
    const pronosByDate = {};
    for (const prono of pendingPronostics) {
      const dateStr = new Date(prono.date).toISOString().split("T")[0];
      if (!pronosByDate[dateStr]) {
        pronosByDate[dateStr] = [];
      }
      pronosByDate[dateStr].push(prono);
    }

    const dates = Object.keys(pronosByDate).sort();
    console.log(`📅 ${dates.length} date(s) à vérifier: ${dates.join(", ")}`);

    let totalUpdated = 0;

    // 3. Vérifier chaque date
    for (const dateStr of dates) {
      console.log(`\n📆 Vérification des matchs du ${dateStr}...`);
      
      try {
        let matchesForDate = [];
        
        // ESSAYER L'API FOOTBALL D'ABORD
        if (API_KEY) {
          try {
            console.log(`  🌐 Tentative API Football...`);
            const { data } = await axios.get(`${API_BASE_URL}/fixtures`, {
              params: { date: dateStr },
              headers: {
                "x-rapidapi-key": API_KEY,
                "x-rapidapi-host": "v3.football.api-sports.io",
              },
              timeout: 10000
            });
            matchesForDate = data.response || [];
            console.log(`  ✅ API Football: ${matchesForDate.length} match(s) trouvé(s)`);
          } catch (apiError) {
            console.log(`  ⚠️ API Football échouée: ${apiError.message}`);
            console.log(`  🕷️ Passage au scraper FlashScore...`);
          }
        }
        
        // SI API ÉCHOUE OU PAS DE CLÉ → SCRAPER
        if (matchesForDate.length === 0) {
          console.log(`  🕷️ Utilisation du scraper pour les ${pronosByDate[dateStr].length} pronos...`);
        }

        // 4. Vérifier chaque prono de cette date
        for (const prono of pronosByDate[dateStr]) {
          console.log(`\n  🔎 Recherche match pour: ${prono.equipe1} vs ${prono.equipe2}`);
          
          let matchingMatch = null;
          
          // CHERCHER DANS L'API SI ON A DES RÉSULTATS
          if (matchesForDate.length > 0) {
            matchingMatch = matchesForDate.find((match) => {
              const homeTeam = match.teams.home.name.toLowerCase().trim();
              const awayTeam = match.teams.away.name.toLowerCase().trim();
              const equipe1 = prono.equipe1.toLowerCase().trim();
              const equipe2 = prono.equipe2.toLowerCase().trim();
              
              // Fonction pour vérifier si 2 noms d'équipes correspondent (flexible)
              const teamsMatch = (team1, team2) => {
                if (team1 === team2) return true;
                if (team1.includes(team2) || team2.includes(team1)) return true;
                
                const words1 = team1.split(/\s+/).slice(0, 3);
                const words2 = team2.split(/\s+/).slice(0, 3);
                
                for (const w1 of words1) {
                  for (const w2 of words2) {
                    if (w1.length > 3 && w2.length > 3 && (w1.includes(w2) || w2.includes(w1))) {
                      return true;
                    }
                  }
                }
                return false;
              };

              const match1 = teamsMatch(homeTeam, equipe1) && teamsMatch(awayTeam, equipe2);
              const match2 = teamsMatch(homeTeam, equipe2) && teamsMatch(awayTeam, equipe1);
              
              if (match1 || match2) {
                console.log(`    ✅ Match trouvé (API): ${match.teams.home.name} vs ${match.teams.away.name}`);
                return true;
              }
              return false;
            });
          }
          
          // SI PAS TROUVÉ DANS L'API → ESSAYER LE SCRAPER
          if (!matchingMatch) {
            console.log(`    🕷️ Tentative scraper pour ce match...`);
            const scrapedMatch = await findMatchScore(prono.equipe1, prono.equipe2, dateStr);
            
            if (scrapedMatch) {
              // Convertir le format du scraper vers le format API
              matchingMatch = {
                teams: {
                  home: { name: scrapedMatch.homeTeam },
                  away: { name: scrapedMatch.awayTeam }
                },
                goals: {
                  home: scrapedMatch.homeScore,
                  away: scrapedMatch.awayScore
                },
                fixture: {
                  status: {
                    short: scrapedMatch.status,
                    elapsed: scrapedMatch.elapsed
                  }
                }
              };
              console.log(`    ✅ Match trouvé (Scraper): ${scrapedMatch.homeTeam} vs ${scrapedMatch.awayTeam}`);
            }
          }

          if (matchingMatch) {
            const homeScore = matchingMatch.goals.home;
            const awayScore = matchingMatch.goals.away;
            const homeTeam = matchingMatch.teams.home.name;
            const awayTeam = matchingMatch.teams.away.name;
            const status = matchingMatch.fixture.status.short;
            const elapsed = matchingMatch.fixture.status.elapsed;

            // Match terminé
            if (status === "FT") {
              const result = determinePronosticResult(
                prono,
                homeTeam,
                awayTeam,
                homeScore,
                awayScore
              );

              if (result && prono.statut !== result) {
                prono.statut = result;
                prono.resultat = result;
                prono.scoreLive = `${homeScore}-${awayScore}`;
                await prono.save();

                // Sync UserBets
                await UserBet.updateMany(
                  { pronoId: prono._id },
                  { $set: { resultat: result, scoreLive: `${homeScore}-${awayScore}` } }
                );

                totalUpdated++;
                console.log(`    ✅ ${prono.equipe1} vs ${prono.equipe2}: ${result} (${homeScore}-${awayScore})`);

                // Socket.io
                io.emit("prono:updated", {
                  pronosticId: prono._id,
                  statut: result,
                  resultat: result,
                  scoreLive: `${homeScore}-${awayScore}`,
                  equipe1: prono.equipe1,
                  equipe2: prono.equipe2,
                  type: prono.type,
                  cote: prono.cote,
                  matchStatus: "FT",
                });
              }
            }
            // Match en cours
            else if (["1H", "HT", "2H", "ET", "BT", "P"].includes(status)) {
              const liveScore = `${homeScore}-${awayScore} (${elapsed}')`;
              
              if (prono.statut !== "en cours" || prono.scoreLive !== liveScore) {
                prono.statut = "en cours";
                prono.resultat = "en cours";
                prono.scoreLive = liveScore;
                await prono.save();

                totalUpdated++;
                console.log(`    🔴 ${prono.equipe1} vs ${prono.equipe2}: LIVE ${liveScore}`);

                io.emit("prono:live", {
                  pronosticId: prono._id,
                  statut: "en cours",
                  resultat: "en cours",
                  scoreLive: liveScore,
                  elapsed: elapsed,
                  matchStatus: status,
                  equipe1: prono.equipe1,
                  equipe2: prono.equipe2,
                  type: prono.type,
                  cote: prono.cote,
                });
              }
            }
          } else {
            console.log(`    ⚠️ ${prono.equipe1} vs ${prono.equipe2}: Match non trouvé dans l'API`);
          }
        }

        // Attendre 500ms entre chaque date pour éviter rate limit
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`  ❌ Erreur pour la date ${dateStr}:`, error.message);
      }
    }

    console.log(`\n🎯 Vérification complète terminée: ${totalUpdated}/${pendingPronostics.length} prono(s) mis à jour`);

    return {
      success: true,
      checked: pendingPronostics.length,
      updated: totalUpdated,
      dates: dates.length,
      message: `${totalUpdated} prono(s) mis à jour sur ${dates.length} date(s)`
    };

  } catch (error) {
    console.error("❌ Erreur vérification complète:", error.message);
    return { success: false, message: error.message };
  }
}

/**
 * 🎯 Vérifier et mettre à jour automatiquement les résultats des pronostics
 */
export async function checkAndUpdatePronosticResults() {
  try {
    console.log("🔄 Début de la vérification automatique des résultats...");

    if (!API_KEY) {
      console.error("❌ Clé API Football manquante");
      return;
    }

    // 1. Récupérer tous les pronostics en attente OU en cours (Football uniquement)
    const pendingPronostics = await Pronostic.find({
      statut: { $in: ["en attente", "en cours"] },
      sport: "Football",
    });

    if (pendingPronostics.length === 0) {
      console.log("✅ Aucun pronostic en attente à vérifier");
      return;
    }

    console.log(`📊 ${pendingPronostics.length} pronostic(s) en attente à vérifier`);

    // 2. Récupérer les matchs d'AUJOURD'HUI ET D'HIER (avec cache)
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const now = Date.now();

    let allMatches = [];

    // Vérifier si le cache est encore valide
    if (
      matchesCache.date === today &&
      matchesCache.timestamp &&
      (now - matchesCache.timestamp) < CACHE_DURATION
    ) {
      console.log("📋 Utilisation du cache (pas de requête API)");
      allMatches = matchesCache.data;
    } else {
      console.log("🌐 Requête API pour les matchs d'aujourd'hui ET d'hier...");
      
      // Requête pour AUJOURD'HUI
      const { data: todayData } = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date: today },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      });

      // Requête pour HIER
      const { data: yesterdayData } = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date: yesterday },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      });

      allMatches = [...(todayData.response || []), ...(yesterdayData.response || [])];
      
      // Mettre à jour le cache
      matchesCache = {
        data: allMatches,
        timestamp: now,
        date: today
      };
    }

    console.log(`⚽ ${allMatches.length} matchs récupérés pour vérification`);

    let updatedCount = 0;

    // 3. Pour chaque pronostic, trouver le match correspondant et vérifier le résultat
    for (const prono of pendingPronostics) {
      const matchingMatch = allMatches.find((match) => {
        const homeTeam = match.teams.home.name.toLowerCase().trim();
        const awayTeam = match.teams.away.name.toLowerCase().trim();
        const equipe1 = prono.equipe1.toLowerCase().trim();
        const equipe2 = prono.equipe2.toLowerCase().trim();
        
        // Fonction pour vérifier si 2 noms d'équipes correspondent (flexible)
        const teamsMatch = (team1, team2) => {
          // Correspondance exacte
          if (team1 === team2) return true;
          
          // L'un contient l'autre
          if (team1.includes(team2) || team2.includes(team1)) return true;
          
          // Vérifier les mots clés principaux (premiers 3 mots)
          const words1 = team1.split(/\s+/).slice(0, 3);
          const words2 = team2.split(/\s+/).slice(0, 3);
          
          for (const w1 of words1) {
            for (const w2 of words2) {
              if (w1.length > 3 && w2.length > 3 && (w1.includes(w2) || w2.includes(w1))) {
                return true;
              }
            }
          }
          
          return false;
        };

        // Vérifier les 2 ordres possibles
        return (teamsMatch(homeTeam, equipe1) && teamsMatch(awayTeam, equipe2)) ||
               (teamsMatch(homeTeam, equipe2) && teamsMatch(awayTeam, equipe1));
      });

      if (matchingMatch) {
        const homeScore = matchingMatch.goals.home;
        const awayScore = matchingMatch.goals.away;
        const homeTeam = matchingMatch.teams.home.name;
        const awayTeam = matchingMatch.teams.away.name;
        const status = matchingMatch.fixture.status.short; // NS, 1H, HT, 2H, FT, etc.
        const elapsed = matchingMatch.fixture.status.elapsed; // Minutes écoulées

        // Match terminé (FT)
        if (status === "FT") {
          // Déterminer le résultat du pronostic
          const result = determinePronosticResult(
            prono,
            homeTeam,
            awayTeam,
            homeScore,
            awayScore
          );

          if (result && prono.statut !== result) {
            // Mettre à jour le pronostic
            prono.statut = result;
            prono.resultat = result; // ✅ "gagnant" ou "perdu"
            prono.scoreLive = `${homeScore}-${awayScore}`; // ✅ Score final
            await prono.save();

            // 🔥 SYNC: Mettre à jour tous les UserBets liés
            const syncResult = await UserBet.updateMany(
              { pronoId: prono._id },
              { $set: { resultat: result, scoreLive: `${homeScore}-${awayScore}` } }
            );

            console.log(`🔄 SYNC UserBets: ${syncResult.modifiedCount} paris utilisateur(s) synchronisés pour prono ${prono._id}`);

            updatedCount++;

            console.log(
              `✅ Pronostic terminé: ${prono.equipe1} vs ${prono.equipe2} - ${result} (${homeScore}-${awayScore}) - UserBets synchro!`
            );

            // Émettre un événement Socket.io pour notifier en temps réel
            io.emit("prono:updated", {
              pronosticId: prono._id,
              statut: result,
              resultat: result,
              scoreLive: `${homeScore}-${awayScore}`,
              equipe1: prono.equipe1,
              equipe2: prono.equipe2,
              type: prono.type,
              cote: prono.cote,
              matchStatus: "FT",
            });

            console.log(`📡 Socket.io event emitted: prono:updated for ${prono._id}`);
          }
        }
        // Match en cours (1H, HT, 2H, ET, P, etc.)
        else if (["1H", "HT", "2H", "ET", "BT", "P"].includes(status)) {
          // Mettre à jour le statut en "en cours" avec score live + minutes
          const liveScore = `${homeScore}-${awayScore} (${elapsed}')`;
          
          // TOUJOURS mettre à jour si c'est un match LIVE
          if (prono.statut !== "en cours" || prono.scoreLive !== liveScore) {
            prono.statut = "en cours";
            prono.resultat = "en cours"; // ✅ IMPORTANT: Mettre le resultat aussi!
            prono.scoreLive = liveScore; // ✅ Score live avec minutes
            await prono.save();

            console.log(
              `🔴 Match en cours: ${prono.equipe1} vs ${prono.equipe2} - ${homeScore}-${awayScore} (${elapsed}')`
            );

            // Émettre un événement Socket.io pour le score live
            io.emit("prono:live", {
              pronosticId: prono._id,
              statut: "en cours",
              resultat: "en cours",
              scoreLive: liveScore,
              elapsed: elapsed,
              matchStatus: status,
              equipe1: prono.equipe1,
              equipe2: prono.equipe2,
              type: prono.type,
              cote: prono.cote,
            });
          }
        }
      }
    }

    console.log(`🎯 Vérification terminée: ${updatedCount} pronostic(s) mis à jour`);

    return {
      checked: pendingPronostics.length,
      updated: updatedCount,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la vérification automatique:", error.message);
    return null;
  }
}

/**
 * 🎲 Déterminer si un pronostic est gagnant, perdu ou remboursé
 */
export function determinePronosticResult(prono, homeTeam, awayTeam, homeScore, awayScore) {
  let type = prono.type.toLowerCase().trim();
  
  // Nettoyer le type: enlever "double chance :" ou "double chance -"
  type = type.replace(/^double chance\s*[:\-]?\s*/i, '').trim();
  
  const equipe1Lower = prono.equipe1.toLowerCase().trim();
  const equipe2Lower = prono.equipe2.toLowerCase().trim();
  const homeTeamLower = homeTeam.toLowerCase().trim();
  const awayTeamLower = awayTeam.toLowerCase().trim();

  // Déterminer quelle équipe est à domicile/extérieur
  const isEquipe1Home = 
    homeTeamLower.includes(equipe1Lower) || equipe1Lower.includes(homeTeamLower);

  console.log(`🔍 Analyse: "${prono.type}" (nettoyé: "${type}") pour ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`);
  
  // === Si le type est juste un nom d'équipe = Victoire de cette équipe ===
  if (!type.includes(' ') && (type === equipe1Lower || type === equipe2Lower || 
      homeTeamLower.includes(type) || awayTeamLower.includes(type))) {
    console.log(`💡 Type détecté comme victoire d'équipe`);
    
    // Vérifier quelle équipe gagne
    if (type === equipe1Lower || homeTeamLower.includes(type)) {
      // Victoire de l'équipe 1
      if (isEquipe1Home) {
        return homeScore > awayScore ? "gagnant" : "perdu";
      } else {
        return awayScore > homeScore ? "gagnant" : "perdu";
      }
    } else {
      // Victoire de l'équipe 2
      if (isEquipe1Home) {
        return awayScore > homeScore ? "gagnant" : "perdu";
      } else {
        return homeScore > awayScore ? "gagnant" : "perdu";
      }
    }
  }

  // === Double chance - Format "X or draw" / "X or Y" ===
  if (type.includes(" or ") || type.includes("double chance")) {
    // Extraire les équipes mentionnées dans le type
    const mentionEquipe1 = type.includes(equipe1Lower.split(" ")[0]) || 
                           type.includes(equipe1Lower.split(" ")[1] || "");
    const mentionEquipe2 = type.includes(equipe2Lower.split(" ")[0]) || 
                           type.includes(equipe2Lower.split(" ")[1] || "");
    const mentionDraw = type.includes("draw") || type.includes("nul");

    // Format: "Equipe1 or draw" (1X)
    if (mentionEquipe1 && mentionDraw && !mentionEquipe2) {
      if (isEquipe1Home) {
        return homeScore >= awayScore ? "gagnant" : "perdu";
      } else {
        return awayScore >= homeScore ? "gagnant" : "perdu";
      }
    }

    // Format: "Equipe2 or draw" (X2)
    if (mentionEquipe2 && mentionDraw && !mentionEquipe1) {
      if (isEquipe1Home) {
        return homeScore <= awayScore ? "gagnant" : "perdu";
      } else {
        return awayScore <= homeScore ? "gagnant" : "perdu";
      }
    }

    // Format: "Equipe1 or Equipe2" (12)
    if (mentionEquipe1 && mentionEquipe2 && !mentionDraw) {
      return homeScore !== awayScore ? "gagnant" : "perdu";
    }

    // Format classique: 1X, X2, 12
    if (type.includes("1x")) {
      return homeScore >= awayScore ? "gagnant" : "perdu";
    }
    if (type.includes("x2") || type.includes("2x")) {
      return homeScore <= awayScore ? "gagnant" : "perdu";
    }
    if (type.includes("12") || type.includes("21")) {
      return homeScore !== awayScore ? "gagnant" : "perdu";
    }
  }

  // === Nul / Draw / Match nul ===
  if ((type.includes("nul") || type.includes("draw")) && !type.includes(" or ")) {
    return homeScore === awayScore ? "gagnant" : "perdu";
  }

  // === Victoire spécifique d'une équipe ===
  if (type.includes("victoire") || type.includes("win")) {
    const premierMotEquipe1 = equipe1Lower.split(" ")[0];
    const dernierMotEquipe1 = equipe1Lower.split(" ").pop();
    const premierMotEquipe2 = equipe2Lower.split(" ")[0];
    const dernierMotEquipe2 = equipe2Lower.split(" ").pop();
    
    // Vérifier si le type mentionne l'équipe 1
    if (type.includes(premierMotEquipe1) || type.includes(dernierMotEquipe1)) {
      if (isEquipe1Home) {
        return homeScore > awayScore ? "gagnant" : "perdu";
      } else {
        return awayScore > homeScore ? "gagnant" : "perdu";
      }
    }
    
    // Vérifier si le type mentionne l'équipe 2
    if (type.includes(premierMotEquipe2) || type.includes(dernierMotEquipe2)) {
      if (isEquipe1Home) {
        return awayScore > homeScore ? "gagnant" : "perdu";
      } else {
        return homeScore > awayScore ? "gagnant" : "perdu";
      }
    }
  }

  // === 1 (Victoire domicile) ===
  if (type === "1" || (type.includes("1") && !type.includes("12") && !type.includes("1x"))) {
    return homeScore > awayScore ? "gagnant" : "perdu";
  }

  // === 2 (Victoire extérieur) ===
  if (type === "2" || (type.includes("2") && !type.includes("12") && !type.includes("x2"))) {
    return awayScore > homeScore ? "gagnant" : "perdu";
  }

  // === BTTS (Both Teams To Score) ===
  if (type.includes("btts") || type.includes("les deux équipes marquent") || type.includes("both teams to score")) {
    const bothScored = homeScore > 0 && awayScore > 0;
    if (type.includes("oui") || type.includes("yes")) {
      return bothScored ? "gagnant" : "perdu";
    }
    if (type.includes("non") || type.includes("no")) {
      return !bothScored ? "gagnant" : "perdu";
    }
  }

  // === Over / Under ===
  if (type.includes("over") || type.includes("plus de") || type.includes("+")) {
    const threshold = parseFloat(type.match(/\d+\.?\d*/)?.[0] || "2.5");
    const totalGoals = homeScore + awayScore;
    return totalGoals > threshold ? "gagnant" : "perdu";
  }

  if (type.includes("under") || type.includes("moins de")) {
    const threshold = parseFloat(type.match(/\d+\.?\d*/)?.[0] || "2.5");
    const totalGoals = homeScore + awayScore;
    return totalGoals < threshold ? "gagnant" : "perdu";
  }

  // === Score exact ===
  if (type.includes("score exact") || type.includes("exact score")) {
    const expectedScore = type.match(/(\d+)-(\d+)/);
    if (expectedScore) {
      const [_, expectedHome, expectedAway] = expectedScore;
      if (isEquipe1Home) {
        return (
          homeScore === parseInt(expectedHome) && 
          awayScore === parseInt(expectedAway)
        ) ? "gagnant" : "perdu";
      } else {
        return (
          awayScore === parseInt(expectedHome) && 
          homeScore === parseInt(expectedAway)
        ) ? "gagnant" : "perdu";
      }
    }
  }

  // Par défaut, si on ne peut pas déterminer
  console.warn(`⚠️ Type de pari non reconnu: "${prono.type}" pour ${prono.equipe1} vs ${prono.equipe2}`);
  return null;
}

/**
 * 📊 Calculer les statistiques globales d'un utilisateur
 */
export async function calculateUserStats(userId) {
  try {
    const allPronostics = await Pronostic.find({
      // Si vous avez un champ userId dans le modèle Pronostic, utilisez-le
      // userId: userId
    });

    const stats = {
      total: allPronostics.length,
      enAttente: allPronostics.filter((p) => p.statut === "en attente").length,
      gagnants: allPronostics.filter((p) => p.statut === "gagnant").length,
      perdus: allPronostics.filter((p) => p.statut === "perdu").length,
      rembourses: allPronostics.filter((p) => p.statut === "remboursé").length,
    };

    stats.tauxReussite =
      stats.gagnants + stats.perdus > 0
        ? ((stats.gagnants / (stats.gagnants + stats.perdus)) * 100).toFixed(2)
        : 0;

    // Calculer le ROI (Return On Investment)
    const totalMises = allPronostics.length * 10; // Mise moyenne de 10€
    const totalGains = allPronostics
      .filter((p) => p.statut === "gagnant")
      .reduce((sum, p) => sum + p.cote * 10, 0);

    stats.roi =
      totalMises > 0
        ? (((totalGains - totalMises) / totalMises) * 100).toFixed(2)
        : 0;

    stats.profit = (totalGains - totalMises).toFixed(2);

    return stats;
  } catch (error) {
    console.error("❌ Erreur calcul stats:", error);
    return null;
  }
}
