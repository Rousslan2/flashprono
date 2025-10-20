# 📊 Optimisation API Football - Économie de requêtes

## 🎯 **Consommation avant optimisation :**
- CRON toutes les 10 min : **144 requêtes/jour** ❌
- 3 requêtes par vérification (hier, avant-hier, aujourd'hui)
- **TOTAL : ~150+ requêtes/jour**

## ✅ **Consommation après optimisation :**
- CRON toutes les 2 heures : **12 requêtes/jour** ✅
- 1 seule requête par vérification (aujourd'hui uniquement)
- Cache de 30 minutes (évite requêtes répétées)
- **TOTAL : ~15-20 requêtes/jour** 🎉

---

## 🔧 **Optimisations appliquées :**

### 1. **Fréquence du CRON réduite**
```javascript
// Avant : */10 * * * * (toutes les 10 min)
// Après : 0 */2 * * * (toutes les 2 heures)
```

### 2. **Moins de dates vérifiées**
```javascript
// Avant : 3 dates (aujourd'hui, hier, avant-hier)
// Après : 1 date (aujourd'hui uniquement)
```

### 3. **Système de cache intelligent**
- Cache de 30 minutes
- Évite les requêtes répétées pour les mêmes données
- Réinitialisation automatique chaque nouveau jour

### 4. **Vérification manuelle économe**
- Utilise le cache si disponible
- Sinon : 1 seule requête API

---

## 📈 **Calcul du quota journalier :**

### **CRON automatique :**
- Toutes les 2h = 12 fois/jour
- Avec cache : ~6 requêtes réelles/jour
- **= 6 requêtes/jour** ✅

### **Vérifications manuelles :**
- En moyenne 2-3 clics/jour
- Avec cache : ~1 requête réelle
- **= 1-3 requêtes/jour** ✅

### **Page Scores (Mes Pronos) :**
- Chargement : 2 requêtes (live + today)
- Cache partagé avec vérification
- **= 2-4 requêtes/jour** ✅

### **TOTAL ESTIMÉ : 10-15 requêtes/jour** 🎯
**Quota disponible : 100/jour**
**Marge de sécurité : 85-90 requêtes** ✅

---

## 💡 **Conseils supplémentaires :**

### **Pour économiser encore plus :**

1. **Désactiver le CRON les jours sans match**
   - Modifier manuellement si besoin
   
2. **Vérifier manuellement uniquement après les matchs**
   - Éviter les clics inutiles

3. **Planifier les vérifications**
   - Matin : 1 vérification
   - Soir : 1 vérification après les matchs

4. **Utiliser l'onglet "Mes Pronos" avec parcimonie**
   - Le cache aide, mais chaque chargement compte

---

## 🔍 **Monitoring de l'utilisation :**

### **Vérifier votre quota restant :**
1. Page **Scores** → Bouton "🧪 Tester la connexion API"
2. Voir le message : `Requests restantes: X/100`

### **Logs utiles dans la console backend :**
```
📋 Utilisation du cache (pas de requête API)  ← Économie !
🌐 Requête API pour les matchs du jour...     ← Requête utilisée
```

---

## ⚙️ **Configuration actuelle :**

```javascript
// Fréquence CRON
"0 */2 * * *" // Toutes les 2 heures

// Durée du cache
30 minutes

// Nombre de dates vérifiées
1 (aujourd'hui uniquement)
```

---

## 🚨 **Si vous dépassez quand même le quota :**

### **Solutions d'urgence :**

1. **Augmenter l'intervalle du CRON**
   ```javascript
   "0 */4 * * *" // Toutes les 4 heures = 6 requêtes/jour
   "0 */6 * * *" // Toutes les 6 heures = 4 requêtes/jour
   ```

2. **Désactiver complètement le CRON**
   - Commenter le CRON dans `server.js`
   - Utiliser uniquement la vérification manuelle

3. **Mode manuel uniquement**
   - Vous cliquez sur le bouton quand vous voulez
   - Contrôle total sur l'utilisation

---

## 📞 **Support :**

Si vous avez des questions sur l'optimisation ou si vous voulez ajuster les paramètres, demandez-moi !

**Date de mise à jour :** ${new Date().toLocaleDateString('fr-FR')}
