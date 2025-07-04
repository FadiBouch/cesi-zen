# CESI Zen 🧘‍♀️

Une application complète de méditation et de bien-être avec exercices de respiration et contenu éducatif.

## 🏗️ Architecture

Ce projet est composé de 3 applications principales :

- **API** : Backend Node.js avec Express, Prisma et PostgreSQL
- **Web** : Interface d'administration React avec Vite et TailwindCSS
- **Mobile** : Application React Native avec Expo

## 🚀 Démarrage rapide

### Prérequis

- Docker et Docker Compose
- Node.js 18+ (pour le développement local)
- npm ou yarn

### Installation

1. Cloner le projet
```bash
git clone <repository-url>
cd cesi-zen
```

2. Lancer l'environnement de développement
```bash
docker-compose up -d
```

3. Accéder aux applications :
   - **Web Admin** : http://localhost
   - **API** : http://localhost:3000
   - **Base de données** : localhost:21501

## 📦 Images Docker

Les images Docker sont disponibles sur GitHub Container Registry :

### Télécharger les images
```bash
# Image API
docker pull ghcr.io/fadibouch/cesi-zen/cesi-zen-api:develop

# Image Web
docker pull ghcr.io/fadibouch/cesi-zen/cesi-zen-web:develop
```

### Build des images en local
```bash
# Build de l'API
docker build -t cesi-zen-api ./api

# Build de l'interface Web
docker build -t cesi-zen-web ./web
```

## 📱 Applications

### API Backend

**Technologies** : Node.js, Express, Prisma, PostgreSQL, JWT, Bcrypt

**Fonctionnalités** :
- Authentification JWT avec gestion des rôles
- CRUD pour les utilisateurs, exercices de respiration et contenus
- Base de données PostgreSQL avec Prisma ORM
- Tests automatisés avec Jest
- Sécurité avec Helmet et rate limiting

**Scripts disponibles** :
```bash
cd api
npm run dev        # Démarrage en mode développement
npm run test       # Tests unitaires
npm run test:coverage # Tests avec couverture
```

### Web Admin

**Technologies** : React, TypeScript, Vite, TailwindCSS, Clerk

**Fonctionnalités** :
- Interface d'administration responsive
- Gestion des utilisateurs et rôles
- Gestion des contenus et catégories
- Authentification avec Clerk
- Dashboard avec statistiques

**Scripts disponibles** :
```bash
cd web
npm run dev        # Démarrage en mode développement
npm run build      # Build de production
npm run lint       # Linting du code
```

### Mobile App

**Technologies** : React Native, Expo, TypeScript

**Fonctionnalités** :
- Exercices de respiration interactifs
- Contenu éducatif avec Markdown
- Authentification utilisateur
- Interface intuitive et responsive
- Navigation avec Expo Router

**Scripts disponibles** :
```bash
cd mobile
npm start          # Démarrage d'Expo
npm run android    # Lancement sur Android
npm run ios        # Lancement sur iOS
npm run web        # Lancement sur web
```

## 🗄️ Base de données

### Modèles principaux

- **Users** : Utilisateurs avec rôles et authentification
- **BreathingExerciseType** : Types d'exercices de respiration
- **BreathingExerciseConfiguration** : Configurations personnalisées
- **ContentCategory** : Catégories de contenu
- **Content** : Articles et contenus éducatifs

### Migration

```bash
cd api
npx prisma migrate dev
npx prisma generate
```

## 🐳 Docker

### Environnements disponibles

- `docker-compose.yml` : Développement
- `docker-compose.prod.yml` : Production  
- `docker-compose.test.yml` : Tests

### Services

- **db** : PostgreSQL 
- **api** : API Node.js
- **web** : Interface React
- **api_test_runner** : Tests automatisés

## 🔧 CI/CD

Pipeline GitHub Actions avec :
- Tests automatisés
- Build et push des images Docker vers GHCR
- Déploiement sur serveur distant
- Gestion des environnements (test/prod)

### Images disponibles
- `ghcr.io/fadibouch/cesi-zen/cesi-zen-api:develop`
- `ghcr.io/fadibouch/cesi-zen/cesi-zen-web:develop`

## 🛡️ Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Rate limiting sur l'API
- Validation des données d'entrée
- Headers de sécurité avec Helmet

## 📝 Tests

### API
- Tests unitaires avec Jest
- Tests d'intégration
- Couverture de code

### Web
- Tests unitaires avec Jest et React Testing Library

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 License

Ce projet est sous licence MIT.

## 👥 Équipe

Développé dans le cadre d'un projet CESI.