# ✅ Checklist de Déploiement - Dieu veille sur nos enfants

Cochez chaque étape au fur et à mesure que vous avancez !

---

## 🎯 Préparation

- [ ] J'ai ouvert **GUIDE-DEBUTANT.md** dans un onglet
- [ ] J'ai ouvert **COMMANDES.txt** dans un autre onglet
- [ ] J'ai ouvert cette **CHECKLIST.md** pour suivre ma progression
- [ ] J'ai ma carte bancaire à portée de main (pour Render)
- [ ] J'ai mon adresse email accessible

---

## 🐙 Étape 1 : GitHub

### Créer le compte GitHub
- [ ] Je suis allé sur github.com
- [ ] J'ai cliqué sur "Sign up"
- [ ] J'ai rempli : email, mot de passe, username
- [ ] J'ai validé mon email avec le code reçu
- [ ] Mon compte GitHub est créé ✅

### Créer le dépôt (repository)
- [ ] J'ai cliqué sur "+" → "New repository"
- [ ] J'ai nommé le dépôt : `dieu-veille-nos-enfants`
- [ ] J'ai coché "Private"
- [ ] J'ai cliqué sur "Create repository"
- [ ] Mon dépôt est créé ✅

### Créer le token GitHub
- [ ] Je suis allé dans Settings → Developer settings
- [ ] J'ai cliqué sur "Personal access tokens" → "Tokens (classic)"
- [ ] J'ai cliqué sur "Generate new token (classic)"
- [ ] J'ai coché uniquement la case "repo"
- [ ] J'ai généré le token
- [ ] **J'ai copié et sauvegardé mon token** (ghp_xxxx) ✅

### Envoyer le code sur GitHub
- [ ] J'ai ouvert le Shell dans Replit
- [ ] J'ai copié-collé la COMMANDE 1 : `git init`
- [ ] J'ai copié-collé la COMMANDE 2 : `git add .`
- [ ] J'ai copié-collé la COMMANDE 3 : `git commit -m "..."`
- [ ] J'ai copié-collé la COMMANDE 4 (en changeant `<VOTRE_USERNAME>`)
- [ ] J'ai copié-collé la COMMANDE 5 : `git branch -M main`
- [ ] J'ai copié-collé la COMMANDE 6 : `git push -u origin main`
- [ ] Quand demandé, j'ai collé mon **TOKEN** (pas mon mot de passe !)
- [ ] Mon code est sur GitHub ✅

### Vérifier
- [ ] Je suis allé sur GitHub dans mon dépôt
- [ ] Je vois tous mes fichiers (client, server, shared, etc.)
- [ ] Tout est bon ✅

---

## 🎨 Étape 2 : Render

### Créer le compte Render
- [ ] Je suis allé sur render.com
- [ ] J'ai cliqué sur "Get Started"
- [ ] J'ai cliqué sur "Sign up with GitHub"
- [ ] J'ai autorisé Render à accéder à GitHub
- [ ] Mon compte Render est créé ✅

---

## 🗄️ Étape 3 : Base de Données PostgreSQL

### Créer la base de données
- [ ] Sur Render, j'ai cliqué sur "New +" → "PostgreSQL"
- [ ] J'ai rempli :
  - Name : `dieu-veille-db`
  - Region : **Frankfurt (EU Central)**
  - PostgreSQL Version : **16**
  - Plan : Free ou Starter
- [ ] J'ai cliqué sur "Create Database"
- [ ] J'ai attendu que le statut soit "Available"
- [ ] La base de données est créée ✅

### Copier l'URL de connexion
- [ ] J'ai copié "Internal Database URL"
- [ ] J'ai collé cette URL dans un fichier texte sur mon PC
- [ ] L'URL est sauvegardée ✅

---

## 🚀 Étape 4 : Web Service

### Connecter GitHub à Render
- [ ] Sur Render, j'ai cliqué sur "New +" → "Web Service"
- [ ] J'ai cliqué sur "Configure account"
- [ ] J'ai autorisé Render à accéder à mon dépôt GitHub
- [ ] J'ai sélectionné "Only select repositories"
- [ ] J'ai coché `dieu-veille-nos-enfants`
- [ ] J'ai cliqué sur "Install"
- [ ] GitHub est connecté ✅

### Configurer le service
- [ ] J'ai sélectionné mon dépôt `dieu-veille-nos-enfants`
- [ ] J'ai cliqué sur "Connect"
- [ ] J'ai rempli la configuration :
  - Name : `dieu-veille-nos-enfants`
  - Region : **Frankfurt (EU Central)**
  - Branch : `main`
  - Runtime : **Node**
  - Build Command : `npm install && npm run build`
  - Start Command : `npm start`
  - Plan : Free ou Starter

### Ajouter les variables d'environnement
- [ ] J'ai cliqué sur "Advanced"
- [ ] J'ai cliqué sur "Add Environment Variable" 3 fois
- [ ] J'ai ajouté :
  - `NODE_ENV` = `production`
  - `DATABASE_URL` = [URL de ma base de données]
  - `SESSION_SECRET` = [Secret généré avec la commande]
- [ ] Les 3 variables sont bien renseignées ✅

### Générer SESSION_SECRET
- [ ] J'ai ouvert le Shell Replit
- [ ] J'ai copié la commande de COMMANDES.txt (Partie 2)
- [ ] J'ai copié le résultat (longue chaîne)
- [ ] J'ai collé dans la variable `SESSION_SECRET` sur Render
- [ ] SESSION_SECRET est configuré ✅

### Déployer
- [ ] J'ai cliqué sur "Create Web Service"
- [ ] J'ai attendu le déploiement (5-10 minutes)
- [ ] Le statut est passé à "Live"
- [ ] L'application est déployée ✅

---

## 🗃️ Étape 5 : Initialiser la Base de Données

### Lancer la migration
- [ ] Sur Render, je suis allé dans mon Web Service
- [ ] J'ai cliqué sur "Shell" (menu gauche)
- [ ] J'ai tapé : `npm run db:migrate`
- [ ] J'ai appuyé sur Entrée
- [ ] J'ai vu le message de succès avec la liste des tables
- [ ] La base de données est initialisée ✅

---

## ✅ Étape 6 : Tester l'Application

### Vérifier que tout fonctionne
- [ ] J'ai cliqué sur l'URL : `https://dieu-veille-nos-enfants.onrender.com`
- [ ] La page d'accueil s'affiche correctement
- [ ] Les formulaires fonctionnent
- [ ] Je peux me connecter en admin (admin/admin123)
- [ ] Le tableau de bord admin s'affiche
- [ ] L'application fonctionne ✅

### Changer le mot de passe admin
- [ ] Je me suis connecté avec admin/admin123
- [ ] Je suis allé dans "Profil"
- [ ] J'ai cliqué sur "Modifier"
- [ ] J'ai changé le mot de passe
- [ ] J'ai sauvegardé
- [ ] Le mot de passe est changé ✅

---

## 🌐 Étape 7 : Connecter le Domaine Hostinger (OPTIONNEL)

### Sur Render
- [ ] Je suis allé dans Settings → Custom Domain
- [ ] J'ai cliqué sur "Add Custom Domain"
- [ ] J'ai tapé : `www.mon-domaine.com`
- [ ] J'ai cliqué sur "Save"
- [ ] J'ai noté les valeurs CNAME affichées
- [ ] Le domaine est ajouté sur Render ✅

### Sur Hostinger
- [ ] Je me suis connecté à Hostinger
- [ ] Je suis allé dans Domaines → Mon domaine → DNS
- [ ] J'ai ajouté un enregistrement CNAME :
  - Type : CNAME
  - Name : www
  - Target : dieu-veille-nos-enfants.onrender.com
- [ ] J'ai ajouté un enregistrement A :
  - Type : A
  - Name : @
  - Target : [IP fournie par Render]
- [ ] J'ai sauvegardé
- [ ] Le domaine est configuré ✅

### Vérifier
- [ ] J'ai attendu 1-2 heures (propagation DNS)
- [ ] Je suis allé sur `www.mon-domaine.com`
- [ ] Mon application s'affiche !
- [ ] Le domaine fonctionne ✅

---

## 🎉 Félicitations !

- [ ] ✅ Mon application est en ligne sur Render
- [ ] ✅ La base de données fonctionne
- [ ] ✅ Le mot de passe admin est changé
- [ ] ✅ Mon domaine personnalisé est connecté (si applicable)

---

## 📊 Récapitulatif Final

| Élément | Statut | Lien / Info |
|---------|--------|-------------|
| **Compte GitHub** | ☐ Créé | github.com/[username] |
| **Dépôt GitHub** | ☐ Créé | github.com/[username]/dieu-veille-nos-enfants |
| **Compte Render** | ☐ Créé | dashboard.render.com |
| **Base de données** | ☐ Créée | dieu-veille-db (Frankfurt) |
| **Web Service** | ☐ Déployé | dieu-veille-nos-enfants |
| **URL Render** | ☐ Fonctionne | https://dieu-veille-nos-enfants.onrender.com |
| **Domaine perso** | ☐ Connecté | www.mon-domaine.com |
| **Mot de passe admin** | ☐ Changé | [nouveau mot de passe] |

---

## 🔄 Pour les Mises à Jour Futures

Quand je modifie mon code :

- [ ] J'ouvre le Shell Replit
- [ ] Je tape : `git add .`
- [ ] Je tape : `git commit -m "Description"`
- [ ] Je tape : `git push`
- [ ] Render redéploie automatiquement (5-10 min)

---

## 📞 Besoin d'Aide ?

- [ ] J'ai consulté GUIDE-DEBUTANT.md (section "Besoin d'aide")
- [ ] J'ai consulté DEPLOY.md (guide technique)
- [ ] J'ai vérifié les logs sur Render (onglet "Logs")
- [ ] J'ai contacté le support Render

---

**Date de déploiement** : ___________________

**Mon URL finale** : ________________________________________

**Notes personnelles** :
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________
