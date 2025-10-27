# 🚀 Guide de Déploiement sur Render

Ce guide explique comment déployer "Dieu veille sur nos enfants" sur Render avec PostgreSQL.

## 📋 Prérequis

- Compte GitHub (pour héberger le code)
- Compte Render (gratuit) : https://render.com
- Code poussé sur un repository GitHub

## 🎯 Architecture du Déploiement

```
┌─────────────────────────────────────┐
│   Service Web Render (Node.js)      │
│   - Express Backend (API)           │
│   - Vite Frontend (Static Files)    │
│   - Port: 443 (HTTPS automatique)   │
└──────────────┬──────────────────────┘
               │
               │ DATABASE_URL
               ▼
┌─────────────────────────────────────┐
│   PostgreSQL Database (Render)      │
│   - Tables auto-créées via Drizzle  │
│   - Backups automatiques             │
└─────────────────────────────────────┘
```

---

## 📝 Étape 1 : Préparer le Repository GitHub

### 1.1 Initialiser Git (si pas déjà fait)

```bash
git init
git add .
git commit -m "Initial commit - ready for Render deployment"
```

### 1.2 Créer un repository sur GitHub

1. Allez sur https://github.com/new
2. Créez un nouveau repository (public ou privé)
3. **Ne cochez PAS** "Initialize with README"

### 1.3 Pusher le code

```bash
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
git branch -M main
git push -u origin main
```

---

## 🗄️ Étape 2 : Créer la Base de Données PostgreSQL

### 2.1 Créer la base de données

1. Connectez-vous sur https://dashboard.render.com
2. Cliquez sur **"New +"** → **"PostgreSQL"**
3. Configurez:
   - **Name**: `dieu-veille-db` (ou autre nom)
   - **Database**: `childcare_db`
   - **User**: `childcare_user`
   - **Region**: **Frankfurt** (Europe - plus proche du Gabon)
   - **PostgreSQL Version**: **16**
   - **Plan**: **Free** (expire après 90 jours) ou **Starter $7/mois** (recommandé pour production)

4. Cliquez **"Create Database"**

### 2.2 Copier l'URL de connexion

Après création, vous verrez deux URLs:

- **Internal Database URL** (utilisez celle-ci pour le service web Render)
  ```
  postgresql://childcare_user:xxxxx@dpg-xxxxx/childcare_db
  ```
  ⚠️ **Gardez cette URL secrète !**

---

## 🌐 Étape 3 : Déployer le Service Web

### 3.1 Créer le service

1. Sur Render Dashboard → **"New +"** → **"Web Service"**
2. **Connect your GitHub repository**
3. Sélectionnez votre repository

### 3.2 Configuration du service

Remplissez les champs suivants:

| Champ | Valeur |
|-------|--------|
| **Name** | `dieu-veille-nos-enfants` |
| **Region** | **Frankfurt** (même région que la DB) |
| **Branch** | `main` |
| **Root Directory** | `.` (laisser vide) |
| **Runtime** | **Node** |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | **Free** ou **Starter $7/mois** |

### 3.3 Variables d'environnement

Cliquez **"Advanced"** → **"Add Environment Variable"**

Ajoutez les variables suivantes:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Obligatoire |
| `DATABASE_URL` | *Coller l'Internal Database URL* | Depuis l'étape 2.2 |
| `SESSION_SECRET` | *Générer une clé aléatoire* | Voir ci-dessous ⬇️ |
| `ENABLE_OBJECT_STORAGE` | `false` | Désactivé (base64 storage) |

#### 🔑 Générer SESSION_SECRET

**Option 1 - En ligne de commande:**
```bash
openssl rand -base64 32
```

**Option 2 - En Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3 - Manuellement:**
Utilisez un générateur en ligne: https://generate-secret.vercel.app/32

⚠️ **Important**: Cette clé doit rester secrète et ne JAMAIS être commitée dans Git.

### 3.4 Déployer

Cliquez **"Create Web Service"**

Render va:
1. ✅ Cloner votre repository
2. ✅ Installer les dépendances (`npm install`)
3. ✅ Builder le frontend Vite (`vite build`)
4. ✅ Builder le backend Express (`esbuild`)
5. ✅ Démarrer le serveur (`npm start`)

⏱️ Le premier build prend **5-10 minutes**.

---

## 🔧 Étape 4 : Initialiser la Base de Données

### 4.1 Exécuter la migration

Une fois le service déployé, vous devez initialiser le schéma de base de données.

**Option 1 - Via Render Shell (Recommandé):**

1. Dans votre service web → Onglet **"Shell"**
2. Cliquez **"Launch shell"**
3. Exécutez:
   ```bash
   npm run db:migrate
   ```

**Option 2 - Localement (avec DATABASE_URL de Render):**

```bash
# Dans votre terminal local
export DATABASE_URL="postgresql://childcare_user:xxxxx@dpg-xxxxx/childcare_db"
npm run db:migrate
```

### 4.2 Vérifier les tables

Dans le shell Render, connectez-vous à PostgreSQL:

```bash
psql $DATABASE_URL
```

Listez les tables:

```sql
\dt

-- Vous devriez voir:
-- parent_requests
-- nanny_applications
-- contact_messages
-- payments
-- admin_users
-- notifications
-- prestations
-- parametres_site
-- employees
-- paiements_employes
-- payment_configs
-- session
```

Quittez avec:
```
\q
```

---

## ✅ Étape 5 : Tester l'Application

### 5.1 Accéder à l'application

Votre URL Render sera:
```
https://dieu-veille-nos-enfants.onrender.com
```

### 5.2 Connexion Admin

1. Allez sur `/admin/login`
2. Connectez-vous avec:
   - **Username**: `admin`
   - **Password**: `admin123`

⚠️ **IMPORTANT**: Changez ce mot de passe immédiatement après la première connexion!

### 5.3 Test complet

1. ✅ Page d'accueil se charge
2. ✅ Formulaires parents/nounous fonctionnent
3. ✅ Admin login fonctionne
4. ✅ Dashboard admin affiche les données

---

## 🔄 Étape 6 : Mises à Jour Automatiques

### 6.1 Auto-redéploiement

Render redéploie automatiquement à chaque push Git:

```bash
git add .
git commit -m "Update feature X"
git push origin main
```

⏱️ Render détecte le push et redéploie (3-5 minutes).

### 6.2 Logs en temps réel

Surveillez le déploiement:
1. Render Dashboard → Votre service
2. Onglet **"Logs"**
3. Vous verrez:
   ```
   Nov 20 02:45:12 PM  ==> Building...
   Nov 20 02:47:30 PM  ==> Build successful
   Nov 20 02:47:45 PM  ==> Deploying...
   Nov 20 02:48:00 PM  serving on port 10000
   ```

---

## 🔐 Sécurité & Production

### ✅ Checklist de sécurité

- [ ] SESSION_SECRET changé (pas le défaut)
- [ ] Mot de passe admin changé
- [ ] DATABASE_URL jamais commitée dans Git
- [ ] Variables d'environnement dans Render (pas .env)
- [ ] HTTPS activé (automatique sur Render)
- [ ] PostgreSQL accessible uniquement par Render (Internal URL)

### 🛡️ Recommandations

1. **Plan payant recommandé pour production:**
   - Web Service: Starter ($7/mois) - Pas de sleep après inactivité
   - PostgreSQL: Starter ($7/mois) - Pas d'expiration, backups inclus

2. **Backups automatiques:**
   - PostgreSQL Starter inclut des backups quotidiens
   - Restoration en 1 clic depuis le dashboard

3. **Domaine personnalisé:**
   - Render Dashboard → Votre service → **"Settings"** → **"Custom Domain"**
   - Ajouter `www.dieuveille.ga` (exemple)
   - Configurer DNS: `CNAME` → `dieu-veille-nos-enfants.onrender.com`

---

## 🐛 Dépannage

### Problème: "Application Error" ou 502

**Causes possibles:**
- ❌ Build a échoué → Vérifiez les logs de build
- ❌ DATABASE_URL incorrect → Vérifiez dans Environment Variables
- ❌ Migration non exécutée → Lancez `npm run db:migrate`

**Solution:**
```bash
# Dans Render Shell
npm run db:migrate
```

Puis redémarrez le service:
```bash
# Render Dashboard → Service → "Manual Deploy" → "Clear build cache & deploy"
```

---

### Problème: Session ne persiste pas (logout automatique)

**Cause:** SESSION_SECRET non défini ou changé.

**Solution:**
1. Render Dashboard → Service → **"Environment"**
2. Vérifiez que `SESSION_SECRET` existe et n'est pas vide
3. Redéployez le service

---

### Problème: Base de données vide après déploiement

**Cause:** Migration non exécutée.

**Solution:**
```bash
# Shell Render
npm run db:migrate

# Vérifier les tables
psql $DATABASE_URL -c "\dt"
```

---

### Problème: Free tier PostgreSQL va expirer (90 jours)

**Solutions:**

1. **Upgrade vers Starter ($7/mois):**
   - Render Dashboard → Database → **"Upgrade"**
   - Pas besoin de migration, URL reste la même

2. **Créer une nouvelle DB gratuite (temporaire):**
   - Créer nouvelle PostgreSQL free
   - Copier nouvelle DATABASE_URL
   - Mettre à jour dans le service web
   - Relancer `npm run db:migrate`

---

## 📊 Monitoring

### Métriques disponibles (plan payant)

- **CPU Usage**
- **Memory Usage**
- **Request Count**
- **Response Time**

Accès: Render Dashboard → Service → **"Metrics"**

### Health Checks

Render ping automatiquement `/` toutes les 5 minutes.

Si le service ne répond pas → Auto-restart.

---

## 💰 Coûts Estimés

| Plan | Prix | Limites |
|------|------|---------|
| **Free Tier** | $0 | - Web service sleep après 15min inactivité<br>- DB expire après 90 jours<br>- 750h/mois |
| **Production (Recommandé)** | $14/mois | - Web Service Starter: $7/mois (pas de sleep)<br>- PostgreSQL Starter: $7/mois (backups, illimité) |

---

## 🎉 C'est Terminé !

Votre application est maintenant en ligne sur:
```
https://dieu-veille-nos-enfants.onrender.com
```

### Prochaines étapes

1. ✅ Tester toutes les fonctionnalités
2. ✅ Changer le mot de passe admin
3. ✅ Configurer un domaine personnalisé (optionnel)
4. ✅ Activer les backups automatiques (plan payant)
5. ✅ Intégrer les moyens de paiement (Airtel Money, Moov Money)

---

## 📞 Support

- **Documentation Render:** https://render.com/docs
- **Support Render:** https://render.com/support
- **Status Page:** https://status.render.com

---

**Bon déploiement! 🚀**
