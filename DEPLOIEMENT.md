# 🚀 Guide Déploiement & Performance

## ⚡ Configuration actuelle (OPTIMISÉE)

### **CRON Jobs :**
- ✅ Vérification pronostics : **Toutes les 2 minutes**
- ✅ Déconnexions auto : **Toutes les 5 minutes**  
- ✅ Nettoyage abonnements : **1x/jour à 3h**

### **Raison du changement 1min → 2min :**
- 🔥 **1 minute** = 60 exécutions/heure = charge serveur élevée
- ⚡ **2 minutes** = 30 exécutions/heure = **50% moins de charge**
- 🎯 **Latence max** : 2 minutes (toujours acceptable pour du LIVE)

---

## 📊 Consommation estimée

| Config | Requêtes/heure | Charge CPU | Déploiement |
|--------|----------------|------------|-------------|
| 1 min | ~60 | Élevée ❌ | Lent 🐌 |
| **2 min** | **~30** | **Moyenne ✅** | **Rapide ⚡** |
| 5 min | ~12 | Basse ✅ | Très rapide 🚀 |

---

## 🔍 Debugging si déploiement lent

### **1. Vérifier les logs Railway :**
```
Railway Dashboard → Backend → Deployments → Logs
```

**Cherchez :**
- ❌ Erreurs de syntaxe
- ❌ Dépendances manquantes
- ❌ Timeout de connexion MongoDB
- ❌ API_KEY manquante

### **2. Variables d'environnement requises :**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
FOOTBALL_API_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
CLIENT_URL=https://...
```

### **3. Temps de build normal :**
- ⏱️ **Backend** : 1-3 minutes
- ⏱️ **Frontend** : 2-5 minutes
- ⏱️ **Total** : ~5-8 minutes

**Si > 10 minutes** → Problème !

---

## 🚨 Solutions d'urgence

### **Si le serveur plante en boucle :**

**Option 1 : Désactiver temporairement le CRON**
```javascript
// Dans server.js, commenter :
// cron.schedule("*/2 * * * *", async () => { ... });
```

**Option 2 : Augmenter l'intervalle à 5 minutes**
```javascript
cron.schedule("*/5 * * * *", ...)
```

**Option 3 : Mode manuel uniquement**
- Désactiver tous les CRON
- Utiliser uniquement le bouton "🔄 Vérifier" dans l'admin

---

## 💡 Optimisations futures possibles

### **1. Cache Redis**
- Stocker les matchs en cache pendant 2-5 minutes
- Réduire encore les appels API

### **2. WebSocket optimisé**
- Envoi des updates uniquement aux utilisateurs connectés
- Réduction de la charge

### **3. Monitoring**
- Ajouter un endpoint `/health` 
- Surveiller la performance en temps réel

---

## ✅ Checklist déploiement

Avant chaque push :

- [ ] Vérifier que le CRON n'est pas trop fréquent (< 1 min)
- [ ] Tester localement avec `npm run dev`
- [ ] Vérifier les logs pour les erreurs
- [ ] Confirmer que les variables d'env sont à jour
- [ ] Vérifier la consommation API (< 100/jour)

---

## 📞 Support

**Si le déploiement prend > 10 minutes :**
1. Vérifier les logs Railway
2. Chercher les erreurs dans la console
3. Redémarrer le service manuellement
4. Contacter le support Railway si nécessaire

**Date de dernière optimisation :** ${new Date().toLocaleDateString('fr-FR')}
