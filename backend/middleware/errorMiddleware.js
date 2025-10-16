// =============================
// ⚠️ ERROR HANDLER MIDDLEWARE
// =============================

/**
 * Middleware global pour intercepter les erreurs serveur
 * et renvoyer un format JSON propre et cohérent.
 */
export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Erreur serveur:", err.stack || err);

  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Erreur interne du serveur";

  // ⚙️ Gestion spécifique MongoDB
  if (err.name === "CastError" && err.kind === "ObjectId") {
    message = "Ressource introuvable";
    statusCode = 404;
  }

  if (err.code === 11000) {
    message = "Doublon détecté dans la base de données (email déjà utilisé)";
    statusCode = 400;
  }

  // ⚙️ Erreurs validation Mongoose
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((val) => val.message);
    message = `Erreur de validation : ${errors.join(", ")}`;
    statusCode = 400;
  }

  res.status(statusCode).json({
    ok: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
