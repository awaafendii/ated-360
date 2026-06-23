# ATED-360 — Plateforme unifiée (frontend + backend)

Gestion des fermes avicoles et agricoles en Guinée. Ce dépôt regroupe **le frontend React et le backend Express en un seul projet**. En production, le serveur Express sert l'API **et** le frontend compilé — un seul service, un seul port.

```
ated-360/
├── client/        Frontend React (Create React App)
├── server/        Backend Express + PostgreSQL (Prisma)
└── package.json   Scripts coordonnant les deux
```

## Comment l'assemblage fonctionne

- **En développement** : deux serveurs tournent en parallèle. Le client (port 3000) appelle l'API via le **proxy** configuré dans `client/package.json` (`"proxy": "http://localhost:4000"`), donc tous les appels `/api/...` sont redirigés vers le backend sans souci de CORS.
- **En production** : on compile le client (`npm run build`) puis le serveur sert le dossier `client/build/` pour toute route non-`/api`. Le frontend et l'API partagent alors la même origine — voir `server/src/app.js`.

L'authentification repose sur un **JWT** stocké côté navigateur (`localStorage`), envoyé automatiquement dans l'en-tête `Authorization` par la couche `client/src/api/`.

---

## Démarrage rapide (développement)

Prérequis : Node.js ≥ 18, PostgreSQL (ou Docker).

```bash
# 1) Installer les dépendances des deux projets
npm run install:all

# 2) Configurer le backend
cp server/.env.example server/.env
#    éditez server/.env : DATABASE_URL et JWT_SECRET

# 3) Lancer PostgreSQL (option Docker)
docker compose -f server/docker-compose.yml up -d

# 4) Créer les tables + données de démonstration
npm run db:setup

# 5) Lancer frontend + backend ensemble
npm run dev
```

- Frontend : http://localhost:3000
- API : http://localhost:4000/api/health

### Comptes de démonstration (mot de passe `Password123`)
- Producteur : `mariama@ferme.gn`
- Partenaire : `partenaire@credit.gn`

---

## Démarrage en production (un seul serveur)

```bash
npm run install:all
npm run build                 # compile le client -> client/build
cp server/.env.example server/.env   # puis renseigner les vraies valeurs
npm run db:setup              # migrations (+ seed optionnel)
npm start                     # Express sert l'API ET le frontend
```

Tout est alors disponible sur le port du backend (`PORT`, 4000 par défaut) : `http://localhost:4000`.

> Pensez à générer un vrai `JWT_SECRET`, mettre `NODE_ENV=production`, et placer le tout derrière HTTPS.

---

## Modules

| Module | Frontend | API |
|--------|----------|-----|
| Authentification | `pages/AuthPage.js` | `/api/auth/*` |
| Tableau de bord | `pages/DashboardPage.js` | `/api/producers/dashboard` |
| Registre digital | `pages/RegistrePage.js` | `/api/records` |
| Drones & champs | `pages/DronesPage.js` | `/api/drones/*` |
| Alertes | `pages/AlertesPage.js` | `/api/alerts/*` |
| Score producteur | `pages/ScorePage.js` | `/api/score` |
| Espace partenaires | `pages/PartenairesPage.js` | `/api/partners/*` |

La documentation détaillée de l'API (routes, sécurité, moteur de score) est dans `server/README.md`.
