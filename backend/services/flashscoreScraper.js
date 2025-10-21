import axios from "axios";
import * as cheerio from "cheerio";

/**
 * 🕷️ SCRAPER FLASHSCORE
 * Alternative gratuite à l'API Football
 */

/**
 * Rechercher un match sur FlashScore et récupérer le score
 * @param {string} team1 - Première équipe
 * @param {string} team2 - Deuxième équipe
 * @param {string} date - Date du match (YYYY-MM-DD)
 * @returns {Object|null} - { homeTeam, awayTeam, homeScore, awayScore, status, elapsed }
 */
export async function scrapeMatchScore(team1, team2, date) {
  try {
    console.log(`🕷️ FlashScore: Recherche ${team1} vs ${team2} (${date})`);

    // Nettoyer les noms d'équipes pour la recherche
    const cleanTeam1 = cleanTeamName(team1);
    const cleanTeam2 = cleanTeamName(team2);

    // URL de recherche FlashScore (alternative: livescore.com, sofascore.com)
    // On va utiliser une API publique alternative: fotmob.com
    const searchUrl = `https://www.fotmob.com/api/search?term=${encodeURIComponent(cleanTeam1)}`;
    
    console.log(`🔍 URL de recherche: ${searchUrl}`);

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      timeout: 10000
    });

    // Chercher le match dans les résultats
    const matches = response.data?.matches || [];
    
    for (const match of matches) {
      const home = match.home?.name || '';
      const away = match.away?.name || '';
      
      // Vérifier si c'est le bon match
      if (teamsMatch(home, cleanTeam1, cleanTeam2) && teamsMatch(away, cleanTeam1, cleanTeam2)) {
        const result = {
          homeTeam: home,
          awayTeam: away,
          homeScore: match.home?.score || 0,
          awayScore: match.away?.score || 0,
          status: mapStatus(match.status),
          elapsed: match.status?.utcTime || null,
          matchId: match.id
        };
        
        console.log(`✅ Match trouvé:`, result);
        return result;
      }
    }

    console.log(`⚠️ Match non trouvé sur FotMob`);
    return null;

  } catch (error) {
    console.error(`❌ Erreur scraping:`, error.message);
    return null;
  }
}

/**
 * Scraper alternatif via LiveScore.com (backup)
 */
export async function scrapeLiveScore(team1, team2, date) {
  try {
    console.log(`🕷️ LiveScore: Recherche ${team1} vs ${team2}`);

    // LiveScore a une structure plus simple
    const url = `https://www.livescore.com/en/football/${date}/`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    // Parser la page (structure peut changer)
    // Cette partie est simplifiée, à adapter selon la vraie structure
    const matches = [];
    
    $('.match').each((i, elem) => {
      const homeTeam = $(elem).find('.home-team').text().trim();
      const awayTeam = $(elem).find('.away-team').text().trim();
      const homeScore = parseInt($(elem).find('.home-score').text()) || 0;
      const awayScore = parseInt($(elem).find('.away-score').text()) || 0;
      const status = $(elem).find('.status').text().trim();
      
      if (homeTeam && awayTeam) {
        matches.push({ homeTeam, awayTeam, homeScore, awayScore, status });
      }
    });

    // Chercher le match correspondant
    for (const match of matches) {
      if (teamsMatch(match.homeTeam, team1, team2) && teamsMatch(match.awayTeam, team1, team2)) {
        console.log(`✅ Match trouvé sur LiveScore:`, match);
        return {
          ...match,
          status: mapStatus(match.status),
          elapsed: null
        };
      }
    }

    console.log(`⚠️ Match non trouvé sur LiveScore`);
    return null;

  } catch (error) {
    console.error(`❌ Erreur LiveScore:`, error.message);
    return null;
  }
}

/**
 * Fonction principale: essaie plusieurs sources
 */
export async function findMatchScore(team1, team2, date) {
  // Essayer FotMob d'abord
  let result = await scrapeMatchScore(team1, team2, date);
  if (result) return result;

  // Fallback sur LiveScore
  result = await scrapeLiveScore(team1, team2, date);
  if (result) return result;

  // Aucune source n'a trouvé le match
  return null;
}

/**
 * Nettoyer un nom d'équipe pour la recherche
 */
function cleanTeamName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/fc |cf |sc |ac /gi, '')
    .replace(/\s+(united|city|town|athletic|wanderers)$/gi, '');
}

/**
 * Vérifier si deux noms d'équipes correspondent
 */
function teamsMatch(apiTeam, team1, team2) {
  const api = apiTeam.toLowerCase().trim();
  const t1 = team1.toLowerCase().trim();
  const t2 = team2.toLowerCase().trim();
  
  return api.includes(t1) || t1.includes(api) || 
         api.includes(t2) || t2.includes(api);
}

/**
 * Mapper les statuts des différentes sources vers notre format
 */
function mapStatus(status) {
  if (!status) return 'NS';
  
  const s = String(status).toLowerCase();
  
  // Match en cours
  if (s.includes('live') || s.includes('1h') || s.includes('first half')) return '1H';
  if (s.includes('ht') || s.includes('half time') || s.includes('halftime')) return 'HT';
  if (s.includes('2h') || s.includes('second half')) return '2H';
  
  // Match terminé
  if (s.includes('ft') || s.includes('finished') || s.includes('full time')) return 'FT';
  
  // À venir
  if (s.includes('not started') || s.includes('scheduled')) return 'NS';
  
  return 'NS';
}
