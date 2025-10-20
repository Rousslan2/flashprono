// frontend/src/pages/Pronostics.jsx (SUITE)
 to-black border-2 border-primary/30 rounded-xl p-4 shadow-2xl z-20 flex gap-3 animate-slide-in-up backdrop-blur-xl">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={`text-3xl hover:scale-150 transition-all duration-300 ${
                      myReaction === emoji ? 'scale-150 drop-shadow-2xl filter brightness-150' : ''
                    }`}
                    title={myReaction === emoji ? 'Retirer' : 'Réagir'}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Affichage des réactions groupées - STYLE MODERNE */}
      {reactions.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2 relative z-10">
          {reactions.map(r => (
            <div
              key={r.emoji}
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-gray-700/50 rounded-full text-sm hover:scale-110 hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-primary/30 backdrop-blur-sm"
              title={r.users.map(u => u.name).join(', ')}
            >
              <span className="text-2xl group-hover:scale-125 transition-transform">{r.emoji}</span>
              <span className="text-white font-bold">{r.count}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal Mise */}
      {showMiseModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-primary rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-primary/50 animate-slide-in-up">
            <h3 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <span className="text-4xl">💰</span> Quelle mise ?
            </h3>
            <p className="text-gray-400 text-sm mb-6">Choisis un montant prédéfini ou entre le tien</p>
            
            {/* Boutons prédéfinis */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[5, 10, 20, 50, 100, 200].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleFollow(amount)}
                  className="px-4 py-4 bg-primary/20 border-2 border-primary/40 text-primary rounded-2xl hover:bg-primary hover:text-black transition-all font-black text-lg hover:scale-110 shadow-lg hover:shadow-primary/50"
                >
                  {amount}€
                </button>
              ))}
            </div>
            
            {/* Input personnalisé */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-3 font-semibold">🖊️ Autre montant</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Ex: 15"
                  value={customMise}
                  onChange={(e) => setCustomMise(e.target.value)}
                  className="flex-1 px-5 py-4 bg-black border-2 border-primary/40 rounded-2xl text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all text-lg font-bold"
                  min="0.01"
                  step="0.01"
                />
                <button
                  onClick={handleCustomFollow}
                  className="px-6 py-4 bg-gradient-to-r from-primary to-yellow-400 text-black rounded-2xl hover:scale-110 transition-all font-black shadow-lg hover:shadow-primary/50"
                >
                  OK
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowMiseModal(false);
                setCustomMise("");
              }}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-2xl hover:bg-gray-600 transition font-bold"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Analyse */}
      {(p.details || p.audioUrl) && (
        <div className="mt-6 relative z-10">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 px-6 py-3 border-2 border-primary/40 rounded-2xl hover:bg-primary/10 transition-all font-bold text-sm group hover:scale-105 shadow-lg w-full justify-center"
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">
              {open ? "📖" : "🔍"}
            </span>
            <span className="text-lg">{open ? "Masquer l'analyse" : "Voir l'analyse détaillée"}</span>
          </button>
          {open && (
            <div className="mt-4 p-6 bg-gradient-to-br from-black/80 to-gray-900/80 border-2 border-primary/20 rounded-2xl space-y-4 backdrop-blur-sm animate-slide-in-up shadow-2xl">
              {p.details && (
                <div>
                  <h4 className="text-primary font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="text-2xl">📝</span> Analyse complète
                  </h4>
                  <p className="text-gray-300 whitespace-pre-line leading-relaxed text-base">
                    {p.details}
                  </p>
                </div>
              )}
              {p.audioUrl && (
                <div>
                  <h4 className="text-primary font-bold text-lg mb-3 flex items-center gap-2">
                    <span className="text-2xl">🎧</span> Audio
                  </h4>
                  <audio controls className="w-full">
                    <source src={`${API_BASE}${p.audioUrl}`} />
                  </audio>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function LabelBadge({ label }) {
  if (label === "strategie_bankroll") {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-gradient-to-r from-blue-400/20 to-cyan-400/20 text-blue-300 border-2 border-blue-500/40 shadow-lg animate-pulse-slow">
        🧠 Stratégie
      </span>
    );
  }
  if (label === "prono_en_or") {
    return (
      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black bg-gradient-to-r from-yellow-400/30 to-orange-400/30 text-yellow-300 border-2 border-yellow-500/50 animate-shimmer shadow-2xl shadow-yellow-500/50">
        <span className="animate-spin-slow">👑</span> PRONO EN OR
      </span>
    );
  }
  return null;
}

function ResultPill({ value }) {
  const val = (value || "En attente").toLowerCase();
  let cls = "bg-gray-500/20 text-gray-300 border-gray-600/50";
  let icon = "⏳";
  let label = value || "En attente";

  if (val.includes("gagnant") || val.includes("win")) {
    cls = "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/30";
    icon = "✅";
  } else if (val.includes("perdu") || val.includes("lose")) {
    cls = "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/40 shadow-lg shadow-red-500/30";
    icon = "❌";
  }

  return (
    <span className={`inline-flex items-center gap-2 text-sm px-5 py-3 rounded-2xl font-black border-2 ${cls} hover:scale-110 transition-all`}>
      <span className="text-xl">{icon}</span>
      {label}
    </span>
  );
}

function borderColorFor(result) {
  const val = (result || "").toLowerCase();
  if (val.includes("gagnant") || val.includes("win")) return "border-emerald-400 shadow-emerald-500/50";
  if (val.includes("perdu") || val.includes("lose")) return "border-red-500 shadow-red-500/50";
  return "border-gray-600";
}

function computeMatchStatus(dateStr, now = new Date()) {
  if (!dateStr) return { kind: "unknown" };
  const start = new Date(dateStr);
  if (isNaN(start.getTime())) return { kind: "unknown" };

  const diffMs = now.getTime() - start.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 0) {
    const mins = Math.abs(diffMin);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return { kind: "upcoming", hours: h, mins: m };
  }

  if (diffMin < 45) return { kind: "live", minutes: diffMin };
  if (diffMin < 60) return { kind: "halftime", minutes: diffMin };
  if (diffMin < 120) return { kind: "live", minutes: diffMin - 15 };
  return { kind: "finished" };
}

function renderStatus(st) {
  if (!st || st.kind === "unknown")
    return <span className="text-gray-500">—</span>;
  if (st.kind === "upcoming") {
    if (st.hours <= 0)
      return <span className="text-emerald-300 font-bold animate-pulse">📍 Dans {st.mins} min</span>;
    return (
      <span className="text-emerald-300 font-bold animate-pulse">
        📍 Dans {st.hours}h {st.mins}m
      </span>
    );
  }
  if (st.kind === "halftime")
    return <span className="text-sky-300 font-bold flex items-center gap-1">⏸️ Mi-temps</span>;
  if (st.kind === "live")
    return (
      <span className="text-amber-300 font-bold flex items-center gap-1">
        <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        LIVE {st.minutes}'
      </span>
    );
  if (st.kind === "finished")
    return <span className="text-gray-500 font-semibold">🏁 Terminé</span>;
  return <span className="text-gray-500">—</span>;
}

function SkeletonCard() {
  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-black p-8 rounded-3xl border-2 border-gray-700 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-32 bg-gray-800 rounded-full" />
        <div className="h-6 w-40 bg-gray-800 rounded" />
      </div>
      <div className="h-10 w-3/4 bg-gray-800 rounded mb-6" />
      <div className="flex gap-3 mb-6">
        <div className="h-20 w-32 bg-gray-800 rounded-2xl" />
        <div className="h-20 w-32 bg-gray-800 rounded-2xl" />
      </div>
    </div>
  );
}

export default Pronostics;
