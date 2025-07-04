# Plan de Déploiement - CESI Zen 🚀

## 📋 Vue d'ensemble

Ce document décrit la stratégie de déploiement pour l'application CESI Zen, incluant les environnements, les automatisations, et les ressources nécessaires.

## 🏗️ Architecture de Déploiement

### Environnements

| Environnement | Branche | URL | Objectif |
|---------------|---------|-----|----------|
| **Développement** | `develop` | `http://localhost` | Développement local |
| **Test** | `develop` | `https://test.cesi-zen.com` | Tests d'intégration |
| **Production** | `main` | `https://cesi-zen.com` | Application en production |

### Services Déployés

- **API** : Backend Node.js avec Express + Prisma
- **Web** : Interface d'administration React + Vite
- **Database** : PostgreSQL
- **Registry** : GitHub Container Registry (GHCR)

## 🔄 Pipeline CI/CD

### Workflow GitHub Actions

```yaml
Triggers:
├── Push sur develop → Déploiement Test
├── Push sur main → Déploiement Production
└── Pull Request → Tests uniquement
```

### Étapes du Pipeline

1. **Build & Test**
   - Installation des dépendances
   - Tests unitaires (Jest)
   - Build des applications
   - Tests d'intégration

2. **Containerisation**
   - Build des images Docker
   - Tag avec SHA du commit
   - Push vers GHCR

3. **Déploiement**
   - SSH vers serveur cible
   - Pull des nouvelles images
   - Mise à jour des services
   - Vérification de santé

## 📦 Ressources Nécessaires

### Infrastructure Serveur

#### Serveur de Production/Test
- **CPU** : 2+ vCPUs
- **RAM** : 4GB minimum, 8GB recommandé
- **Stockage** : 50GB SSD
- **OS** : Ubuntu 20.04+ ou CentOS 8+
- **Docker** : Version 20.10+
- **Docker Compose** : Version 2.0+

#### Réseau
- **Ports ouverts** :
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS)
  - 5432 (PostgreSQL - interne uniquement)

### Services Externes

#### GitHub Container Registry
- **Authentification** : Personal Access Token
- **Permissions** : `read:packages`, `write:packages`
- **Stockage** : ~2GB par environnement

#### Domaines
- **Production** : `cesi-zen.com`
- **Test** : `test.cesi-zen.com`
- **Certificats SSL** : Let's Encrypt (recommandé)

## 🎯 Étapes de Déploiement par Environnement

### 1. Environnement de Développement

#### Prérequis
- Docker & Docker Compose installés
- Node.js 18+ (optionnel, pour dev local)
- Git

#### Étapes
```bash
# 1. Cloner le projet
git clone <repository-url>
cd cesi-zen

# 2. Configuration
cp .env.example .env
# Modifier les variables d'environnement

# 3. Démarrage
docker-compose up -d

# 4. Initialisation base de données
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npx prisma db seed
```

#### Variables d'Environnement
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:1234@db:5432/cesi-zen
JWT_SECRET=dev-secret-key
REFRESH_SECRET=dev-refresh-secret
JWT_EXPIRES_IN=900000
VITE_BASE_URL=http://localhost:3000
```

### 2. Environnement de Test

#### Prérequis
- Serveur Ubuntu avec Docker
- SSH configuré
- Domaine configuré

#### Automatisation GitHub Actions
```yaml
on:
  push:
    branches: [develop]
  
jobs:
  deploy-test:
    uses: ./.github/workflows/deploy.yml
    with:
      env: test
      branch: develop
      url: https://test.cesi-zen.com
```

#### Étapes Manuelles (Première fois)
```bash
# 1. Préparation serveur
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER

# 2. Création des dossiers
mkdir -p ~/test
cd ~/test

# 3. Configuration
# Copier docker-compose.test.yml sur le serveur
# Configurer les variables d'environnement
```

#### Variables d'Environnement Test
```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:password@db_test:5432/cesi-zen
JWT_SECRET=test-secret-key-change-in-prod
REFRESH_SECRET=test-refresh-secret-change-in-prod
JWT_EXPIRES_IN=900000
VITE_BASE_URL=https://test-api.cesi-zen.com
```

### 3. Environnement de Production

#### Prérequis
- Serveur production dédié
- Certificats SSL configurés
- Backup automatisé
- Monitoring configuré

#### Automatisation GitHub Actions
```yaml
on:
  push:
    branches: [main]
  
jobs:
  deploy-prod:
    uses: ./.github/workflows/deploy.yml
    with:
      env: prod
      branch: main
      url: https://cesi-zen.com
```

#### Étapes de Mise en Production

##### Phase 1 : Préparation (J-7)
- [ ] Tests complets en environnement de test
- [ ] Validation des performances
- [ ] Backup de la base de données actuelle
- [ ] Communication aux utilisateurs

##### Phase 2 : Déploiement (Jour J)
```bash
# 1. Maintenance activée
echo "Maintenance en cours..." > /var/www/html/maintenance.html

# 2. Backup final
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 3. Déploiement automatique via GitHub Actions
# Triggered by push to main branch

# 4. Vérifications post-déploiement
curl -f https://cesi-zen.com/health
docker-compose logs --tail=50

# 5. Tests de fumée
# Tester login, CRUD operations, API endpoints

# 6. Retrait maintenance
rm /var/www/html/maintenance.html
```

##### Phase 3 : Surveillance (J+1 à J+7)
- Monitoring des performances
- Surveillance des logs d'erreur
- Retours utilisateurs
- Métriques de disponibilité

#### Variables d'Environnement Production
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db_prod:5432/cesi-zen
JWT_SECRET=super-secure-production-secret-256-bits
REFRESH_SECRET=super-secure-refresh-secret-256-bits
JWT_EXPIRES_IN=900000
VITE_BASE_URL=https://api.cesi-zen.com
```

## 🛡️ Sécurité et Bonnes Pratiques

### Secrets Management
- **GitHub Secrets** utilisés pour :
  - `SSH_HOST` : IP du serveur
  - `SSH_USER` : Utilisateur SSH
  - `SSH_KEY` : Clé privée SSH
  - `GITHUB_TOKEN` : Token pour GHCR

### Base de Données
- **Backups automatiques** : Quotidiens avec rétention 30 jours
- **Chiffrement** : Activé pour la production
- **Accès restreint** : Réseau interne uniquement

### Conteneurs
- **Images sécurisées** : Scannées pour vulnérabilités
- **Non-root user** : Containers exécutés avec utilisateur dédié
- **Ressources limitées** : CPU et mémoire bornés

## 📊 Monitoring et Observabilité

### Métriques Clés
- **Disponibilité** : Uptime > 99.5%
- **Performance** : Temps de réponse API < 200ms
- **Erreurs** : Taux d'erreur < 0.1%
- **Utilisation ressources** : CPU < 70%, RAM < 80%

### Outils de Monitoring
```yaml
Surveillance:
├── Health Checks HTTP
├── Logs centralisés (Docker logs)
├── Métriques système (htop, docker stats)
└── Alertes par email/webhook
```

### Logs
```bash
# Commandes de surveillance
docker-compose logs -f --tail=100 api_prod
docker-compose logs -f --tail=100 web_prod
docker-compose ps
docker system df
```

## 🔧 Maintenance et Rollback

### Maintenance Programmée
1. **Notification** : J-7 aux utilisateurs
2. **Fenêtre** : Dimanche 2h-4h du matin
3. **Durée max** : 2 heures
4. **Communication** : Page de maintenance

### Procédure de Rollback
```bash
# 1. Identifier la version précédente
docker images | grep cesi-zen

# 2. Rollback rapide
docker-compose down
docker tag ghcr.io/fadibouch/cesi-zen/cesi-zen-api:previous ghcr.io/fadibouch/cesi-zen/cesi-zen-api:latest
docker-compose up -d

# 3. Vérification
curl -f https://cesi-zen.com/health

# 4. Restore DB si nécessaire
pg_restore -d $DATABASE_URL backup_file.sql
```

### Temps de Récupération
- **RTO** (Recovery Time Objective) : < 15 minutes
- **RPO** (Recovery Point Objective) : < 1 heure

## 📈 Évolutions Futures

### Améliorations Court Terme (3 mois)
- [ ] Mise en place HTTPS/SSL automatique
- [ ] Monitoring avancé (Prometheus + Grafana)
- [ ] Tests automatisés plus complets
- [ ] Cache Redis pour les performances

### Améliorations Long Terme (6-12 mois)
- [ ] Migration vers Kubernetes
- [ ] CI/CD multi-région
- [ ] Infrastructure as Code (Terraform)
- [ ] Auto-scaling horizontal

## 📞 Contacts et Escalade

### Équipe DevOps
- **Lead** : [Contact principal]
- **Support** : [Contact support technique]
- **Astreinte** : [Contact urgence 24/7]

### Procédure d'Escalade
1. **Niveau 1** : Équipe de développement
2. **Niveau 2** : Lead technique
3. **Niveau 3** : Responsable infrastructure
4. **Niveau 4** : Direction technique

---

## ✅ Checklist de Déploiement

### Pré-déploiement
- [ ] Tests passés en environnement de test
- [ ] Code review validé
- [ ] Documentation mise à jour
- [ ] Backup de la base de données effectué
- [ ] Notification aux utilisateurs envoyée

### Déploiement
- [ ] Pipeline CI/CD exécuté avec succès
- [ ] Services déployés et démarrés
- [ ] Health checks validés
- [ ] Tests de fumée passés
- [ ] Monitoring activé

### Post-déploiement
- [ ] Performance vérifiée
- [ ] Logs surveillés pendant 1h
- [ ] Retours utilisateurs collectés
- [ ] Documentation post-mortem rédigée (si incidents)
- [ ] Planification des améliorations

---

*Ce plan de déploiement est un document vivant et doit être mis à jour régulièrement selon les évolutions du projet.*