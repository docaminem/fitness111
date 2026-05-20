# Déploiement de l'app IPTV (Firebase + Vercel)

## Étape 1 — Créer un projet Firebase

1. Aller sur [console.firebase.google.com](https://console.firebase.google.com)
2. **Add project** → nommer (ex: `iptv-app`) → continuer
3. **Disable Google Analytics** (optionnel) → **Create project**
4. Attendre ~30 secondes

### Activer l'authentification Email

1. Menu de gauche → **Build** → **Authentication** → **Get started**
2. Onglet **Sign-in method** → **Email/Password** → **Enable** → **Save**

### Créer la base Firestore

1. Menu de gauche → **Build** → **Firestore Database** → **Create database**
2. Choisir **Start in production mode** → **Next**
3. Région : `eur3 (europe-west)` → **Enable**

### Configurer les règles de sécurité

1. Dans **Firestore Database**, onglet **Rules**
2. Coller le contenu de `firestore.rules` (du repo)
3. Cliquer **Publish**

### Récupérer la config Firebase

1. ⚙️ **Project settings** (en haut à gauche, à côté de "Project Overview")
2. Scroller en bas → **Your apps** → cliquer l'icône **`</>`** (Web)
3. Nickname : `iptv-web` → **Register app**
4. Une config apparaît :
```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "iptv-app.firebaseapp.com",
  projectId: "iptv-app",
  storageBucket: "iptv-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123...:web:abc..."
};
```
**Garder cette page ouverte**, on a besoin de ces 6 valeurs.

---

## Étape 2 — Déployer sur Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new) → **Continue with GitHub**
2. Importer le repo `docaminem/fitness111`
3. **Branch** : `claude/iptv-web-app-mdYJE`
4. Framework Preset : **Vite** (auto-détecté)
5. **Environment Variables** → ajouter les 6 variables :

| Name | Value (depuis Firebase) |
|------|------------------------|
| `VITE_FIREBASE_API_KEY` | apiKey |
| `VITE_FIREBASE_AUTH_DOMAIN` | authDomain |
| `VITE_FIREBASE_PROJECT_ID` | projectId |
| `VITE_FIREBASE_STORAGE_BUCKET` | storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId |
| `VITE_FIREBASE_APP_ID` | appId |

6. **Deploy** → attendre 1 min → URL `https://votre-app.vercel.app`

### Autoriser le domaine Vercel dans Firebase

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. **Add domain** → coller `votre-app.vercel.app` → **Add**

---

## Utilisation

1. Ouvrir l'URL Vercel sur iPhone / iPad / Mac
2. **Créer un compte** (email + mdp)
3. **Ajouter une playlist** Xtream (host, port, username, password)
4. Cliquer **Regarder**
5. Sur n'importe quel autre appareil → se connecter avec le même email → vos playlists apparaissent automatiquement

---

## Mode local (sans Firebase)

Si `VITE_FIREBASE_API_KEY` n'est pas défini, l'app fonctionne en mode local : identifiants stockés dans localStorage, pas de multi-appareils.
