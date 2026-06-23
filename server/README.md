# ATED-360 — Backend (API REST)

API de la plateforme **ATED-360**, dédiée à la gestion des fermes avicoles et agricoles en Guinée : registre digital, alertes automatiques, score producteur, missions drone et espace partenaires.

Stack : **Node.js + Express + PostgreSQL (Prisma)**, authentification **JWT**, validation **Zod**.

---

## 1. Prérequis

- Node.js ≥ 18
- PostgreSQL ≥ 14 (ou Docker pour le lancer en une commande)

## 2. Installation

```bash
# 1) Installer les dépendances
npm install

# 2) Configurer l'environnement
cp .env.example .env
#   puis éditez .env : DATABASE_URL et surtout JWT_SECRET

# 3) (Option) Lancer PostgreSQL via Docker
docker compose up -d

# 4) Créer les tables (migrations) + générer le client Prisma
npm run prisma:migrate

# 5) Charger les données de démonstration
npm run db:seed

# 6) Démarrer en développement (rechargement auto)
npm run dev
```

L'API écoute alors sur `http://localhost:4000`. Vérifiez : `GET /api/health`.

### Comptes de démonstration (mot de passe `Password123`)
- **Producteur** : `mariama@ferme.gn`
- **Partenaire** : `partenaire@credit.gn`

---

## 3. Architecture

Organisation en couches, un dossier par domaine métier :

```
src/
  config/        env (validé au démarrage) + client Prisma singleton
  middlewares/   auth (JWT + rôles), validation Zod, gestion d'erreurs
  utils/         AppError, asyncHandler, jwt, réponses standardisées
  modules/
    auth/        inscription, connexion, profil
    producers/   profil ferme + tableau de bord agrégé
    records/     registre digital (+ alertes automatiques)
    alerts/      alertes (liste, résumé, résolution)
    score/       moteur de calcul du Score Producteur
    drones/      missions + génération de rapports
    partners/    vue agrégée réseau (réservée aux partenaires)
  app.js         assemblage Express (sécurité + routes)
  server.js      démarrage + arrêt propre
prisma/
  schema.prisma  modèle de données
  seed.js        données de démonstration
```

Chaque module suit le même découpage : `*.routes.js` → `*.controller`/handlers → `*.service.js` (logique métier) → Prisma. Les schémas Zod (`*.schema.js`) valident les entrées avant d'atteindre la logique.

---

## 4. Sécurité

- Mots de passe hachés avec **bcrypt** (coût configurable).
- **JWT** signés, durée de vie configurable ; vérifiés à chaque requête protégée.
- Autorisation **par rôle** (`PRODUCTEUR` / `PARTENAIRE`) : un partenaire ne voit jamais le registre d'un producteur, un producteur n'accède pas à l'espace partenaire.
- Chaque ressource est filtrée par propriétaire (un producteur n'accède qu'à ses propres données).
- **helmet** (en-têtes HTTP), **CORS** restreint aux origines déclarées, **rate limiting** global et renforcé sur l'authentification.
- Validation stricte de toutes les entrées ; erreurs renvoyées dans un format uniforme.

---

## 5. Format des réponses

Succès :
```json
{ "success": true, "data": { ... }, "meta": { ...pagination } }
```
Erreur :
```json
{ "success": false, "error": { "message": "...", "details": [ ... ] } }
```

---

## 6. Référence des routes

Toutes préfixées par `/api`. 🔒 = authentification requise.

### Auth
| Méthode | Route | Rôle | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | — | Créer un compte (producteur ou partenaire) |
| POST | `/auth/login` | — | Se connecter, reçoit un token |
| GET | `/auth/me` | 🔒 | Profil de l'utilisateur connecté |

### Producteur
| Méthode | Route | Rôle | Description |
|--------|-------|------|-------------|
| GET | `/producers/dashboard` | 🔒 Producteur | Statistiques agrégées du tableau de bord |
| PATCH | `/producers/profile` | 🔒 Producteur | Mettre à jour zone, type, effectifs, surface |

### Registre digital
| Méthode | Route | Rôle | Description |
|--------|-------|------|-------------|
| POST | `/records` | 🔒 Producteur | Enregistrer une activité (avicole/agricole) |
| GET | `/records` | 🔒 Producteur | Historique paginé et filtrable (`type`, `farmType`) |
| GET | `/records/:id` | 🔒 Producteur | Détail d'une activité |
| DELETE | `/records/:id` | 🔒 Producteur | Supprimer une activité |

### Alertes
| Méthode | Route | Rôle | Description |
|--------|-------|------|-------------|
| GET | `/alerts` | 🔒 Producteur | Liste (filtres `priority`, `resolved`) |
| GET | `/alerts/summary` | 🔒 Producteur | Décompte par priorité |
| POST | `/alerts` | 🔒 Producteur | Créer une alerte manuelle |
| PATCH | `/alerts/:id/resolve` | 🔒 Producteur | Marquer comme traitée |

### Score
| Méthode | Route | Rôle | Description |
|--------|-------|------|-------------|
| GET | `/score?farmType=AVICOLE\|AGRICOLE` | 🔒 Producteur | Score courant + détail des critères |
| POST | `/score/snapshot` | 🔒 Producteur | Recalcule et archive un instantané |
| GET | `/score/history` | 🔒 Producteur | Historique des scores |

### Drones
| Méthode | Route | Rôle | Description |
|--------|-------|------|-------------|
| POST | `/drones/missions` | 🔒 Producteur | Demander un survol |
| GET | `/drones/missions` | 🔒 Producteur | Lister ses missions (+ rapports) |
| GET | `/drones/missions/:id` | 🔒 Producteur | Détail d'une mission |
| PATCH | `/drones/missions/:id/status` | 🔒 Producteur | Faire évoluer le statut |
| POST | `/drones/missions/:id/report` | 🔒 Producteur | Générer le rapport agronomique |

### Partenaires
| Méthode | Route | Rôle | Description |
|--------|-------|------|-------------|
| GET | `/partners/summary` | 🔒 Partenaire | Indicateurs agrégés du réseau |
| GET | `/partners/producers` | 🔒 Partenaire | Portefeuille avec scores (filtres `zone`, `search`) |
| GET | `/partners/producers/:id` | 🔒 Partenaire | Fiche détaillée d'un producteur |

---

## 7. Le moteur de Score

Le score combine des critères communs (régularité des enregistrements, santé financière) et des critères propres à la filière :
- **Avicole** : biosécurité, vaccination des volailles, hygiène & climat du poulailler, rendement.
- **Agricole** : santé du champ, fertilité du sol, gestion de l'eau & climat, rendement à l'hectare.

Les valeurs s'appuient sur les données réelles saisies (fréquence des activités, vaccinations, rendements) et, pour le volet agricole, sur les rapports drone disponibles. Le score global est la moyenne des critères, sur 100. Voir `src/modules/score/score.service.js` — la logique y est isolée et facile à ajuster.

---

## 8. Brancher le frontend React

Le frontend appelle l'API avec le token JWT dans l'en-tête `Authorization: Bearer <token>`. Exemple minimal :

```js
const API = "http://localhost:4000/api";

async function login(email, password) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const { data } = await r.json();
  localStorage.setItem("token", data.token); // ou état applicatif
  return data.user;
}

async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const r = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return r.json();
}
```

Pensez à ajouter l'URL du frontend dans `CORS_ORIGIN` (`.env`).

---

## 9. Déploiement (production)

```bash
npm ci
npm run prisma:deploy   # applique les migrations sans prompt
npm run db:seed         # facultatif
npm start
```

À faire impérativement avant la mise en production :
- générer un vrai `JWT_SECRET` (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) ;
- `NODE_ENV=production` ;
- placer l'API derrière HTTPS (reverse proxy) ;
- restreindre `CORS_ORIGIN` à l'URL réelle du frontend.
```
