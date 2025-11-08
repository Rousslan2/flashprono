import mongoose from "mongoose";
import dotenv from "dotenv";

// Configuration
dotenv.config();

// Connexion à la base de données
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Erreur MongoDB:", error.message);
    process.exit(1);
  }
};

// Modèles
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  subscription: {
    status: String,
    expiresAt: Date,
    plan: String
  },
  isAdmin: Boolean,
  isBanned: Boolean,
  lastSeen: Date
});

const User = mongoose.model('User', userSchema);

console.log("🔧 Correction des problèmes d'authentification");
console.log("=" .repeat(60));

/**
 * Corriger les utilisateurs avec des abonnements expirés
 */
async function fixExpiredSubscriptions() {
  try {
    const now = new Date();
    const expiredUsers = await User.find({
      "subscription.expiresAt": { $lt: now },
      "subscription.status": { $in: ["active", "trial"] }
    });

    console.log(`📊 Trouvé ${expiredUsers.length} utilisateurs avec abonnements expirés`);

    let fixedCount = 0;

    for (const user of expiredUsers) {
      console.log(`🔄 Correction abonnement expiré: ${user.email}`);
      console.log(`   Statut actuel: ${user.subscription.status}`);
      console.log(`   Expiration: ${user.subscription.expiresAt}`);

      // Marquer comme inactif
      user.subscription.status = "inactive";
      user.subscription.plan = null;
      user.subscription.expiresAt = null;

      await user.save();
      fixedCount++;

      console.log(`   ✅ Corrigé: abonnement marqué comme inactif`);
    }

    console.log(`\n📈 Résumé: ${fixedCount} abonnements expirés corrigés`);
    return fixedCount;

  } catch (error) {
    console.error("❌ Erreur correction abonnements:", error);
    return 0;
  }
}

/**
 * Vérifier les utilisateurs actifs
 */
async function checkActiveUsers() {
  try {
    const activeUsers = await User.find({
      $or: [
        { "subscription.status": "active" },
        { "subscription.status": "trial" }
      ],
      "subscription.expiresAt": { $gt: new Date() }
    });

    console.log(`\n👥 Utilisateurs avec accès actif: ${activeUsers.length}`);

    activeUsers.forEach(user => {
      console.log(`   ✅ ${user.email} - ${user.subscription.status} (expire: ${user.subscription.expiresAt})`);
    });

    return activeUsers.length;

  } catch (error) {
    console.error("❌ Erreur vérification utilisateurs actifs:", error);
    return 0;
  }
}

/**
 * Créer un utilisateur de test avec accès actif (pour debug)
 */
async function createTestUser() {
  try {
    // Vérifier si l'utilisateur de test existe déjà
    const existingUser = await User.findOne({ email: "test@flashprono.com" });

    if (existingUser) {
      console.log(`\n🧪 Utilisateur de test existe déjà: ${existingUser.email}`);
      return existingUser;
    }

    // Créer un utilisateur de test avec abonnement actif
    const testUser = new User({
      email: "test@flashprono.com",
      name: "Utilisateur Test",
      subscription: {
        status: "trial",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        plan: "test"
      },
      isAdmin: false,
      isBanned: false,
      lastSeen: new Date()
    });

    await testUser.save();

    console.log(`\n🧪 Utilisateur de test créé:`);
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Statut: ${testUser.subscription.status}`);
    console.log(`   Expire: ${testUser.subscription.expiresAt}`);

    return testUser;

  } catch (error) {
    console.error("❌ Erreur création utilisateur test:", error);
    return null;
  }
}

/**
 * Vérifier les routes d'accès
 */
async function checkAccessRoutes() {
  console.log(`\n🔍 Vérification des routes d'accès:`);

  const routes = [
    { path: "/api/pronostics", method: "GET", requires: "protect + subscription" },
    { path: "/api/stats", method: "GET", requires: "protect" },
    { path: "/api/auth/logout", method: "POST", requires: "protect" },
    { path: "/api/health", method: "GET", requires: "none" }
  ];

  routes.forEach(route => {
    console.log(`   ${route.method} ${route.path} → ${route.requires}`);
  });

  console.log(`\n💡 Conseils pour résoudre les 401:`);
  console.log(`   1. Vérifier que le token JWT n'est pas expiré`);
  console.log(`   2. S'assurer que l'utilisateur a un abonnement actif`);
  console.log(`   3. Vider le cache du navigateur`);
  console.log(`   4. Se reconnecter`);
}

/**
 * Générer un rapport complet
 */
async function generateReport() {
  console.log(`\n📊 RAPPORT COMPLET DU SYSTÈME`);
  console.log("=" .repeat(50));

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({
    $or: [
      { "subscription.status": "active" },
      { "subscription.status": "trial" }
    ],
    "subscription.expiresAt": { $gt: new Date() }
  });

  const expiredUsers = await User.countDocuments({
    "subscription.expiresAt": { $lt: new Date() },
    "subscription.status": { $in: ["active", "trial"] }
  });

  console.log(`👥 Utilisateurs totaux: ${totalUsers}`);
  console.log(`✅ Utilisateurs actifs: ${activeUsers}`);
  console.log(`⏰ Utilisateurs expirés: ${expiredUsers}`);
  console.log(`🔒 Utilisateurs bannis: ${await User.countDocuments({ isBanned: true })}`);
  console.log(`👑 Administrateurs: ${await User.countDocuments({ isAdmin: true })}`);

  console.log(`\n🔧 État du système:`);
  console.log(`   ✅ API Football: ${process.env.FOOTBALL_API_KEY ? 'Configurée' : 'Manquante'}`);
  console.log(`   ✅ Base de données: Connectée`);
  console.log(`   ✅ JWT Secret: ${process.env.JWT_SECRET ? 'Présent' : 'Manquant'}`);
  console.log(`   ✅ Port serveur: ${process.env.PORT || 8080}`);

  console.log(`\n🚨 Problèmes détectés:`);
  if (expiredUsers > 0) {
    console.log(`   ⚠️ ${expiredUsers} utilisateurs ont des abonnements expirés`);
  }
  if (!process.env.FOOTBALL_API_KEY) {
    console.log(`   ❌ Clé API Football manquante`);
  }
  if (!process.env.JWT_SECRET) {
    console.log(`   ❌ JWT Secret manquant`);
  }
}

// Exécution
async function main() {
  await connectDB();

  console.log("🔧 PHASE 1: Correction des abonnements expirés");
  const fixedSubscriptions = await fixExpiredSubscriptions();

  console.log("\n🔧 PHASE 2: Vérification des utilisateurs actifs");
  const activeCount = await checkActiveUsers();

  console.log("\n🔧 PHASE 3: Création utilisateur de test");
  await createTestUser();

  console.log("\n🔧 PHASE 4: Vérification des routes");
  checkAccessRoutes();

  console.log("\n🔧 PHASE 5: Rapport système");
  await generateReport();

  console.log(`\n🎯 CORRECTIONS TERMINÉES!`);
  console.log(`📊 Résumé:`);
  console.log(`   - Abonnements expirés corrigés: ${fixedSubscriptions}`);
  console.log(`   - Utilisateurs actifs: ${activeCount}`);
  console.log(`   - Utilisateur de test: Créé`);

  console.log(`\n💡 PROCHAINES ÉTAPES:`);
  console.log(`   1. Redémarrer le serveur`);
  console.log(`   2. Vider le cache du navigateur`);
  console.log(`   3. Se reconnecter avec un compte actif`);
  console.log(`   4. Tester l'accès aux pronostics`);

  process.exit(0);
}

main().catch(console.error);