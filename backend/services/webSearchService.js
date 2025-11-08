import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
let genAI = null;

console.log("🔑 Loading GEMINI_API_KEY:", GEMINI_API_KEY ? "present" : "missing");

if (GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    console.log("✅ GoogleGenerativeAI initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing GoogleGenerativeAI:", error.message);
  }
} else {
  console.log("⚠️ No GEMINI_API_KEY provided");
}

/**
 * 🔍 Service de recherche web avec IA pour les résultats de matchs
 * Utilisé comme fallback quand l'API Football échoue
 */
export class WebSearchService {
  constructor() {
    try {
      // Try different model names
      const models = ["gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
      for (const modelName of models) {
        try {
          this.model = genAI.getGenerativeModel({ model: modelName });
          console.log(`✅ WebSearchService model initialized with ${modelName}`);
          break;
        } catch (modelError) {
          console.log(`⚠️ Model ${modelName} not available, trying next...`);
        }
      }
      if (!this.model) {
        console.error("❌ No suitable Gemini model found");
      }
    } catch (error) {
      console.error("❌ Error creating model:", error.message);
      this.model = null;
    }
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

      if (!GEMINI_API_KEY) {
        console.warn("⚠️ Clé API Gemini manquante pour la recherche web");
        return null;
      }

      if (!this.model) {
        console.warn("⚠️ Modèle Gemini non initialisé");
        return null;
      }

      // Construire la requête pour l'IA
      const prompt = this.buildSearchPrompt(equipe1, equipe2, date);

      // Appeler l'IA
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log(`🤖 Réponse IA: ${text.substring(0, 200)}...`);

      // Parser le résultat
      const matchData = this.parseMatchResult(text, equipe1, equipe2);

      if (matchData) {
        console.log(`✅ Résultat trouvé via IA: ${matchData.homeScore}-${matchData.awayScore}`);
        return matchData;
      } else {
        console.log(`❌ Aucun résultat clair trouvé via IA`);
        return null;
      }

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

    return `Tu es un assistant spécialisé dans la recherche de résultats de matchs de football.
Ta mission est de trouver le résultat exact du match entre "${equipe1}" et "${equipe2}" joué le ${dateFormatted} (date: ${date}).

INSTRUCTIONS IMPORTANTES:
1. Recherche sur le web les résultats de ce match
2. Si le match n'a pas encore eu lieu, réponds "MATCH_NOT_PLAYED"
3. Si tu trouves le résultat, donne-le au format exact: "SCORE: [score équipe1]-[score équipe2]"
4. Si c'est un match nul, donne "SCORE: 0-0" par exemple
5. Si tu ne trouves pas d'information claire, réponds "NOT_FOUND"
6. Ne donne que le résultat, pas d'explication supplémentaire
7. Vérifie que les équipes correspondent exactement

Exemples de réponses valides:
- SCORE: 2-1
- SCORE: 0-0
- SCORE: 3-2
- MATCH_NOT_PLAYED
- NOT_FOUND

Match à rechercher: ${equipe1} vs ${equipe2} le ${dateFormatted}`;
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