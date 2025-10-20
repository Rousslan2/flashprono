import axios from "axios";
import Pronostic from "../models/Pronostic.js";
import User from "../models/User.js";
import { io } from "../server.js";

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
 * 🎯 Vérifier et mettre à jour automatiquement les résultats des pronostics
 */
export async function checkAndUpdatePronosticResults() {
  try {
    console.log("🔄 Début de la vérification automatique des résultats...");

    if (!API_KEY) {
      console.error("❌ Clé API Football manquante");
      return;
    }

    // 1. Récupérer tous les pronostics en attente (Football uniquement)
    const pendingPronostics = await Pronostic.find({
      statut: "en attente",
      sport: "Football",
    });

    if (pendingPronostics.length === 0) {
      console.log("✅ Aucun pronostic en attente à vérifier");
      return;
    }

    console.log(`📊 ${pendingPronostics.length} pronostic(s) en attente à vérifier`);

    // 2. Récupérer seulement les matchs d'aujourd'hui (avec cache)
    const today = new Date().toISOString().split("T")[0];
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
      console.log("🌐 Requête API pour les matchs du jour...");
      // Une seule requête pour aujourd'hui
      const { data: todayData } = await axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date: today },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      });

      allMatches = todayData.response || [];
      
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
        // Match terminé uniquement
        if (match.fixture.status.short !== "FT") return false;

        const homeTeam = match.teams.home.name.toLowerCase();
        const awayTeam = match.teams.away.name.toLowerCase();
        const equipe1 = prono.equipe1.toLowerCase();
        const equipe2 = prono.equipe2.toLowerCase();

        // Vérifier si les équipes correspondent
        return (
          (homeTeam.includes(equipe1) || equipe1.includes(homeTeam)) &&
          (awayTeam.includes(equipe2) || equipe2.includes(awayTeam))
        ) || (
          (homeTeam.includes(equipe2) || equipe2.includes(homeTeam)) &&
          (awayTeam.includes(equipe1) || equipe1.includes(awayTeam))
        );
      });

      if (matchingMatch) {
        const homeScore = matchingMatch.goals.home;
        const awayScore = matchingMatch.goals.away;
        const homeTeam = matchingMatch.teams.home.name;
        const awayTeam = matchingMatch.teams.away.name;

        // Déterminer le résultat du pronostic
        const result = determinePronosticResult(
          prono,
          homeTeam,
          awayTeam,
          homeScore,
          awayScore
        );

        if (result) {
          // Mettre à jour le pronostic
          prono.statut = result;
          prono.resultat = `${homeScore}-${awayScore}`;
          await prono.save();

          updatedCount++;

          console.log(
            `✅ Pronostic mis à jour: ${prono.equipe1} vs ${prono.equipe2} - ${result} (${homeScore}-${awayScore})`
          );

          // Émettre un événement Socket.io pour notifier en temps réel
          io.emit("pronostic:updated", {
            pronosticId: prono._id,
            statut: result,
            resultat: `${homeScore}-${awayScore}`,
            equipe1: prono.equipe1,
            equipe2: prono.equipe2,
            type: prono.type,
            cote: prono.cote,
          });
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
function determinePronosticResult(prono, homeTeam, awayTeam, homeScore, awayScore) {
  const type = prono.type.toLowerCase().trim();
  const equipe1Lower = prono.equipe1.toLowerCase().trim();
  const equipe2Lower = prono.equipe2.toLowerCase().trim();
  const homeTeamLower = homeTeam.toLowerCase().trim();
  const awayTeamLower = awayTeam.toLowerCase().trim();

  // Déterminer quelle équipe est à domicile/extérieur
  const isEquipe1Home = 
    homeTeamLower.includes(equipe1Lower) || equipe1Lower.includes(homeTeamLower);

  console.log(`🔍 Analyse: "${prono.type}" pour ${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`);

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
