# 🚀 Guide Débutant - Mettre Votre Application En Ligne

## 👋 Bienvenue !

Ce guide va vous aider à mettre votre application "Dieu veille sur nos enfants" en ligne sur **Render**, étape par étape, avec des mots simples.

**Temps total estimé : 40-60 minutes**

---

## 📚 Table des Matières

1. [Préparation](#étape-1--préparation-5-minutes)
2. [Créer un compte GitHub](#étape-2--créer-un-compte-github-5-minutes)
3. [Mettre votre code sur GitHub](#étape-3--mettre-votre-code-sur-github-15-minutes)
4. [Créer un compte Render](#étape-4--créer-un-compte-render-5-minutes)
5. [Créer la base de données](#étape-5--créer-la-base-de-données-10-minutes)
6. [Déployer l'application](#étape-6--déployer-lapplication-15-minutes)
7. [Initialiser la base de données](#étape-7--initialiser-la-base-de-données-10-minutes)
8. [Tester votre application](#étape-8--tester-votre-application-5-minutes)
9. [Connecter votre domaine Hostinger](#étape-9--connecter-votre-domaine-hostinger-15-minutes)

---

## 🎯 Étape 1 : Préparation (5 minutes)

### Ce dont vous avez besoin :

✅ Un ordinateur avec connexion Internet  
✅ Une adresse email valide  
✅ Le code de votre application (déjà sur Replit)  
✅ Une carte bancaire (pour Render - gratuit 90 jours, puis 14$/mois)  
✅ Votre domaine Hostinger (vous l'ajouterez à la fin)

### Ouvrez ces 3 fichiers dans Replit :

1. **COMMANDES.txt** → Vous copierez-collerez des commandes depuis ce fichier
2. **CHECKLIST.md** → Pour suivre votre progression
3. **Ce guide (GUIDE-DEBUTANT.md)** → Pour les instructions

---

## 🐙 Étape 2 : Créer un Compte GitHub (5 minutes)

### C'est quoi GitHub ?

**GitHub** = Un site qui stocke votre code en ligne

**Analogie** : C'est comme Google Drive, mais spécialisé pour du code. Render va chercher votre code sur GitHub pour le mettre en ligne.

### Instructions :

1. **Allez sur** : [https://github.com](https://github.com)

2. **Cliquez sur** : Le bouton vert **"Sign up"** (en haut à droite)

3. **Remplissez le formulaire** :
   - Email : Votre adresse email
   - Password : Un mot de passe sécurisé (8+ caractères)
   - Username : Choisissez un nom d'utilisateur (exemple : `dieuveille`)

4. **Vérification** : 
   - GitHub va vous envoyer un code par email
   - Copiez ce code et collez-le dans la page

5. **Questions** :
   - "How many team members..." → Choisissez **"Just me"**
   - "What do you want to do..." → Cliquez **"Skip"**

6. **Plan** :
   - Choisissez **"Free"** (gratuit)

✅ **Votre compte GitHub est créé !**

---

## 📤 Étape 3 : Mettre Votre Code sur GitHub (15 minutes)

### C'est quoi cette étape ?

Vous allez **copier** tout le code de Replit vers GitHub. C'est comme faire un backup de votre projet sur un autre site.

### 🔧 Sous-étape 3A : Créer un Dépôt GitHub

**Dépôt (repository)** = Un dossier sur GitHub où sera stocké votre code

1. **Sur GitHub**, cliquez sur le **"+"** en haut à droite
2. Cliquez sur **"New repository"**
3. **Remplissez** :
   - Repository name : `dieu-veille-nos-enfants`
   - Description : `Application de garde d'enfants pour le Gabon`
   - **IMPORTANT** : Cochez **"Private"** (votre code restera privé)
   - **NE COCHEZ PAS** "Add a README file"
4. Cliquez sur **"Create repository"**

✅ **Votre dépôt est créé !**

### 🔧 Sous-étape 3B : Obtenir un Token GitHub

**Token** = Un mot de passe spécial pour que Replit puisse envoyer le code vers GitHub

1. **Sur GitHub**, cliquez sur votre **photo de profil** (en haut à droite)
2. Cliquez sur **"Settings"** (Paramètres)
3. Dans le menu de gauche, **scrollez tout en bas**
4. Cliquez sur **"Developer settings"**
5. Cliquez sur **"Personal access tokens"** → **"Tokens (classic)"**
6. Cliquez sur **"Generate new token"** → **"Generate new token (classic)"**
7. **Remplissez** :
   - Note : `Token pour Replit`
   - Expiration : **90 days** (ou "No expiration" si vous préférez)
   - **Cochez UNIQUEMENT la case** : ☑️ **repo** (toutes les sous-cases se cocheront automatiquement)
8. **Scrollez en bas** et cliquez sur **"Generate token"**

9. ⚠️ **IMPORTANT** : 
   - Une page s'affiche avec un code comme : `ghp_xxxxxxxxxxxxxxxxxxxx`
   - **COPIEZ CE CODE IMMÉDIATEMENT** (il ne sera plus visible après !)
   - **Collez-le dans un fichier texte** sur votre ordinateur pour le sauvegarder

✅ **Votre token est créé !**

### 🔧 Sous-étape 3C : Envoyer le Code de Replit vers GitHub

**Maintenant on va utiliser des commandes** dans Replit pour envoyer le code vers GitHub.

1. **Dans Replit**, ouvrez le fichier **COMMANDES.txt**

2. **Ouvrez le Shell Replit** :
   - Cliquez sur l'onglet **"Shell"** (en bas de l'écran)
   - Vous verrez un écran noir avec du texte vert

3. **Suivez les commandes dans COMMANDES.txt** :
   - Section **"PARTIE 1 : ENVOYER LE CODE SUR GITHUB"**
   - Copiez la première commande
   - Collez-la dans le Shell (clic droit → Paste)
   - Appuyez sur **Entrée**
   - Répétez pour chaque commande

4. **Quand on vous demande votre mot de passe GitHub** :
   - ⚠️ NE TAPEZ PAS votre mot de passe normal !
   - **COLLEZ VOTRE TOKEN** (le code `ghp_xxxx` que vous avez copié)
   - Appuyez sur Entrée

✅ **Votre code est maintenant sur GitHub !**

### 🔍 Vérifier que ça a marché :

1. Allez sur GitHub
2. Allez dans votre dépôt `dieu-veille-nos-enfants`
3. Vous devriez voir tous vos fichiers !

---

## 🎨 Étape 4 : Créer un Compte Render (5 minutes)

### C'est quoi Render ?

**Render** = Le serveur qui va faire tourner votre application 24h/24

**Analogie** : C'est comme louer un ordinateur sur Internet qui fait tourner votre site web en permanence.

### Instructions :

1. **Allez sur** : [https://render.com](https://render.com)

2. **Cliquez sur** : **"Get Started"** ou **"Sign Up"**

3. **Connectez-vous avec GitHub** :
   - Cliquez sur **"Sign up with GitHub"**
   - GitHub va demander la permission → Cliquez **"Authorize Render"**

4. **Informations** :
   - Nom : Votre nom
   - Company : Laissez vide (ou mettez "Personnel")
   - Cliquez **"Complete Sign Up"**

✅ **Votre compte Render est créé !**

---

## 🗄️ Étape 5 : Créer la Base de Données (10 minutes)

### C'est quoi une base de données ?

**Base de données** = L'endroit où sont stockées toutes les informations de votre application (demandes de garde, candidatures, etc.)

**Analogie** : C'est comme un classeur Excel géant qui stocke toutes vos données.

### Instructions :

1. **Sur Render Dashboard**, cliquez sur **"New +"** (en haut à droite)

2. Cliquez sur **"PostgreSQL"**

3. **Remplissez** :
   - Name : `dieu-veille-db`
   - Database : `dieu_veille` (se remplit automatiquement)
   - User : `dieu_veille_user` (se remplit automatiquement)
   - Region : **Frankfurt (EU Central)** ⚠️ IMPORTANT : Choisissez Frankfurt !
   - PostgreSQL Version : **16**
   - Plan : **Free** (pour tester) ou **Starter** (7$/mois pour production)

4. Cliquez sur **"Create Database"**

5. **Attendez** : La base de données va se créer (2-3 minutes)
   - Le statut va passer de "Creating" à "Available"

6. ⚠️ **IMPORTANT : Copiez l'URL de connexion** :
   - Une fois créée, vous verrez **"Internal Database URL"**
   - Cliquez sur **"Copy"** (l'icône à côté)
   - **Collez cette URL dans un fichier texte** sur votre ordinateur
   - Elle ressemble à : `postgresql://user:password@host/database`

✅ **Votre base de données est créée !**

---

## 🚀 Étape 6 : Déployer l'Application (15 minutes)

### C'est quoi déployer ?

**Déployer** = Mettre votre application en ligne pour qu'elle soit accessible sur Internet

### Instructions :

1. **Sur Render Dashboard**, cliquez sur **"New +"** → **"Web Service"**

2. **Connectez votre dépôt GitHub** :
   - Si c'est la première fois, cliquez **"Configure account"**
   - Autorisez Render à accéder à votre compte GitHub
   - **Choisissez** : "Only select repositories"
   - Sélectionnez **`dieu-veille-nos-enfants`**
   - Cliquez **"Install"**

3. **Sélectionnez votre dépôt** :
   - Vous verrez `dieu-veille-nos-enfants`
   - Cliquez sur **"Connect"**

4. **Configuration du service** :

   | Champ | Valeur |
   |-------|--------|
   | **Name** | `dieu-veille-nos-enfants` |
   | **Region** | **Frankfurt (EU Central)** ⚠️ Même région que la base de données ! |
   | **Branch** | `main` (ou `master`) |
   | **Root Directory** | Laissez vide |
   | **Runtime** | **Node** |
   | **Build Command** | `npm install && npm run build` |
   | **Start Command** | `npm start` |
   | **Plan** | **Free** (pour tester) ou **Starter** (7$/mois pour production) |

5. **Variables d'environnement** :
   
   Cliquez sur **"Advanced"** puis **"Add Environment Variable"**
   
   **Ajoutez ces 3 variables** :

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Collez l'URL de votre base de données (copiée à l'étape 5) |
   | `SESSION_SECRET` | Allez dans COMMANDES.txt, copiez le secret généré |

   **Pour générer SESSION_SECRET** :
   - Ouvrez **COMMANDES.txt**
   - Section **"PARTIE 2 : GÉNÉRER SESSION_SECRET"**
   - Copiez la commande, collez-la dans le Shell Replit
   - Copiez le résultat (une longue chaîne de caractères)
   - Collez-le dans la valeur de `SESSION_SECRET` sur Render

6. **Cliquez sur** : **"Create Web Service"**

7. **Attendez le déploiement** :
   - Render va installer votre application (5-10 minutes)
   - Vous verrez des logs défiler
   - Le statut passera de "Building" → "Deploying" → "Live"

✅ **Votre application est en ligne !** (mais la base de données est vide)

---

## 🗃️ Étape 7 : Initialiser la Base de Données (10 minutes)

### C'est quoi cette étape ?

Votre application est en ligne, mais la base de données est vide. Il faut **créer les tables** (les "feuilles Excel" pour stocker vos données).

### Instructions :

1. **Sur la page de votre Web Service** (dieu-veille-nos-enfants sur Render)

2. **Cliquez sur** : **"Shell"** (dans le menu de gauche)
   - Un terminal va s'ouvrir (écran noir)

3. **Tapez cette commande** :
   ```bash
   npm run db:migrate
   ```

4. **Appuyez sur Entrée**

5. **Attendez** : Vous verrez :
   ```
   ✅ Database migration complete!
   
   📊 Tables created:
   - admin_users
   - parent_requests
   - nanny_applications
   - employees
   - paiements_employes
   - payment_configs
   - ... (et autres)
   ```

6. **Compte administrateur par défaut** :
   - Username : `admin`
   - Password : `admin123`
   - ⚠️ **CHANGEZ CE MOT DE PASSE** dès que vous vous connectez !

✅ **La base de données est initialisée !**

---

## ✅ Étape 8 : Tester Votre Application (5 minutes)

### Instructions :

1. **Sur Render**, en haut de la page de votre service, vous verrez :
   ```
   https://dieu-veille-nos-enfants.onrender.com
   ```

2. **Cliquez sur ce lien** → Votre application s'ouvre !

3. **Testez** :
   - ✅ La page d'accueil s'affiche
   - ✅ Les formulaires fonctionnent
   - ✅ Vous pouvez vous connecter en admin (admin/admin123)
   - ✅ Le tableau de bord admin s'affiche

4. **⚠️ IMPORTANT : Changez le mot de passe admin** :
   - Connectez-vous avec admin/admin123
   - Allez dans **Profil**
   - Cliquez sur **Modifier**
   - Changez le mot de passe
   - Sauvegardez

✅ **Votre application fonctionne !**

---

## 🌐 Étape 9 : Connecter Votre Domaine Hostinger (15 minutes)

### C'est quoi cette étape ?

Au lieu d'utiliser `dieu-veille-nos-enfants.onrender.com`, vous allez utiliser **votre propre nom de domaine** (exemple : `www.dieuveille.com`).

### Pré-requis :

- Vous devez avoir **acheté un domaine** chez Hostinger
- Exemple : `dieuveille.com` ou `dieuveille-gabon.com`

### Instructions :

#### 🔧 Partie A : Sur Render

1. **Sur Render**, allez dans votre Web Service `dieu-veille-nos-enfants`

2. **Cliquez sur** : **"Settings"** (dans le menu de gauche)

3. **Scrollez jusqu'à** : **"Custom Domain"**

4. **Cliquez sur** : **"Add Custom Domain"**

5. **Tapez votre domaine** :
   - Si votre domaine est `dieuveille.com`, tapez : `www.dieuveille.com`
   - Cliquez **"Save"**

6. **Notez les valeurs affichées** :
   - Render va afficher quelque chose comme :
   ```
   Type: CNAME
   Name: www
   Value: dieu-veille-nos-enfants.onrender.com
   ```
   - **Copiez ces valeurs** dans un fichier texte

#### 🔧 Partie B : Sur Hostinger

1. **Connectez-vous à Hostinger** : [https://www.hostinger.fr](https://www.hostinger.fr)

2. **Allez dans** : **"Domaines"** → Cliquez sur votre domaine

3. **Cliquez sur** : **"DNS / Serveurs de noms"**

4. **Ajoutez un enregistrement CNAME** :
   - Cliquez sur **"Ajouter un enregistrement"**
   - Type : **CNAME**
   - Name : **www**
   - Target : **dieu-veille-nos-enfants.onrender.com**
   - TTL : **3600** (ou laissez par défaut)
   - Cliquez **"Ajouter"**

5. **Ajoutez un enregistrement A (pour le domaine sans www)** :
   - Cliquez sur **"Ajouter un enregistrement"**
   - Type : **A**
   - Name : **@** (ou laissez vide)
   - Target : **Retournez sur Render** → Settings → Custom Domain → Cliquez sur "Add" à côté de votre domaine → Render vous donnera une IP
   - Copiez cette IP et collez-la dans Target sur Hostinger
   - Cliquez **"Ajouter"**

6. **Attendez** : La propagation DNS prend **15 minutes à 24 heures**
   - En général : 1-2 heures

7. **Vérifiez** :
   - Allez sur `www.votre-domaine.com`
   - Votre application devrait s'afficher !

✅ **Votre domaine personnalisé est connecté !**

---

## 🎉 Félicitations !

Votre application **"Dieu veille sur nos enfants"** est maintenant en ligne et accessible sur Internet !

### 📊 Récapitulatif :

- ✅ Code sur GitHub
- ✅ Base de données PostgreSQL sur Render
- ✅ Application déployée sur Render
- ✅ Domaine personnalisé connecté
- ✅ Application accessible 24h/24

---

## 🆘 Besoin d'Aide ?

### Erreurs Courantes :

#### ❌ "Build failed" sur Render
**Solution** : 
- Vérifiez que les variables d'environnement sont bien renseignées
- Relancez le déploiement : Cliquez sur "Manual Deploy" → "Deploy latest commit"

#### ❌ "Database connection failed"
**Solution** :
- Vérifiez que DATABASE_URL est correctement copiée
- Vérifiez que la base de données et le service web sont dans la **même région** (Frankfurt)

#### ❌ "npm run db:migrate" ne fonctionne pas
**Solution** :
- Vérifiez que DATABASE_URL est définie dans les variables d'environnement
- Essayez : `npm run db:push --force`

#### ❌ Mon domaine ne fonctionne pas
**Solution** :
- Attendez 24h (propagation DNS)
- Vérifiez que les enregistrements CNAME et A sont corrects
- Utilisez [whatsmydns.net](https://www.whatsmydns.net) pour vérifier la propagation

---

## 📞 Support

Si vous êtes bloqué :

1. **Relisez le guide calmement**
2. **Vérifiez la CHECKLIST.md**
3. **Consultez DEPLOY.md** (guide technique détaillé)
4. **Contactez le support Render** : [https://render.com/docs](https://render.com/docs)

---

## 🔄 Mises à Jour Futures

Quand vous modifiez votre code dans Replit :

1. Ouvrez le Shell Replit
2. Tapez ces 3 commandes :
   ```bash
   git add .
   git commit -m "Description de vos changements"
   git push
   ```
3. Render va **automatiquement redéployer** votre application !

---

**Bonne chance ! 🚀**
