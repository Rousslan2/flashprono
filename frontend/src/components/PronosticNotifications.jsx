import { useEffect, useState } from "react";
import socket from "../services/socket";

export default function PronosticNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Écouter les mises à jour de pronostics
    const handlePronosticUpdate = (data) => {
      console.log("🔔 Pronostic mis à jour:", data);
      
      const notification = {
        id: Date.now(),
        ...data,
        timestamp: new Date(),
      };

      setNotifications((prev) => [notification, ...prev].slice(0, 5)); // Garder les 5 dernières

      // Retirer la notification après 10 secondes
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }, 10000);
    };

    socket.on("pronostic:updated", handlePronosticUpdate);

    return () => {
      socket.off("pronostic:updated", handlePronosticUpdate);
    };
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-4 rounded-xl border-2 shadow-2xl animate-slideInRight ${
            notif.statut === "gagnant"
              ? "bg-green-500/20 border-green-500"
              : notif.statut === "perdu"
              ? "bg-red-500/20 border-red-500"
              : "bg-yellow-500/20 border-yellow-500"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">
                  {notif.statut === "gagnant" ? "✅" : notif.statut === "perdu" ? "❌" : "⚠️"}
                </span>
                <span
                  className={`font-bold text-sm ${
                    notif.statut === "gagnant"
                      ? "text-green-400"
                      : notif.statut === "perdu"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {notif.statut.toUpperCase()}
                </span>
              </div>
              <p className="text-white font-semibold text-sm">
                {notif.equipe1} vs {notif.equipe2}
              </p>
              <p className="text-gray-300 text-xs mt-1">
                {notif.type} • Cote {notif.cote}
              </p>
              {notif.resultat && (
                <p className="text-gray-400 text-xs mt-1">Score: {notif.resultat}</p>
              )}
            </div>
            <button
              onClick={() =>
                setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
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
