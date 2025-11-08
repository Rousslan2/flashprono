import axios from "axios";
import Pronostic from "../models/Pronostic.js";
import UserBet from "../models/UserBet.js";
import User from "../models/User.js";
import { io } from "../server.js";
import { webSearchService } from "./webSearchService.js";
import { soccerDataService } from "./soccerDataService.js";

const API_KEY = process.env.FOOTBALL_API_KEY || process.env.API_KEY || "";
const API_BASE_URL = "https://v3.football.api-sports.io";

// Enhanced cache for better match detection
let matchesCache = {
  data: [],
  timestamp: null,
  date: null,
  leagues: []
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const API_RATE_LIMIT_DELAY = 1000; // 1 second between API calls

// Enhanced team name mappings for better matching
const TEAM_ALIASES = {
  'psg': ['psg', 'paris saint-germain', 'paris sg', 'paris saint germain', 'paris'],
  'barcelona': ['barcelona', 'fc barcelona', 'barca', 'fc barça', 'barcelone'],
  'real madrid': ['real madrid', 'real madrid cf', 'rm', 'madrid', 'real'],
  'manchester united': ['manchester united', 'man utd', 'mu', 'man united', 'man u'],
  'manchester city': ['manchester city', 'man city', 'mc', 'city', 'man city'],
  'chelsea': ['chelsea', 'cfc', 'chelsea fc', 'chelsea f.c.'],
  'liverpool': ['liverpool', 'liverpool fc', 'liverpool f.c.', 'liverpool football club'],
  'arsenal': ['arsenal', 'arsenal fc', 'arsenal f.c.', 'gunners'],
  'tottenham': ['tottenham', 'tottenham hotspur', 'spurs', 'tottenham fc'],
  'juventus': ['juventus', 'juve', 'juventus fc'],
  'ac milan': ['ac milan', 'milan', 'milan ac', 'a.c. milan', 'acm'],
  'inter milan': ['inter milan', 'inter', 'inter milano', 'inter de milan'],
  'napoli': ['napoli', 'ssc napoli'],
  'atletico madrid': ['atletico madrid', 'atletico madridi', 'atleti', 'atletico'],
  'bayern munich': ['bayern munich', 'bayern', 'bayern münchen', 'bayern munchen', 'bayern de munich'],
  'dortmund': ['dortmund', 'borussia dortmund', 'bvb'],
  'marseille': ['marseille', 'olympique marseille', 'olympique de marseille', 'om'],
  'lyon': ['lyon', 'olympique lyonnais', 'ol', 'lyonnais'],
  'monaco': ['monaco', 'as monaco', 'asso monaco'],
  'nice': ['nice', 'ogc nice', 'olympique gymnaste club nice'],
  'lille': ['lille', 'losc lille', 'lille osc', 'losc'],
  'rennes': ['rennes', 'stade rennais', 'srfc'],
  'montpellier': ['montpellier', 'montpellier hérault sport', 'mhsc'],
  'toulouse': ['toulouse', 'toulouse fc', 'tfc'],
  'bournemouth': ['bournemouth', 'afc bournemouth', 'afc b'],
  'crystal palace': ['crystal palace', 'cpfc', 'crystal p'],
  'west ham': ['west ham', 'west ham united', 'whu', 'west h'],
  'brighton': ['brighton', 'brighton and hove albion', 'bha', 'brighton & hove'],
  'wolves': ['wolves', 'wolverhampton', 'wolverhampton wanderers', 'wwfc'],
  'everton': ['everton', 'everton fc', 'efc'],
  'leicester': ['leicester', 'leicester city', 'lcfc'],
  'leeds': ['leeds', 'leeds united', 'lufc'],
  'southampton': ['southampton', 'southampton fc', 'saints', 'sotn'],
  'newcastle': ['newcastle', 'newcastle united', 'nufc', 'new'],
  'nottingham': ['nottingham', 'nottingham forest', 'forest'],
  'aston villa': ['aston villa', 'villa', 'avfc'],
  'fulham': ['fulham', 'ffc'],
  'burnley': ['burnley', 'burnley fc'],
  'brentford': ['brentford', 'brentford fc', 'b fc']
};

/**
 * 🎯 Vérifier et mettre à jour automatiquement les résultats des pronostics
 * ✅ CORRIGÉ : Cherche chaque match à SA date (pas seulement aujourd'hui)
 */
export async function checkAndUpdatePronosticResults() {
  try {
    console.log("🔄 Début de la vérification automatique des résultats...");

    if (!API_KEY) {
      console.error("❌ Clé API Football manquante");
      return;
    }

    // 1. Récupérer TOUS les pronostics en attente
    const allPronostics = await Pronostic.find({
      sport: "Football",
    });

    const pendingPronostics = allPronostics.filter(p =>
      p.statut === "en attente" ||
      p.statut === "en cours" ||
      !p.statut ||
      p.statut === ""
    );

    console.log(`📊 ${allPronostics.length} pronostic(s) au total, ${pendingPronostics.length} à vérifier/corriger`);

    if (pendingPronostics.length === 0) {
      console.log("✅ Aucun pronostic en attente à vérifier");
      return {
        checked: 0,
        updated: 0,
        live: 0,
      };
    }

    let updatedCount = 0;
    let liveMatchCount = 0;

    // 2. ✅ CORRECTION : Pour chaque pronostic, chercher à SA date
    for (const prono of pendingPronostics) {
      try {
        // ✅ Déterminer la date du match
        let matchDate;
        if (prono.date) {
          matchDate = new Date(prono.date).toISOString().split("T")[0];
        } else {
          matchDate = new Date(prono.createdAt).toISOString().split("T")[0];
        }

        console.log(`\n⚽ Vérification: ${prono.equipe1} vs ${prono.equipe2} (${prono.type})`);
        console.log(`   📅 Date du match: ${matchDate}`);

        let matchData = null;
        let source = null;

        // 🔄 TENTATIVE 1: Soccer Data API
        try {
          console.log(`   1️⃣ Soccer Data API...`);
          const soccerResult = await soccerDataService.findMatch(
            prono.equipe1,
            prono.equipe2,
            matchDate
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
            console.log(`   ✅ Soccer Data: ${soccerResult.goals.home}-${soccerResult.goals.away} (${soccerResult.fixture.status.short})`);
          } else {
            console.log(`   ❌ Soccer Data: Pas trouvé`);
          }
        } catch (error) {
          console.log(`   ❌ Soccer Data: Erreur - ${error.message}`);
        }

        // 🔄 TENTATIVE 2: Soccer Data API (lendemain)
        if (!matchData) {
          try {
            const nextDay = new Date(matchDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const nextDayStr = nextDay.toISOString().split("T")[0];
            
            console.log(`   2️⃣ Soccer Data (lendemain ${nextDayStr})...`);
            
            const soccerResultNext = await soccerDataService.findMatch(
              prono.equipe1,
              prono.equipe2,
              nextDayStr
            );

            if (soccerResultNext && soccerResultNext.goals.home !== null && soccerResultNext.goals.away !== null) {
              matchData = {
                homeScore: soccerResultNext.goals.home,
                awayScore: soccerResultNext.goals.away,
                homeTeam: soccerResultNext.teams.home.name,
                awayTeam: soccerResultNext.teams.away.name,
                status: soccerResultNext.fixture.status.short,
                source: "soccer_data_api_nextday"
              };
              source = "soccer_data_api_nextday";
              console.log(`   ✅ Soccer Data (lendemain): ${soccerResultNext.goals.home}-${soccerResultNext.goals.away}`);
            } else {
              console.log(`   ❌ Soccer Data (lendemain): Pas trouvé`);
            }
          } catch (error) {
            console.log(`   ❌ Soccer Data (lendemain): Erreur - ${error.message}`);
          }
        }

        // 🔄 TENTATIVE 3: API Football
        if (!matchData) {
          try {
            console.log(`   3️⃣ API Football...`);
            
            const { data } = await axios.get(`${API_BASE_URL}/fixtures`, {
              params: { date: matchDate },
              headers: {
                "x-rapidapi-key": API_KEY,
                "x-rapidapi-host": "v3.football.api-sports.io",
              },
            });

            const matchesForDate = data.response || [];
            console.log(`   📊 ${matchesForDate.length} matchs trouvés le ${matchDate}`);
            
            const matchingMatch = findBestMatch(prono, matchesForDate);
            
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
                console.log(`   ✅ API Football: ${homeScore}-${awayScore} (${status})`);
              } else {
                console.log(`   ⚠️ API Football: Match trouvé mais scores null`);
              }
            } else {
              console.log(`   ❌ API Football: Aucun match correspondant`);
            }
          } catch (apiError) {
            console.log(`   ❌ API Football: Erreur - ${apiError.message}`);
          }
        }

        // Aucune source n'a trouvé le match
        if (!matchData) {
          console.log(`   ❌ AUCUNE SOURCE: Match non trouvé`);
          continue;
        }

        const { homeScore, awayScore, homeTeam, awayTeam, status, elapsed } = matchData;

        // Match terminé
        if (isMatchFinished(status)) {
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
            prono.dateValidation = new Date();
            await prono.save();

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

            console.log(`   🔄 UserBets: ${syncResult.modifiedCount} paris synchronisés`);
            updatedCount++;

            console.log(`   ✅ Pronostic terminé (${source}): ${result} (${homeScore}-${awayScore})`);

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
          }
        }
        // Match en cours
        else if (isMatchLive(status) && source !== "soccer_data_api_nextday") {
          const liveScore = elapsed ? `${homeScore}-${awayScore} (${elapsed}')` : `${homeScore}-${awayScore}`;
          liveMatchCount++;

          if (prono.statut !== "en cours" || prono.scoreLive !== liveScore) {
            prono.statut = "en cours";
            prono.resultat = "en cours";
            prono.scoreLive = liveScore;
            await prono.save();

            console.log(`   🔴 Match en cours: ${homeScore}-${awayScore}${elapsed ? ` (${elapsed}')` : ''}`);

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
        console.error(`   ❌ Erreur prono ${prono._id}:`, pronoError.message);
      }
      
      // Pause pour ne pas surcharger les APIs
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎯 Vérification terminée: ${updatedCount} terminé(s), ${liveMatchCount} en cours`);

    return {
      checked: pendingPronostics.length,
      updated: updatedCount,
      live: liveMatchCount,
    };
  } catch (error) {
    console.error("❌ Erreur lors de la vérification automatique:", error.message);
    return null;
  }
}

/**
 * Enhanced team matching with aliases and fuzzy matching
 */
function findBestMatch(prono, matches) {
  const equipe1 = prono.equipe1.toLowerCase().trim();
  const equipe2 = prono.equipe2.toLowerCase().trim();

  let bestMatch = null;
  let bestScore = 0;

  for (const match of matches) {
    const homeTeam = match.teams.home.name.toLowerCase();
    const awayTeam = match.teams.away.name.toLowerCase();

    const homeScore = calculateTeamSimilarity(equipe1, homeTeam) + 
                     calculateTeamSimilarity(equipe2, awayTeam);
    const awayScore = calculateTeamSimilarity(equipe1, awayTeam) + 
                     calculateTeamSimilarity(equipe2, homeTeam);

    const currentScore = Math.max(homeScore, awayScore);

    if (currentScore > bestScore && currentScore >= 0.4) {
      bestScore = currentScore;
      bestMatch = match;
    }
  }

  return bestMatch;
}

/**
 * Calculate similarity between two team names with alias support
 */
export function calculateTeamSimilarity(pronoTeam, matchTeam) {
  const pronoNormalized = normalizeTeamName(pronoTeam);
  const matchNormalized = normalizeTeamName(matchTeam);

  if (pronoNormalized === matchNormalized) {
    return 1.0;
  }

  for (const [mainName, aliases] of Object.entries(TEAM_ALIASES)) {
    if (aliases.includes(pronoNormalized) && aliases.includes(matchNormalized)) {
      return 0.9;
    }
  }

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

/**
 * Normalize team names for better matching
 */
function normalizeTeamName(teamName) {
  return teamName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\b(fc|cf|ac|as|ogc|ssc|olympique|football club|sport|de|united|afc|ufc)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if match is finished (IMPROVED - more statuses)
 */
function isMatchFinished(status) {
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

/**
 * Check if match is live (IMPROVED)
 */
function isMatchLive(status) {
  const liveStatuses = [
    'NS', '1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE', 'INT',
    'playing', 'inprogress', 'in_progress', 'live'
  ];
  
  const statusLower = (status || '').toLowerCase();
  const statusUpper = (status || '').toUpperCase();
  
  return liveStatuses.includes(statusUpper) || 
         liveStatuses.includes(statusLower) ||
         liveStatuses.includes(status);
}

/**
 * 🎲 Déterminer si un pronostic est gagnant, perdu ou remboursé
 */
export function determinePronosticResult(prono, homeTeam, awayTeam, homeScore, awayScore) {
  const type = prono.type.toLowerCase().trim();
  const equipe1Lower = prono.equipe1.toLowerCase().trim();
  const equipe2Lower = prono.equipe2.toLowerCase().trim();
  const homeTeamLower = homeTeam.toLowerCase().trim();
  const awayTeamLower = awayTeam.toLowerCase().trim();

  const isEquipe1Home = calculateTeamSimilarity(equipe1Lower, homeTeamLower) >= 
                       calculateTeamSimilarity(equipe1Lower, awayTeamLower);

  console.log(`   🔍 Analyse: "${prono.type}" pour ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`);

  try {
    // Double chance
    if (type.includes(" or ") || type.includes("double chance") || 
        type.includes("1x") || type.includes("x2") || type.includes("12") ||
        (type.includes("draw") && (type.includes(" or ") || type.includes("double")))) {
      return handleDoubleChanceFixed(type, equipe1Lower, equipe2Lower, isEquipe1Home, homeScore, awayScore);
    }

    // Nul
    if ((type.includes("nul") || type.includes("draw") || type === "x") && !type.includes(" or ")) {
      return homeScore === awayScore ? "gagnant" : "perdu";
    }

    // Victoire
    if (type.includes("victoire") || type.includes("win") || type.includes("vainqueur")) {
      return handleTeamVictoryFixed(type, equipe1Lower, equipe2Lower, isEquipe1Home, homeScore, awayScore);
    }

    // 1, X, 2
    if (type === "1" || (type.includes("1") && !type.includes("12") && !type.includes("1x"))) {
      return homeScore > awayScore ? "gagnant" : "perdu";
    }

    if (type === "2" || (type.includes("2") && !type.includes("12") && !type.includes("x2"))) {
      return awayScore > homeScore ? "gagnant" : "perdu";
    }

    // BTTS
    if (type.includes("btts") || type.includes("les deux équipes marquent") || 
        type.includes("both teams to score") || type.includes("marquent tous les deux")) {
      const bothScored = homeScore > 0 && awayScore > 0;
      if (type.includes("oui") || type.includes("yes") || type.includes("marquent")) {
        return bothScored ? "gagnant" : "perdu";
      }
      if (type.includes("non") || type.includes("no") || type.includes("marquent pas")) {
        return !bothScored ? "gagnant" : "perdu";
      }
      return bothScored ? "gagnant" : "perdu";
    }

    // Over / Under
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

    // Score exact
    if (type.includes("score exact") || type.includes("exact score") || type.match(/\d+-\d+/)) {
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

    console.warn(`   ⚠️ Type de pari non reconnu: "${prono.type}"`);
    return null;
    
  } catch (error) {
    console.error(`   ❌ Erreur détermination résultat:`, error.message);
    return null;
  }
}

/**
 * Handle double chance bets - CORRECTED LOGIC
 */
export function handleDoubleChanceFixed(type, equipe1Lower, equipe2Lower, isEquipe1Home, homeScore, awayScore) {
  const premierMotEquipe1 = equipe1Lower.split(" ")[0];
  const dernierMotEquipe1 = equipe1Lower.split(" ").pop();
  const premierMotEquipe2 = equipe2Lower.split(" ")[0];
  const dernierMotEquipe2 = equipe2Lower.split(" ").pop();

  const mentionEquipe1 = type.includes(premierMotEquipe1) || type.includes(dernierMotEquipe1) || 
                         type.includes(equipe1Lower) || type.toLowerCase().includes(equipe1Lower);
  const mentionEquipe2 = type.includes(premierMotEquipe2) || type.includes(dernierMotEquipe2) || 
                         type.includes(equipe2Lower) || type.toLowerCase().includes(equipe2Lower);
  const mentionDraw = type.includes("draw") || type.includes("nul") || type.includes("x");

  // Equipe1 or draw (1X)
  if (mentionEquipe1 && mentionDraw && !mentionEquipe2) {
    if (isEquipe1Home) {
      return homeScore >= awayScore ? "gagnant" : "perdu";
    } else {
      return awayScore >= homeScore ? "gagnant" : "perdu";
    }
  }

  // Equipe2 or draw (X2)
  if (mentionEquipe2 && mentionDraw && !mentionEquipe1) {
    if (isEquipe1Home) {
      return homeScore <= awayScore ? "gagnant" : "perdu";
    } else {
      return awayScore <= homeScore ? "gagnant" : "perdu";
    }
  }

  // Equipe1 or Equipe2 (12)
  if (mentionEquipe1 && mentionEquipe2 && !mentionDraw) {
    return homeScore !== awayScore ? "gagnant" : "perdu";
  }

  // Format classique
  if (type.includes("1x") || type.includes("1 x")) {
    return (isEquipe1Home ? homeScore >= awayScore : awayScore >= homeScore) ? "gagnant" : "perdu";
  }
  
  if (type.includes("x2") || type.includes("x 2") || type.includes("2x") || type.includes("2 x")) {
    return (isEquipe1Home ? homeScore <= awayScore : awayScore <= homeScore) ? "gagnant" : "perdu";
  }
  
  if (type.includes("12") || type.includes("1 2") || type.includes("21") || type.includes("2 1")) {
    return homeScore !== awayScore ? "gagnant" : "perdu";
  }

  return null;
}

/**
 * Handle team victory bets
 */
function handleTeamVictoryFixed(type, equipe1Lower, equipe2Lower, isEquipe1Home, homeScore, awayScore) {
  const premierMotEquipe1 = equipe1Lower.split(" ")[0];
  const dernierMotEquipe1 = equipe1Lower.split(" ").pop();
  const premierMotEquipe2 = equipe2Lower.split(" ")[0];
  const dernierMotEquipe2 = equipe2Lower.split(" ").pop();
  
  if (type.includes(premierMotEquipe1) || type.includes(dernierMotEquipe1)) {
    return isEquipe1Home ? (homeScore > awayScore ? "gagnant" : "perdu") : (awayScore > homeScore ? "gagnant" : "perdu");
  }
  
  if (type.includes(premierMotEquipe2) || type.includes(dernierMotEquipe2)) {
    return isEquipe1Home ? (awayScore > homeScore ? "gagnant" : "perdu") : (homeScore > awayScore ? "gagnant" : "perdu");
  }

  return null;
}

/**
 * 📊 Calculer les statistiques globales d'un utilisateur
 */
export async function calculateUserStats(userId) {
  try {
    const allPronostics = await Pronostic.find({
      userId: userId
    });

    const stats = {
      total: allPronostics.length,
      enAttente: allPronostics.filter((p) => p.statut === "en attente").length,
      enCours: allPronostics.filter((p) => p.statut === "en cours").length,
      gagnants: allPronostics.filter((p) => p.statut === "gagnant").length,
      perdus: allPronostics.filter((p) => p.statut === "perdu").length,
      rembourses: allPronostics.filter((p) => p.statut === "remboursé").length,
    };

    stats.tauxReussite =
      stats.gagnants + stats.perdus > 0
        ? ((stats.gagnants / (stats.gagnants + stats.perdus)) * 100).toFixed(2)
        : 0;

    const totalMises = allPronostics.length * 10;
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

/**
 * 🚀 Vérification rapide pour les mises à jour en temps réel
 */
export async function quickCheckForLiveMatches() {
  try {
    const livePronostics = await Pronostic.find({
      statut: "en cours",
      sport: "Football",
    });

    if (livePronostics.length === 0) {
      return;
    }

    console.log(`🔴 Vérification rapide de ${livePronostics.length} match(s) en cours...`);

    const now = Date.now();
    if ((now - matchesCache.timestamp) < 5 * 60 * 1000) {
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    try {
      const { data } = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date: today },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      });

      matchesCache.data = data.response || [];
      matchesCache.timestamp = now;
      matchesCache.date = today;

      for (const prono of livePronostics) {
        const matchingMatch = findBestMatch(prono, matchesCache.data);
        if (matchingMatch) {
          const status = matchingMatch.fixture.status.short;
          
          if (isMatchFinished(status)) {
            const homeScore = matchingMatch.goals.home;
            const awayScore = matchingMatch.goals.away;
            
            const result = determinePronosticResult(
              prono,
              matchingMatch.teams.home.name,
              matchingMatch.teams.away.name,
              homeScore,
              awayScore
            );

            if (result) {
              prono.statut = result;
              prono.resultat = result;
              prono.scoreLive = `${homeScore}-${awayScore}`;
              prono.dateValidation = new Date();
              await prono.save();

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
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Erreur vérification rapide:", error.message);
    }
  } catch (error) {
    console.error("❌ Erreur vérification matches en cours:", error.message);
  }
}