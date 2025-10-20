import axios from "axios";
import Pronostic from "../models/Pronostic.js";
import User from "../models/User.js";
import { io } from "../server.js";

const API_KEY = process.env.FOOTBALL_API_KEY || "";
const API_BASE_URL = "https://v3.football.api-sports.io";

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

    // 2. Récupérer les matchs des 2 derniers jours (pour capturer les matchs terminés)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const dates = [
      twoDaysAgo.toISOString().split("T")[0],
      yesterday.toISOString().split("T")[0],
      today.toISOString().split("T")[0],
    ];

    // Récupérer les matchs de toutes ces dates
    const allMatchesPromises = dates.map((date) =>
      axios.get(`${API_BASE_URL}/fixtures`, {
        params: { date },
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
      })
    );

    const allMatchesResponses = await Promise.all(allMatchesPromises);
    const allMatches = allMatchesResponses.flatMap(
      (response) => response.data.response || []
    );

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
 * 🎲 Déterminer si un pronostic est gagné, perdu ou remboursé
 */
function determinePronosticResult(prono, homeTeam, awayTeam, homeScore, awayScore) {
  const type = prono.type.toLowerCase();
  const equipe1Lower = prono.equipe1.toLowerCase();
  const homeTeamLower = homeTeam.toLowerCase();

  // Déterminer quelle équipe est à domicile/extérieur
  const isEquipe1Home = 
    homeTeamLower.includes(equipe1Lower) || equipe1Lower.includes(homeTeamLower);

  // 1X2 (Victoire / Nul / Défaite)
  if (type.includes("victoire") || type.includes("1") || type.includes("win")) {
    if (homeScore > awayScore && isEquipe1Home) return "gagnant";
    if (awayScore > homeScore && !isEquipe1Home) return "gagnant";
    return "perdu";
  }

  if (type.includes("nul") || type.includes("x") || type.includes("draw")) {
    return homeScore === awayScore ? "gagnant" : "perdu";
  }

  // BTTS (Both Teams To Score)
  if (type.includes("btts") || type.includes("les deux équipes marquent")) {
    const bothScored = homeScore > 0 && awayScore > 0;
    if (type.includes("oui") || type.includes("yes")) {
      return bothScored ? "gagnant" : "perdu";
    }
    if (type.includes("non") || type.includes("no")) {
      return !bothScored ? "gagnant" : "perdu";
    }
  }

  // Over / Under
  if (type.includes("over") || type.includes("plus de")) {
    const totalGoals = homeScore + awayScore;
    const threshold = parseFloat(type.match(/\d+\.?\d*/)?.[0] || "2.5");
    return totalGoals > threshold ? "gagnant" : "perdu";
  }

  if (type.includes("under") || type.includes("moins de")) {
    const totalGoals = homeScore + awayScore;
    const threshold = parseFloat(type.match(/\d+\.?\d*/)?.[0] || "2.5");
    return totalGoals < threshold ? "gagnant" : "perdu";
  }

  // Score exact
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

  // Double chance
  if (type.includes("double chance")) {
    if (type.includes("1x")) {
      return (homeScore >= awayScore && isEquipe1Home) || 
             (awayScore >= homeScore && !isEquipe1Home) ? "gagnant" : "perdu";
    }
    if (type.includes("x2")) {
      return (homeScore <= awayScore && isEquipe1Home) || 
             (awayScore <= homeScore && !isEquipe1Home) ? "gagnant" : "perdu";
    }
    if (type.includes("12")) {
      return homeScore !== awayScore ? "gagnant" : "perdu";
    }
  }

  // Mi-temps / Fin de match
  // Note: Nécessiterait les scores de mi-temps de l'API
  
  // Par défaut, si on ne peut pas déterminer
  console.warn(`⚠️ Type de pari non reconnu: ${type}`);
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
