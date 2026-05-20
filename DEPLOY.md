# Déploiement de l'app IPTV

## Étape 1 — Créer un projet Supabase (gratuit)

1. Aller sur [supabase.com](https://supabase.com) → **Start your project**
2. Créer un compte et un nouveau projet
3. Choisir un nom, un mot de passe (pour la DB) et une région proche (Europe West)
4. Attendre ~2 minutes que le projet soit prêt

### Créer la base de données

1. Dans le tableau de bord Supabase, aller dans **SQL Editor** → **New query**
2. Copier/coller le contenu de `supabase-schema.sql`
3. Cliquer **Run** (▶)

### Activer l'authentification email

1. **Authentication** → **Providers** → **Email** : activer "Enable Email provider"
2. Pour les tests, désactiver "Confirm email" (ou configurer SMTP pour l'envoyer)
3. **Authentication** → **URL Configuration** → ajouter votre domaine Vercel

### Récupérer les clés API

1. **Settings** → **API**
2. Copier :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

## Étape 2 — Déployer sur Vercel (gratuit)

1. Aller sur [vercel.com](https://vercel.com) → **Sign up with GitHub**
2. **Add New Project** → importer le dépôt `docaminem/fitness111`
3. Dans **Environment Variables**, ajouter :
   - `VITE_SUPABASE_URL` = votre Project URL
   - `VITE_SUPABASE_ANON_KEY` = votre anon key
4. Framework Preset : **Vite**
5. Cliquer **Deploy** 🚀

Vercel vous donnera une URL type `https://votre-app.vercel.app`

---

## Utilisation

1. Ouvrir l'app → page de connexion
2. **Créer un compte** avec votre email
3. **Ajouter une playlist** : entrer les identifiants Xtream (host, port, username, password)
4. Cliquer **Regarder** pour vous connecter à la playlist
5. Depuis n'importe quel appareil : se connecter avec le même email/mdp → toutes vos playlists sont disponibles

---

## Mode local (sans Supabase)

Si `VITE_SUPABASE_URL` n'est pas défini, l'app fonctionne en mode local :
- Les identifiants Xtream sont stockés dans localStorage
- Pas de compte cloud, pas de multi-appareils
- Utiliser `/login` pour entrer les identifiants Xtream

---

## Variables d'environnement requises

```
VITE_SUPABASE_URL=https://XXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

Copier `.env.example` → `.env.local` pour les tests locaux.
