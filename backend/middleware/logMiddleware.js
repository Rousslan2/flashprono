// =============================
// 🧾 LOG MIDDLEWARE (ADMIN ACTIONS)
// =============================

/**
 * logAdminAction(action, admin, target)
 * - Enregistre les actions sensibles effectuées par les admins
 * - Exemple : bannir, débannir, promouvoir, donner un abo
 */
export const logAdminAction = (action, admin, target) => {
  const log = `[${new Date().toLocaleString()}] 👑 ${admin.email} → ${action} ${target?.email || target}`;
  console.log(log);
};
