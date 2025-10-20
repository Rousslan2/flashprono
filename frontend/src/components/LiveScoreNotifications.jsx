import { useEffect, useState } from "react";
import socket from "../services/socket";

export default function LiveScoreNotifications() {
  const [liveMatches, setLiveMatches] = useState([]);

  useEffect(() => {
    // Écouter les mises à jour de scores en direct
    const handleLiveUpdate = (data) => {
      console.log("🔴 Score LIVE:", data);
      
      setLiveMatches((prev) => {
        // Vérifier si le match existe déjà
        const existingIndex = prev.findIndex((m) => m.pronosticId === data.pronosticId);
        
        if (existingIndex !== -1) {
          // Mettre à jour le match existant
          const updated = [...prev];
          updated[existingIndex] = {
            ...data,
            id: Date.now(),
            timestamp: new Date(),
          };
          return updated;
        } else {
          // Ajouter un nouveau match
          return [{
            ...data,
            id: Date.now(),
            timestamp: new Date(),
          }, ...prev].slice(0, 3); // Garder max 3 matchs live
        }
      });
    };

    const handleMatchFinished = (data) => {
      console.log("✅ Match terminé:", data);
      
      // Retirer le match de la liste des lives après 5 secondes
      setTimeout(() => {
        setLiveMatches((prev) => prev.filter((m) => m.pronosticId !== data.pronosticId));
      }, 5000);
    };

    socket.on("pronostic:live", handleLiveUpdate);
    socket.on("pronostic:updated", handleMatchFinished);

    return () => {
      socket.off("pronostic:live", handleLiveUpdate);
      socket.off("pronostic:updated", handleMatchFinished);
    };
  }, []);

  if (liveMatches.length === 0) return null;

  return (
    <div className="fixed top-20 left-4 z-50 space-y-2 max-w-sm">
      {liveMatches.map((match) => (
        <div
          key={match.id}
          className="p-4 rounded-xl border-2 shadow-2xl animate-pulse bg-red-500/20 border-red-500"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="font-bold text-sm text-red-400">
                  🔴 EN DIRECT {match.elapsed ? `- ${match.elapsed}'` : ""}
                </span>
              </div>
              
              <p className="text-white font-semibold text-sm">
                {match.equipe1} vs {match.equipe2}
              </p>
              
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-bold text-white">
                  {match.resultat}
                </span>
                <span className="text-xs text-gray-300">
                  {match.type} • {match.cote}
                </span>
              </div>
            </div>
            
            <button
              onClick={() =>
                setLiveMatches((prev) => prev.filter((m) => m.id !== match.id))
              }
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
