import axios from "axios";

const API_KEY = process.env.SOCCER_DATA_API_KEY || "";
const API_HOST = "soccer-data6.p.rapidapi.com";

/**
 * 🚀 Service Soccer Data API (RapidAPI) - API alternative avancée
 * CORRIGÉ: Support de toutes les compétitions + meilleure gestion d'erreurs
 */
export class SoccerDataService {
  constructor() {
    this.client = axios.create({
      baseURL: `https://${API_HOST}`,
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST,
      },
      timeout: 15000, // Timeout plus long pour cette API
    });
    
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 seconde minimum entre requêtes
  }

  /**
   * 🔍 Récupère les matchs d'une date donnée
   * CORRIGÉ: Recherche dans TOUTES les compétitions, pas une seule
   * @param {string} date - Date au format YYYY-MM-DD
   * @returns {Array} Liste des matchs
   */
  async getFixtures(date) {
    try {
      console.log(`🔍 Soccer Data API: Recherche matchs du ${date}`);

      if (!API_KEY) {
        console.warn("⚠️ Clé SOCCER_DATA_API_KEY manquante - Soccer Data API désactivée");
        return [];
      }

      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
      }
      this.lastRequestTime = Date.now();

      // Format de date pour l'API: [YYYY-MM-DDTHH:mm:ssZ TO YYYY-MM-DDTHH:mm:ssZ]
      const startDate = `${date}T00:00:00Z`;
      const endDate = `${date}T23:59:59Z`;

      // CORRECTION: Rechercher dans TOUTES les compétitions
      // Ne pas utiliser un ID de compétition fixe comme "/match/1t97ffnd5cp761lay7ucgk9qak"
      const response = await this.client.get("/match", {
        params: {
          status: "played,playing", // Terminé + en cours
          "mt.mDt": `[${startDate} TO ${endDate}]`, // Filtre par date
          _pgSz: 500, // Augmenter la taille de page pour plus de résultats
        }
      });

      const matches = response.data.match || [];
      console.log(`✅ Soccer Data API: ${matches.length} matchs trouvés (toutes compétitions)`);

      return matches;
    } catch (error) {
      if (error.response?.status === 429) {
        console.error("⏰ Soccer Data API: Rate limit atteint - attendre avant nouvelle requête");
      } else if (error.response?.status === 403) {
        console.error("🔒 Soccer Data API: Accès refusé - vérifier la clé API");
      } else {
        console.error("❌ Erreur Soccer Data API (fixtures):", error.message);
      }
      return [];
    }
  }

  /**
   * 📊 Récupère les détails d'un match (scores, stats)
   * @param {string} fixtureId - ID du match
   * @returns {Object|null} Détails du match
   */
  async getMatchDetails(fixtureId) {
    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
      }
      this.lastRequestTime = Date.now();

      const response = await this.client.get("/matchexpectedgoals", {
        params: { fx: fixtureId }
      });

      return response.data;
    } catch (error) {
      console.error(`❌ Erreur détails match ${fixtureId}:`, error.message);
      return null;
    }
  }

  /**
   * 🔍 Recherche un match spécifique par équipes
   * AMÉLIORÉ: Meilleure similarité et gestion d'erreurs
   * @param {string} equipe1 - Première équipe
   * @param {string} equipe2 - Deuxième équipe
   * @param {string} date - Date du match
   * @returns {Object|null} Match trouvé ou null
   */
  async findMatch(equipe1, equipe2, date) {
    try {
      const matches = await this.getFixtures(date);

      if (matches.length === 0) {
        console.log("⚠️ Soccer Data API: Aucun match trouvé pour cette date");
        return null;
      }

      // Fonction de similarité améliorée
      const similarity = (str1, str2) => {
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();

        // Match exact
        if (s1 === s2) return 1;

        // Contient
        if (s1.includes(s2) || s2.includes(s1)) return 0.8;

        // Mots communs
        const words1 = s1.split(/\s+/).filter(w => w.length > 2);
        const words2 = s2.split(/\s+/).filter(w => w.length > 2);
        const commonWords = words1.filter(w => words2.includes(w)).length;

        if (commonWords > 0) {
          return commonWords / Math.max(words1.length, words2.length);
        }

        return 0;
      };

      // Chercher le match avec meilleur score de similarité
      let bestMatch = null;
      let bestScore = 0;

      for (const match of matches) {
        const homeTeam = match.teams?.home?.name || "";
        const awayTeam = match.teams?.away?.name || "";

        // Score pour différentes combinaisons
        const score1 = (similarity(homeTeam, equipe1) + similarity(awayTeam, equipe2)) / 2;
        const score2 = (similarity(homeTeam, equipe2) + similarity(awayTeam, equipe1)) / 2;
        const score = Math.max(score1, score2);

        if (score > bestScore && score > 0.4) { // Seuil de 40%
          bestScore = score;
          bestMatch = match;
        }
      }

      if (bestMatch) {
        console.log(`🎯 Soccer Data: Match trouvé: ${bestMatch.teams.home.name} vs ${bestMatch.teams.away.name} (similarité: ${(bestScore * 100).toFixed(0)}%)`);
        return this.formatMatchData(bestMatch);
      }

      console.log(`❌ Soccer Data: Aucun match correspondant à ${equipe1} vs ${equipe2}`);
      return null;
    } catch (error) {
      console.error("❌ Erreur recherche match Soccer Data:", error.message);
      return null;
    }
  }

  /**
   * 🔄 Formate les données du match pour compatibilité
   * AMÉLIORÉ: Meilleure détection des statuts
   * @param {Object} matchData - Données brutes du match
   * @returns {Object} Données formatées
   */
  formatMatchData(matchData) {
    const status = (matchData.status?.status || "NS").toLowerCase();

    // Déterminer si le match est terminé avec plus de statuts
    const finishedStatuses = ["played", "finished", "ft", "fulltime", "full-time"];
    const liveStatuses = ["playing", "live", "inprogress", "in_progress"];
    
    const isFinished = finishedStatuses.includes(status);
    const isLive = liveStatuses.includes(status);

    let shortStatus = "NS";
    if (isFinished) {
      shortStatus = "FT";
    } else if (isLive) {
      shortStatus = "LIVE";
    }

    console.log(`   Soccer Data status: "${status}" → "${shortStatus}"`);

    return {
      fixture: {
        id: matchData.id,
        status: {
          short: shortStatus,
          long: status
        }
      },
      teams: {
        home: {
          name: matchData.teams?.home?.name || ""
        },
        away: {
          name: matchData.teams?.away?.name || ""
        }
      },
      goals: {
        home: matchData.score?.home || 0,
        away: matchData.score?.away || 0
      },
      source: "soccer_data_api"
    };
  }

  /**
   * 📈 Récupère les stats xG d'un match
   * @param {string} fixtureId - ID du match
   * @returns {Object|null} Stats xG
   */
  async getMatchXG(fixtureId) {
    try {
      const details = await this.getMatchDetails(fixtureId);
      if (!details) return null;

      // Extraire les données xG
      const xgData = {
        home: details.expectedGoals?.home || 0,
        away: details.expectedGoals?.away || 0
      };

      console.log(`📊 xG: ${xgData.home} - ${xgData.away}`);
      return xgData;
    } catch (error) {
      console.error("❌ Erreur récupération xG:", error.message);
      return null;
    }
  }
}

// Instance singleton
export const soccerDataService = new SoccerDataService();
