# 🧪 Tests des nouvelles fonctionnalités Admin

## ✅ Checklist de test

### Backend

- [ ] **Route PATCH /api/admin/users/:id/modify-subscription-days**
  - [ ] Ajouter 7 jours fonctionne
  - [ ] Retirer 3 jours fonctionne
  - [ ] Avec abonnement expiré, repart d'aujourd'hui
  - [ ] Réactive un abonnement inactif si on ajoute des jours
  - [ ] Retourne l'utilisateur mis à jour

- [ ] **Route DELETE /api/admin/users/:id**
  - [ ] Suppression d'un utilisateur fonctionne
  - [ ] Empêche la suppression de son propre compte
  - [ ] Retourne une erreur 404 si utilisateur inexistant
  - [ ] Logs correctement l'action

### Frontend

- [ ] **Bouton "📆 Modifier jours"**
  - [ ] Affiche un prompt pour saisir les jours
  - [ ] Valide que c'est un nombre
  - [ ] Envoie la requête au backend
  - [ ] Met à jour la liste des utilisateurs
  - [ ] Affiche un message de succès

- [ ] **Bouton "🗑️ Supprimer"**
  - [ ] Affiche une confirmation avec le nom de l'utilisateur
  - [ ] Envoie la requête au backend
  - [ ] Retire l'utilisateur de la liste
  - [ ] Affiche un message de succès

- [ ] **Actualisation automatique**
  - [ ] Admin donne un abonnement à un utilisateur connecté → recharge automatique
  - [ ] Admin bannit un utilisateur connecté → recharge automatique
  - [ ] Admin modifie les jours d'un utilisateur connecté → recharge automatique
  - [ ] Le localStorage est bien mis à jour
  - [ ] L'interface reflète les changements immédiatement

### UI/UX

- [ ] Tous les boutons sont visibles et bien alignés
- [ ] Les couleurs des boutons sont cohérentes
- [ ] Le bouton bleu "Modifier jours" se distingue bien
- [ ] Le bouton rouge "Supprimer" est bien visible
- [ ] Les messages d'alerte sont clairs
- [ ] La pagination fonctionne toujours

### Logs

- [ ] Les actions sont bien loggées dans la console backend
- [ ] Format : `MODIFY_DAYS_+7`, `MODIFY_DAYS_-3`, `DELETE_USER`

## 🚀 Scénarios de test

### Scénario 1 : Modifier les jours d'abonnement
1. Se connecter en tant qu'admin
2. Aller dans "Utilisateurs"
3. Cliquer sur "📆 Modifier jours" pour un utilisateur
4. Saisir `7`
5. Vérifier que la date d'expiration a bien 7 jours de plus
6. Cliquer à nouveau sur "📆 Modifier jours"
7. Saisir `-3`
8. Vérifier que la date d'expiration a perdu 3 jours

### Scénario 2 : Supprimer un compte
1. Se connecter en tant qu'admin
2. Aller dans "Utilisateurs"
3. Cliquer sur "🗑️ Supprimer" pour un utilisateur test
4. Confirmer la suppression
5. Vérifier que l'utilisateur a disparu de la liste
6. Tenter de se connecter avec ce compte → erreur "utilisateur non trouvé"

### Scénario 3 : Actualisation automatique
1. Ouvrir 2 navigateurs (ou 2 profils)
2. Browser 1 : Se connecter en tant qu'admin
3. Browser 2 : Se connecter en tant qu'utilisateur normal
4. Browser 1 : Donner un abonnement 30j à l'utilisateur du Browser 2
5. Browser 2 : La page se recharge automatiquement
6. Browser 2 : Vérifier que l'abonnement est actif dans le dashboard

### Scénario 4 : Empêcher la suppression de son propre compte
1. Se connecter en tant qu'admin
2. Aller dans "Utilisateurs"
3. Chercher son propre compte
4. Cliquer sur "🗑️ Supprimer"
5. Vérifier qu'un message d'erreur apparaît

## 📋 Résultats attendus

### Backend
- Code 200 pour succès
- Code 400 pour données invalides
- Code 404 pour utilisateur non trouvé
- Code 403 si non admin
- Logs corrects dans la console

### Frontend
- Interface réactive
- Messages clairs
- Pas d'erreurs dans la console
- Rechargement fluide après 500ms
- Données à jour immédiatement

## 🐛 Bugs potentiels à surveiller

- [ ] Double rechargement de page
- [ ] Perte de session après actualisation
- [ ] Bouton qui ne répond pas au clic
- [ ] Prompt qui ne s'ouvre pas
- [ ] Validation des jours (NaN, 0, négatifs extrêmes)
- [ ] Suppression d'un admin par un autre admin
- [ ] Pagination cassée après suppression
- [ ] Race condition si plusieurs admins agissent simultanément
