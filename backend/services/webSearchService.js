import axios from "axios";

/**
 * 🔍 Service de recherche web pour les résultats de matchs
 * Version simplifiée - utilise des APIs gratuites ou web scraping basique
 */
export class WebSearchService {
  constructor() {
    console.log("✅ WebSearchService initialized (simplified version - no AI)");
    this.client = null; // Pas de client IA
  }

  /**
   * 🔍 Recherche les résultats d'un match via IA/web
   * @param {string} equipe1 - Première équipe
   * @param {string} equipe2 - Deuxième équipe
   * @param {string} date - Date du match (YYYY-MM-DD)
   * @returns {Object|null} Résultat du match ou null si non trouvé
   */
  async searchMatchResult(equipe1, equipe2, date) {
    try {
      console.log(`🔍 Recherche web pour: ${equipe1} vs ${equipe2} (${date})`);

      // Version simplifiée : retourner null (pas de recherche web)
      // Le système fonctionne maintenant uniquement avec l'API Football
      console.log(`ℹ️ Recherche web désactivée - utilisation API Football uniquement`);
      return null;

    } catch (error) {
      console.error("❌ Erreur recherche web:", error.message);
      return null;
    }
  }


  /**
   * 📝 Construit le prompt pour l'IA
   */
  buildSearchPrompt(equipe1, equipe2, date) {
    const dateObj = new Date(date);
    const dateFormatted = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `Trouve le résultat exact du match de football entre "${equipe1}" et "${equipe2}" joué le ${dateFormatted}.

RÈGLES IMPORTANTES:
- Si le match n'a pas eu lieu, réponds exactement: "MATCH_NOT_PLAYED"
- Si tu trouves le score, réponds au format: "SCORE: X-Y" (où X est le score de ${equipe1} et Y le score de ${equipe2})
- Si tu ne trouves rien, réponds: "NOT_FOUND"
- Ne donne AUCUNE explication, juste la réponse demandée

Exemples:
SCORE: 2-1
SCORE: 0-0
MATCH_NOT_PLAYED
NOT_FOUND`;
  }

  /**
   * 🔍 Parse le résultat de l'IA
   */
  parseMatchResult(text, equipe1, equipe2) {
    const cleanText = text.trim().toUpperCase();

    // Match pas joué
    if (cleanText.includes("MATCH_NOT_PLAYED") || cleanText.includes("PAS ENCORE JOUÉ")) {
      return { status: "not_played" };
    }

    // Pas trouvé
    if (cleanText.includes("NOT_FOUND") || cleanText.includes("NON TROUVÉ")) {
      return null;
    }

    // Chercher le pattern SCORE: X-Y
    const scoreMatch = cleanText.match(/SCORE:\s*(\d+)-(\d+)/);
    if (scoreMatch) {
      const homeScore = parseInt(scoreMatch[1]);
      const awayScore = parseInt(scoreMatch[2]);

      return {
        homeScore,
        awayScore,
        status: "FT", // Terminé
        source: "web_search_ai"
      };
    }

    // Chercher d'autres patterns de score
    const altScoreMatch = cleanText.match(/(\d+)\s*-\s*(\d+)/);
    if (altScoreMatch) {
      const score1 = parseInt(altScoreMatch[1]);
      const score2 = parseInt(altScoreMatch[2]);

      // Déterminer qui est à domicile (simple heuristique)
      const isEquipe1Home = this.isTeamHome(equipe1, equipe2);

      return {
        homeScore: isEquipe1Home ? score1 : score2,
        awayScore: isEquipe1Home ? score2 : score1,
        status: "FT",
        source: "web_search_ai"
      };
    }

    return null;
  }

  /**
   * 🏠 Détermine quelle équipe est à domicile (heuristique simple)
   */
  isTeamHome(team1, team2) {
    // Les équipes à domicile sont souvent listées en premier
    // Ou on peut utiliser des règles simples
    return true; // Par défaut, considérer team1 à domicile
  }

  /**
   * 🔄 Recherche multiple avec retry
   */
  async searchWithRetry(equipe1, equipe2, date, maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 Tentative ${attempt}/${maxRetries} pour ${equipe1} vs ${equipe2}`);

      const result = await this.searchMatchResult(equipe1, equipe2, date);

      if (result && result.status !== "not_played") {
        return result;
      }

      // Attendre avant retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return null;
  }

  /**
   * 📊 Recherche en batch pour plusieurs matchs
   */
  async searchMultipleMatches(matches, date) {
    const results = [];

    for (const match of matches) {
      const result = await this.searchWithRetry(match.equipe1, match.equipe2, date);
      if (result) {
        results.push({
          ...match,
          ...result
        });
      }

      // Délai entre les recherches pour éviter la surcharge
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}

// Instance singleton
export const webSearchService = new WebSearchService();