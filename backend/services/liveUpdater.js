// backend/services/liveUpdater.js
import axios from "axios";
import Pronostic from "../models/Pronostic.js";

const TTL_WINDOW_HOURS = 3;

// Détermine le résultat automatiquement quand le match est FT.
// NOTE: à affiner si tu ajoutes un champ "pick" (1 / N / 2).
function computeResult(prono, home, away) {
  if (home === away) return "Nul";
  // Hypothèse neutre: Gagnant si équipe1 > équipe2 sinon Perdant
  return home > away ? "Gagnant" : "Perdant";
}

export async function syncLive() {
  const now = new Date();
  const from = new Date(now.getTime() - TTL_WINDOW_HOURS * 3600 * 1000);
  const to   = new Date(now.getTime() + TTL_WINDOW_HOURS * 3600 * 1000);

  const candidates = await Pronostic.find({
    externalProvider: { $ne: null },
    externalFixtureId: { $ne: null },
    resultat: "En attente",
    date: { $gte: from, $lte: to },
  }).limit(100);

  const apiFootball = candidates.filter(c => c.externalProvider === "apifootball");
  if (apiFootball.length) {
    // API-FOOTBALL v3
    // Docs: https://www.api-football.com/documentation-v3#tag/Fixtures/operation/get-fixtures
    const ids = apiFootball.map(p => p.externalFixtureId).join("-");
    try {
      const { data } = await axios.get("https://v3.football.api-sports.io/fixtures", {
        params: { ids }, // tu peux aussi utiliser ?date=YYYY-MM-DD ou live=all
        headers: { "x-apisports-key": process.env.APIFOOTBALL_KEY }
      });

      const list = data?.response || [];
      for (const p of apiFootball) {
        const fx = list.find(r => String(r.fixture?.id) === String(p.externalFixtureId));
        if (!fx) continue;

        const status = fx.fixture?.status?.short || "NS";
        const home = fx.goals?.home ?? 0;
        const away = fx.goals?.away ?? 0;

        const update = {
          status,
          scoreHome: home,
          scoreAway: away,
          lastSyncedAt: new Date(),
        };

        if (status === "FT") {
          update.resultat = computeResult(p, home, away);
        }

        await Pronostic.findByIdAndUpdate(p._id, { $set: update });
      }
    } catch (e) {
      console.error("syncLive: API error", e?.response?.data || e.message);
    }
  }
}
