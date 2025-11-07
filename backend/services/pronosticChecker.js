import axios from "axios";
import Pronostic from "../models/Pronostic.js";
import UserBet from "../models/UserBet.js";
import User from "../models/User.js";
import { io } from "../server.js";

const API_KEY = process.env.FOOTBALL_API_KEY || "";
const API_BASE_URL = "https://v3.football.api-sports.io";

// Enhanced cache for better match detection
let matchesCache = {
  data: [],
  timestamp: null,
  date: null,
  leagues: [] // Track which leagues we've cached
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes (reduced for better accuracy)
const API_RATE_LIMIT_DELAY = 1000; // 1 second between API calls

// Enhanced team name mappings for better matching
const TEAM_ALIASES = {
  'psg': ['psg', 'paris saint-germain', 'paris sg', 'paris saint germain'],
  'barcelona': ['barcelona', 'fc barcelona', 'barca', 'fc barça'],
  'real madrid': ['real madrid', 'real madrid cf', 'rm', 'madrid'],
  'manchester united': ['manchester united', 'man utd', 'mu', 'man united'],
  'manchester city': ['manchester city', 'man city', 'mc', 'city'],
  'chelsea': ['chelsea', 'cfc', 'chelsea fc'],
  'liverpool': ['liverpool', 'liverpool fc', 'liverpool f.c.'],
  'arsenal': ['arsenal', 'arsenal fc', 'arsenal f.c.', 'gunners'],
  'tottenham': ['tottenham', 'tottenham hotspur', 'spurs', 'tottenham fc'],
  'juventus': ['juventus', 'juve', 'juventus fc'],
  'ac milan': ['ac milan', 'milan', 'milan ac', 'a.c. milan'],
  'inter milan': ['inter milan', 'inter', 'inter milano'],
  'napoli': ['napoli', 'ssc napoli'],
  'atletico madrid': ['atletico madrid', 'atletico madridi', 'atleti', 'atletico'],
  'bayern munich': ['bayern munich', 'bayern', 'bayern münchen', 'bayern munchen'],
  'dortmund': ['dortmund', 'borussia dortmund', 'bvb'],
  'marseille': ['marseille', 'olympique marseille', 'olympique de marseille', 'om'],
  'lyon': ['lyon', 'olympique lyonnais', 'ol', 'lyonnais'],
  'monaco': ['monaco', 'as monaco', 'asso monaco'],
  'nice': ['nice', 'ogc nice', 'olympique gymnaste club nice'],
  'lille': ['lille', 'losc lille', 'lille osc'],
  'rennes': ['rennes', 'stade rennais', 'srfc'],
  'montpellier': ['montpellier', 'montpellier hérault sport', 'mhsc'],
  'toulouse': ['toulouse', 'toulouse fc', 'tfc']
};

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

    // 2. Récupérer les matchs d'aujourd'hui et d'hier (pour les matchs terminaés tard)
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const now = Date.now();

    let allMatches = [];

    // Check cache validity
    if (
      matchesCache.date === today &&
      matchesCache.timestamp &&
      (now - matchesCache.timestamp) < CACHE_DURATION
    ) {
      console.log("📋 Utilisation du cache (pas de requête API)");
      allMatches = matchesCache.data;
    } else {
      console.log("🌐 Requête API pour les matchs...");
      // Try today first, then yesterday if needed
      try {
        const { data: todayData } = await axios.get(`${API_BASE_URL}/fixtures`, {
          params: { date: today },
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": "v3.football.api-sports.io",
          },
        });

        allMatches = todayData.response || [];
        
        // If no matches today, try yesterday
        if (allMatches.length === 0) {
          console.log("📅 Aucun match aujourd'hui, vérification d'hier...");
          await new Promise(resolve => setTimeout(resolve, API_RATE_LIMIT_DELAY));
          
          const { data: yesterdayData } = await axios.get(`${API_BASE_URL}/fixtures`, {
            params: { date: yesterday },
            headers: {
              "x-rapidapi-key": API_KEY,
              "x-rapidapi-host": "v3.football.api-sports.io",
            },
          });
          
          allMatches = yesterdayData.response || [];
        }
        
        // Update cache
        matchesCache = {
          data: allMatches,
          timestamp: now,
          date: today
        };
        
      } catch (apiError) {
        console.error("❌ Erreur API:", apiError.message);
        return;
      }
    }

    console.log(`⚽ ${allMatches.length} matchs récupérés pour vérification`);

    let updatedCount = 0;
    let liveMatchCount = 0;

    // 3. Pour chaque pronostic, trouver le match correspondant et vérifier le résultat
    for (const prono of pendingPronostics) {
      try {
        const matchingMatch = findBestMatch(prono, allMatches);

        if (matchingMatch) {
          const homeScore = matchingMatch.goals.home;
          const awayScore = matchingMatch.goals.away;
          const homeTeam = matchingMatch.teams.home.name;
          const awayTeam = matchingMatch.teams.away.name;
          const status = matchingMatch.fixture.status.short; // NS, 1H, HT, 2H, FT, etc.
          const elapsed = matchingMatch.fixture.status.elapsed; // Minutes écoulées

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

              console.log(`🔄 SYNC UserBets: ${syncResult.modifiedCount} paris synchronisés pour prono ${prono._id}`);

              updatedCount++;

              console.log(
                `✅ Pronostic terminé: ${prono.equipe1} vs ${prono.equipe2} - ${result} (${homeScore}-${awayScore})`
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
              });
            }
          }
          // Match en cours (enhanced detection)
          else if (isMatchLive(status)) {
            const liveScore = `${homeScore}-${awayScore} (${elapsed}')`;
            liveMatchCount++;
            
            if (prono.statut !== "en cours" || prono.scoreLive !== liveScore) {
              prono.statut = "en cours";
              prono.resultat = "en cours";
              prono.scoreLive = liveScore;
              await prono.save();

              console.log(
                `🔴 Match en cours: ${prono.equipe1} vs ${prono.equipe2} - ${homeScore}-${awayScore} (${elapsed}')`
              );

              // Emit live score event
              io.emit("pronostic:live", {
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
          console.log(`⚠️ Aucun match trouvé pour: ${prono.equipe1} vs ${prono.equipe2} (${prono.type})`);
        }
      } catch (pronoError) {
        console.error(`❌ Erreur traitement prono ${prono._id}:`, pronoError.message);
      }
    }

    console.log(`🎯 Vérification terminée: ${updatedCount} terminé(s), ${liveMatchCount} en cours`);

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

    if (currentScore > bestScore && currentScore >= 0.6) { // Minimum 60% similarity
      bestScore = currentScore;
      bestMatch = match;
    }
  }

  return bestMatch;
}

/**
 * Calculate similarity between two team names with alias support
 */
function calculateTeamSimilarity(pronoTeam, matchTeam) {
  const pronoNormalized = normalizeTeamName(pronoTeam);
  const matchNormalized = normalizeTeamName(matchTeam);

  // Direct match
  if (pronoNormalized === matchNormalized) {
    return 1.0;
  }

  // Check aliases
  for (const [mainName, aliases] of Object.entries(TEAM_ALIASES)) {
    if (aliases.includes(pronoNormalized) && aliases.includes(matchNormalized)) {
      return 0.9;
    }
  }

  // Fuzzy matching with word overlap
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
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\b(fc|cf|ac|as|ogc|ssc|olympique|football club|sport)\b/g, '') // Remove common terms
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

/**
 * Check if match is finished (enhanced status detection)
 */
function isMatchFinished(status) {
  const finalStatuses = ['FT', 'AET', 'PEN', 'SUSP', 'INT', 'POSTP', 'CANC', 'ABD', 'AWD', 'WO'];
  return finalStatuses.includes(status);
}

/**
 * Check if match is live
 */
function isMatchLive(status) {
  const liveStatuses = ['NS', '1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'];
  return liveStatuses.includes(status);
}

/**
 * 🎲 Déterminer si un pronostic est gagnant, perdu ou remboursé (enhanced)
 */
function determinePronosticResult(prono, homeTeam, awayTeam, homeScore, awayScore) {
  const type = prono.type.toLowerCase().trim();
  const equipe1Lower = prono.equipe1.toLowerCase().trim();
  const equipe2Lower = prono.equipe2.toLowerCase().trim();
  const homeTeamLower = homeTeam.toLowerCase().trim();
  const awayTeamLower = awayTeam.toLowerCase().trim();

  // Determine which team is home/away
  const isEquipe1Home = calculateTeamSimilarity(equipe1Lower, homeTeamLower) > 
                       calculateTeamSimilarity(equipe1Lower, awayTeamLower);

  console.log(`🔍 Analyse: "${prono.type}" pour ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`);

  try {
    // === Double chance - Enhanced ===
    if (type.includes(" or ") || type.includes("double chance") || type.includes("1x") || type.includes("x2") || type.includes("12")) {
      return handleDoubleChance(type, equipe1Lower, equipe2Lower, isEquipe1Home, homeScore, awayScore);
    }

    // === Nul / Draw / Match nul ===
    if ((type.includes("nul") || type.includes("draw") || type === "x") && !type.includes(" or ")) {
      return homeScore === awayScore ? "gagnant" : "perdu";
    }

    // === Victoire spécifique d'une équipe ===
    if (type.includes("victoire") || type.includes("win") || type.includes("vainqueur")) {
      return handleTeamVictory(type, equipe1Lower, equipe2Lower, isEquipe1Home, homeScore, awayScore);
    }

    // === Simple 1, X, 2 ===
    if (type === "1" || (type.includes("1") && !type.includes("12") && !type.includes("1x"))) {
      return homeScore > awayScore ? "gagnant" : "perdu";
    }

    if (type === "2" || (type.includes("2") && !type.includes("12") && !type.includes("x2"))) {
      return awayScore > homeScore ? "gagnant" : "perdu";
    }

    // === BTTS (Both Teams To Score) ===
    if (type.includes("btts") || type.includes("les deux équipes marquent") || type.includes("both teams to score") || type.includes("marquent tous les deux")) {
      const bothScored = homeScore > 0 && awayScore > 0;
      if (type.includes("oui") || type.includes("yes") || type.includes("marquent")) {
        return bothScored ? "gagnant" : "perdu";
      }
      if (type.includes("non") || type.includes("no") || type.includes("marquent pas")) {
        return !bothScored ? "gagnant" : "perdu";
      }
      // Default BTTS = Yes
      return bothScored ? "gagnant" : "perdu";
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

    // === Mi-temps ===
    if (type.includes("mi-temps") || type.includes("half time") || type.includes("ht")) {
      // This would require HT scores from API, for now return null
      console.log("⚠️ Mi-temps prediction detected but HT scores not available");
      return null;
    }

    // === Handicap asiatique ===
    if (type.includes("handicap") || type.includes("asian handicap")) {
      const handicapMatch = type.match(/[-+](\d+\.?\d*)/);
      if (handicapMatch) {
        const handicap = parseFloat(handicapMatch[1]);
        const adjustedHomeScore = homeScore + handicap;
        
        if (type.includes(equipe1Lower.split(" ")[0])) {
          return adjustedHomeScore > awayScore ? "gagnant" : "perdu";
        } else {
          return awayScore > adjustedHomeScore ? "gagnant" : "perdu";
        }
      }
    }

    // Par défaut, si on ne peut pas déterminer
    console.warn(`⚠️ Type de pari non reconnu: "${prono.type}" pour ${prono.equipe1} vs ${prono.equipe2}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Erreur détermination résultat:`, error.message);
    return null;
  }
}

/**
 * Handle double chance bets
 */
function handleDoubleChance(type, equipe1Lower, equipe2Lower, isEquipe1Home, homeScore, awayScore) {
  const premierMotEquipe1 = equipe1Lower.split(" ")[0];
  const dernierMotEquipe1 = equipe1Lower.split(" ").pop();
  const premierMotEquipe2 = equipe2Lower.split(" ")[0];
  const dernierMotEquipe2 = equipe2Lower.split(" ").pop();

  // Format: "Equipe1 or draw" (1X)
  if (type.includes("1x") || (type.includes(premierMotEquipe1) && (type.includes("draw") || type.includes("nul")))) {
    if (isEquipe1Home) {
      return homeScore >= awayScore ? "gagnant" : "perdu";
    } else {
      return awayScore >= homeScore ? "gagnant" : "perdu";
    }
  }

  // Format: "Equipe2 or draw" (X2)
  if (type.includes("x2") || (type.includes(premierMotEquipe2) && (type.includes("draw") || type.includes("nul")))) {
    if (isEquipe1Home) {
      return homeScore <= awayScore ? "gagnant" : "perdu";
    } else {
      return awayScore <= homeScore ? "gagnant" : "perdu";
    }
  }

  // Format: "Equipe1 or Equipe2" (12)
  if (type.includes("12") || (type.includes(premierMotEquipe1) && type.includes(premierMotEquipe2))) {
    return homeScore !== awayScore ? "gagnant" : "perdu";
  }

  return null;
}

/**
 * Handle team victory bets
 */
function handleTeamVictory(type, equipe1Lower, equipe2Lower, isEquipe1Home, homeScore, awayScore) {
  const premierMotEquipe1 = equipe1Lower.split(" ")[0];
  const dernierMotEquipe1 = equipe1Lower.split(" ").pop();
  const premierMotEquipe2 = equipe2Lower.split(" ")[0];
  const dernierMotEquipe2 = equipe2Lower.split(" ").pop();
  
  // Check if type mentions team 1
  if (type.includes(premierMotEquipe1) || type.includes(dernierMotEquipe1)) {
    if (isEquipe1Home) {
      return homeScore > awayScore ? "gagnant" : "perdu";
    } else {
      return awayScore > homeScore ? "gagnant" : "perdu";
    }
  }
  
  // Check if type mentions team 2
  if (type.includes(premierMotEquipe2) || type.includes(dernierMotEquipe2)) {
    if (isEquipe1Home) {
      return awayScore > homeScore ? "gagnant" : "perdu";
    } else {
      return homeScore > awayScore ? "gagnant" : "perdu";
    }
  }

  return null;
}

/**
 * 📊 Calculer les statistiques globales d'un utilisateur
 */
export async function calculateUserStats(userId) {
  try {
    const allPronostics = await Pronostic.find({
      userId: userId // Si vous avez un champ userId dans le modèle Pronostic
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

    // Short cache for live matches
    const now = Date.now();
    if ((now - matchesCache.timestamp) < 5 * 60 * 1000) { // 5 minutes cache
      return; // Skip if cache is fresh
    }

    // Quick API call for live matches
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

      // Process just the live matches
      for (const prono of livePronostics) {
        const matchingMatch = findBestMatch(prono, matchesCache.data);
        if (matchingMatch) {
          const status = matchingMatch.fixture.status.short;
          
          if (isMatchFinished(status)) {
            // Update to finished
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
