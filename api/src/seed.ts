import { Prisma, User } from "@prisma/client";
import UserController from "./controllers/userController";
import prisma from "./utils/database";
import { RegisterData } from "./types/auth";
import bcrypt from "bcryptjs";

async function main() {
  async function seedRoles() {
    await prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: { name: "Admin" },
    });

    await prisma.role.upsert({
      where: { name: "User" },
      update: {},
      create: { name: "User" },
    });
  }

  async function seedAdminUser() {
    const role = await prisma.role.findFirst({ where: { name: "Admin" } });

    if (!role) throw new Error("Rôle introuvable.");

    const user: RegisterData = {
      username: "Admin",
      email: "admin@cesizen.fr",
      password: "1234",
      role: role.name,
    };
    await UserController.upsert(user);
  }

  //#region BreathingExerciseTypes
  const breathingExerciseTypes = [
    {
      id: 1,
      name: "Cohérence cardiaque",
      description:
        "Technique de respiration régulière qui permet d'équilibrer le système nerveux autonome. Généralement pratiquée à raison de 6 respirations par minute (inspiration 5 secondes, expiration 5 secondes) pendant 5 minutes.",
    },
    {
      id: 2,
      name: "Respiration 4-7-8",
      description:
        "Méthode développée par Dr. Andrew Weil, consistant à inspirer pendant 4 secondes, retenir son souffle pendant 7 secondes, puis expirer pendant 8 secondes. Excellent pour réduire l'anxiété et favoriser l'endormissement.",
    },
    {
      id: 3,
      name: "Respiration carrée",
      description:
        "Technique où l'on inspire, retient son souffle, expire et retient à nouveau son souffle pendant des durées égales (généralement 4 secondes chacune). Aide à réduire le stress et améliorer la concentration.",
    },
    {
      id: 4,
      name: "Respiration abdominale",
      description:
        "Se concentre sur la respiration par le diaphragme en gonflant le ventre lors de l'inspiration. Efficace pour activer la réponse de relaxation du corps et réduire l'anxiété.",
    },
    {
      id: 5,
      name: "Respiration alternée par les narines",
      description:
        "Technique issue du yoga (Nadi Shodhana) qui consiste à alterner la respiration entre la narine gauche et droite. Aide à équilibrer les énergies et calmer l'esprit.",
    },
    {
      id: 6,
      name: "Respiration progressive",
      description:
        "Commence par des respirations courtes puis augmente progressivement la durée des inspirations et expirations. Utile pour les débutants ou ceux qui ont du mal à maintenir des respirations longues.",
    },
    {
      id: 7,
      name: "Respiration 5-5-5",
      description:
        "Consiste à inspirer pendant 5 secondes, retenir pendant 5 secondes et expirer pendant 5 secondes. Version simplifiée et équilibrée adaptée à la méditation et à la gestion du stress.",
    },
    {
      id: 8,
      name: "Respiration profonde",
      description:
        "Technique simple consistant à prendre des inspirations lentes et profondes, suivies d'expirations complètes. Excellente pour les débutants et comme exercice rapide dans les moments de stress.",
    },
    {
      id: 9,
      name: "Respiration apaisante",
      description:
        "Inspiration normale suivie d'une expiration deux fois plus longue. Cette technique active le système parasympathique et favorise la détente immédiate.",
    },
    {
      id: 10,
      name: "Respiration énergisante",
      description:
        "Inspirations rapides et courtes suivies d'expirations longues et contrôlées. Aide à augmenter l'énergie et la vigilance sans causer de stress.",
    },
  ];

  // Exemple d'utilisation avec Prisma dans un script de seed
  async function seedBreathingExerciseTypes() {
    for (const type of breathingExerciseTypes) {
      const { id, ...typeData } = type;
      await prisma.breathingExerciseType.upsert({
        where: { id },
        update: typeData,
        create: typeData,
      });
    }

    console.log("Breathing exercise types seeded successfully!");
  }
  //#endregion

  //#region BreathingExerciseConfigurations

  // Données pour initialiser la table breathing_exercise_configurations
  const breathingExerciseConfigurations = [
    // Configurations pour la cohérence cardiaque (typeId: 1)
    {
      id: 1,
      name: "Cohérence cardiaque standard",
      inhaleTime: 5,
      holdInhaleTime: 0,
      exhaleTime: 5,
      holdExhaleTime: 0,
      cycles: 30, // 5 minutes à 6 respirations par minute
      description:
        "Configuration standard de cohérence cardiaque : 6 respirations par minute pendant 5 minutes.",
      isPublic: true,
      typeId: 1,
      userId: null, // Configuration publique par défaut
    },
    {
      id: 2,
      name: "Cohérence cardiaque débutant",
      inhaleTime: 4,
      holdInhaleTime: 0,
      exhaleTime: 6,
      holdExhaleTime: 0,
      cycles: 20, // Version plus courte pour débutants
      description:
        "Version adaptée pour débutants avec une expiration plus longue pour favoriser la détente.",
      isPublic: true,
      typeId: 1,
      userId: null,
    },

    // Configurations pour la respiration 4-7-8 (typeId: 2)
    {
      id: 3,
      name: "4-7-8 classique",
      inhaleTime: 4,
      holdInhaleTime: 7,
      exhaleTime: 8,
      holdExhaleTime: 0,
      cycles: 5,
      description:
        "Technique originale du Dr. Andrew Weil. Parfaite avant de dormir ou lors de moments d'anxiété.",
      isPublic: true,
      typeId: 2,
      userId: null,
    },

    // Configurations pour la respiration carrée (typeId: 3)
    {
      id: 4,
      name: "Box Breathing standard",
      inhaleTime: 4,
      holdInhaleTime: 4,
      exhaleTime: 4,
      holdExhaleTime: 4,
      cycles: 10,
      description:
        "Technique utilisée par les Navy SEALs pour rester calme sous pression.",
      isPublic: true,
      typeId: 3,
      userId: null,
    },
    {
      id: 5,
      name: "Box Breathing prolongé",
      inhaleTime: 5,
      holdInhaleTime: 5,
      exhaleTime: 5,
      holdExhaleTime: 5,
      cycles: 8,
      description:
        "Version plus avancée avec des cycles plus longs pour une détente profonde.",
      isPublic: true,
      typeId: 3,
      userId: null,
    },

    // Configurations pour la respiration abdominale (typeId: 4)
    {
      id: 6,
      name: "Respiration abdominale profonde",
      inhaleTime: 6,
      holdInhaleTime: 0,
      exhaleTime: 8,
      holdExhaleTime: 0,
      cycles: 15,
      description:
        "Concentrez-vous sur l'expansion du ventre pendant l'inspiration. Excellente pour la relaxation.",
      isPublic: true,
      typeId: 4,
      userId: null,
    },

    // Configurations pour la respiration alternée (typeId: 5)
    {
      id: 7,
      name: "Nadi Shodhana simplifié",
      inhaleTime: 4,
      holdInhaleTime: 2,
      exhaleTime: 6,
      holdExhaleTime: 2,
      cycles: 9,
      description:
        "Version simplifiée de la respiration alternée par les narines du yoga.",
      isPublic: true,
      typeId: 5,
      userId: null,
    },

    // Configurations pour la respiration progressive (typeId: 6)
    {
      id: 8,
      name: "Progression douce",
      inhaleTime: 3,
      holdInhaleTime: 0,
      exhaleTime: 4,
      holdExhaleTime: 0,
      cycles: 20,
      description:
        "Commencez doucement et augmentez progressivement la durée des respirations à chaque cycle.",
      isPublic: true,
      typeId: 6,
      userId: null,
    },

    // Configurations pour la respiration 5-5-5 (typeId: 7)
    {
      id: 9,
      name: "5-5-5 équilibrée",
      inhaleTime: 5,
      holdInhaleTime: 5,
      exhaleTime: 5,
      holdExhaleTime: 0,
      cycles: 12,
      description:
        "Une approche équilibrée idéale pour la méditation quotidienne.",
      isPublic: true,
      typeId: 7,
      userId: null,
    },

    // Configurations pour la respiration profonde (typeId: 8)
    {
      id: 10,
      name: "Respiration profonde simple",
      inhaleTime: 5,
      holdInhaleTime: 0,
      exhaleTime: 7,
      holdExhaleTime: 0,
      cycles: 10,
      description:
        "Une technique simple mais efficace pour une détente rapide.",
      isPublic: true,
      typeId: 8,
      userId: null,
    },

    // Configurations pour la respiration apaisante (typeId: 9)
    {
      id: 11,
      name: "Souffle apaisant",
      inhaleTime: 4,
      holdInhaleTime: 0,
      exhaleTime: 8,
      holdExhaleTime: 0,
      cycles: 12,
      description:
        "Inspiration normale suivie d'une longue expiration pour activer le système parasympathique.",
      isPublic: true,
      typeId: 9,
      userId: null,
    },

    // Configurations pour la respiration énergisante (typeId: 10)
    {
      id: 12,
      name: "Boost d'énergie",
      inhaleTime: 2,
      holdInhaleTime: 0,
      exhaleTime: 4,
      holdExhaleTime: 0,
      cycles: 20,
      description:
        "Respirations rapides et énergisantes pour augmenter la vigilance.",
      isPublic: true,
      typeId: 10,
      userId: null,
    },

    // Quelques configurations personnalisées par des utilisateurs
    {
      id: 13,
      name: "Ma cohérence cardiaque du soir",
      inhaleTime: 4,
      holdInhaleTime: 0,
      exhaleTime: 6,
      holdExhaleTime: 0,
      cycles: 25,
      description: "Version personnalisée pour m'aider à m'endormir.",
      isPublic: false,
      typeId: 1,
      userId: 1, // Appartient à l'utilisateur avec ID 1
    },
  ];

  // Exemple d'utilisation avec Prisma dans un script de seed
  async function seedBreathingExerciseConfigurations() {
    for (const config of breathingExerciseConfigurations) {
      await prisma.breathingExerciseConfiguration.upsert({
        where: { id: config.id },
        update: config,
        create: config,
      });
    }

    console.log("Breathing exercise configurations seeded successfully!");
  }
  //#endregion

  //#region ContentCategories

  const contentCategories = [
    {
      id: 1,
      name: "Fondamentaux de la santé mentale",
      slug: "fondamentaux-sante-mentale",
      description:
        "Informations essentielles sur les bases de la santé mentale, les concepts clés et les principes fondamentaux.",
    },
    {
      id: 2,
      name: "Gestion du stress",
      slug: "gestion-stress",
      description:
        "Ressources et informations sur la compréhension, la gestion et la réduction du stress quotidien.",
    },
    {
      id: 3,
      name: "Anxiété",
      slug: "anxiete",
      description:
        "Comprendre l'anxiété, ses manifestations et les différentes approches pour la gérer.",
    },
    {
      id: 4,
      name: "Dépression",
      slug: "depression",
      description:
        "Informations sur la dépression, ses symptômes, les traitements et les ressources d'aide.",
    },
    {
      id: 5,
      name: "Bien-être au quotidien",
      slug: "bien-etre-quotidien",
      description:
        "Conseils pratiques pour améliorer son bien-être mental au jour le jour.",
    },
    {
      id: 6,
      name: "Sommeil",
      slug: "sommeil",
      description:
        "L'importance du sommeil pour la santé mentale et comment améliorer sa qualité.",
    },
    {
      id: 7,
      name: "Alimentation et santé mentale",
      slug: "alimentation-sante-mentale",
      description:
        "Le lien entre l'alimentation et la santé mentale, nutrition et bien-être psychologique.",
    },
    {
      id: 8,
      name: "Méditation et pleine conscience",
      slug: "meditation-pleine-conscience",
      description:
        "Informations sur les pratiques de méditation, de pleine conscience et leurs bienfaits.",
    },
    {
      id: 9,
      name: "Relations sociales",
      slug: "relations-sociales",
      description:
        "L'importance des relations sociales pour la santé mentale et comment les entretenir.",
    },
    {
      id: 10,
      name: "Ressources d'aide",
      slug: "ressources-aide",
      description:
        "Informations sur les ressources disponibles pour obtenir de l'aide en matière de santé mentale.",
    },
  ];

  // Exemple d'utilisation avec Prisma dans un script de seed
  async function seedContentCategories() {
    for (const category of contentCategories) {
      const { id, ...categoryData } = category;
      await prisma.contentCategory.upsert({
        where: { id },
        update: categoryData,
        create: categoryData,
      });
    }

    console.log("Content categories seeded successfully!");
  }
  //#endregion

  //#region  Contents

  // Données pour initialiser la table contents
  const contents = [
    // Catégorie: Fondamentaux de la santé mentale
    {
      id: 1,
      title: "Qu'est-ce que la santé mentale ?",
      slug: "quest-ce-que-la-sante-mentale",
      content: `# Qu'est-ce que la santé mentale ?

La santé mentale est un état de bien-être dans lequel une personne peut se réaliser, surmonter les tensions normales de la vie, accomplir un travail productif et contribuer à la vie de sa communauté.

## Composantes de la santé mentale

La santé mentale englobe plusieurs dimensions :
- Le bien-être émotionnel
- Le bien-être psychologique
- Le bien-être social

## Santé mentale vs maladie mentale

Il est important de comprendre que la santé mentale n'est pas simplement l'absence de trouble mental. Une personne peut traverser des périodes difficiles sans nécessairement souffrir d'un trouble mental diagnostiqué.

## Facteurs influençant la santé mentale

De nombreux facteurs peuvent influencer notre santé mentale :
- Facteurs biologiques (génétique, chimie du cerveau)
- Expériences de vie (traumatismes, abus)
- Antécédents familiaux de problèmes de santé mentale
- Mode de vie (alimentation, activité physique, sommeil)

Prendre soin de sa santé mentale est aussi important que prendre soin de sa santé physique. Les deux sont intimement liées et s'influencent mutuellement.`,
      published: true,
      categoryId: 1,
      createdAt: new Date("2024-12-15T10:00:00Z"),
      updatedAt: new Date("2025-01-10T14:30:00Z"),
    },
    {
      id: 2,
      title: "Les mythes sur la santé mentale",
      slug: "mythes-sante-mentale",
      content: `# Les mythes sur la santé mentale

De nombreuses idées reçues persistent autour de la santé mentale. Voici quelques mythes courants et les réalités correspondantes.

## Mythe 1 : Les problèmes de santé mentale sont rares
**Réalité** : Environ une personne sur quatre sera touchée par un problème de santé mentale au cours de sa vie.

## Mythe 2 : Les personnes atteintes de troubles mentaux sont violentes et imprévisibles
**Réalité** : La grande majorité des personnes souffrant de troubles mentaux ne sont pas violentes. Elles sont plus souvent victimes que responsables d'actes violents.

## Mythe 3 : Les problèmes de santé mentale sont un signe de faiblesse
**Réalité** : Les troubles mentaux sont des conditions médicales qui ne reflètent pas la force de caractère d'une personne.

## Mythe 4 : On ne guérit pas des troubles mentaux
**Réalité** : Avec un traitement approprié, de nombreuses personnes se rétablissent complètement ou apprennent à gérer efficacement leurs symptômes.

## Mythe 5 : Les enfants ne souffrent pas de problèmes de santé mentale
**Réalité** : De nombreux troubles mentaux commencent à se manifester durant l'enfance ou l'adolescence.

Combattre ces mythes est essentiel pour réduire la stigmatisation et encourager les personnes à chercher l'aide dont elles ont besoin.`,
      published: true,
      categoryId: 1,
      createdAt: new Date("2024-12-20T15:45:00Z"),
      updatedAt: new Date("2025-01-15T09:20:00Z"),
    },

    // Catégorie: Gestion du stress
    {
      id: 3,
      title: "Comprendre le mécanisme du stress",
      slug: "comprendre-mecanisme-stress",
      content: `# Comprendre le mécanisme du stress

Le stress est une réponse naturelle de l'organisme face à une situation perçue comme menaçante ou exigeante.

## Le mécanisme biologique du stress

Lorsque nous percevons une menace, notre corps déclenche une cascade de réactions :

1. **Phase d'alarme** : Le cerveau active la production d'adrénaline et de cortisol.
2. **Phase de résistance** : Le corps mobilise ses ressources pour faire face à la situation.
3. **Phase d'épuisement** : Si le stress persiste, les ressources s'épuisent et des problèmes de santé peuvent apparaître.

## Stress aigu vs stress chronique

- **Stress aigu** : Réponse immédiate à un danger, disparaît une fois la menace écartée.
- **Stress chronique** : Exposition prolongée à des facteurs de stress, potentiellement nocive pour la santé.

## Les symptômes du stress

Le stress peut se manifester de différentes façons :

### Symptômes physiques
- Tensions musculaires
- Maux de tête
- Troubles digestifs
- Fatigue

### Symptômes émotionnels
- Irritabilité
- Anxiété
- Difficultés de concentration
- Troubles du sommeil

Comprendre comment fonctionne le stress est la première étape pour apprendre à le gérer efficacement.`,
      published: true,
      categoryId: 2,
      createdAt: new Date("2025-01-05T12:30:00Z"),
      updatedAt: new Date("2025-02-10T11:15:00Z"),
    },
    {
      id: 4,
      title: "Techniques rapides pour gérer le stress",
      slug: "techniques-rapides-gestion-stress",
      content: `# Techniques rapides pour gérer le stress

Voici quelques techniques efficaces pour réduire rapidement le niveau de stress dans des situations difficiles.

## 1. Respiration contrôlée

La respiration est un outil puissant pour calmer le système nerveux :

- **Respiration 4-7-8** : Inspirez pendant 4 secondes, retenez votre souffle pendant 7 secondes, expirez pendant 8 secondes.
- **Cohérence cardiaque** : 6 respirations par minute pendant 5 minutes.

## 2. Relaxation musculaire progressive

Contractez puis relâchez progressivement chaque groupe musculaire, en partant des pieds jusqu'à la tête.

## 3. Ancrage dans le présent

Utilisez la technique des 5-4-3-2-1 :
- Identifiez 5 choses que vous voyez
- 4 choses que vous pouvez toucher
- 3 choses que vous entendez
- 2 choses que vous sentez
- 1 chose que vous goûtez

## 4. Visualisation positive

Imaginez un lieu paisible et sécurisant où vous vous sentez bien. Explorez ce lieu avec tous vos sens.

## 5. Mouvements conscients

Même de simples étirements ou une courte marche peuvent aider à évacuer les tensions physiques liées au stress.

Ces techniques sont particulièrement utiles dans les moments de stress aigu, mais leur pratique régulière peut également aider à développer une meilleure résistance au stress quotidien.`,
      published: true,
      categoryId: 2,
      createdAt: new Date("2025-01-12T09:45:00Z"),
      updatedAt: new Date("2025-02-15T16:30:00Z"),
    },

    // Catégorie: Méditation et pleine conscience
    {
      id: 5,
      title: "Introduction à la méditation de pleine conscience",
      slug: "introduction-meditation-pleine-conscience",
      content: `# Introduction à la méditation de pleine conscience

La méditation de pleine conscience est une pratique qui consiste à porter intentionnellement son attention sur le moment présent, sans jugement.

## Principes fondamentaux

La pleine conscience repose sur plusieurs principes :
- **Attention au moment présent** : Se concentrer sur l'ici et maintenant.
- **Non-jugement** : Observer ses pensées et sensations sans les qualifier de bonnes ou mauvaises.
- **Curiosité bienveillante** : Explorer ses expériences avec ouverture et bienveillance.
- **Acceptation** : Reconnaître la réalité telle qu'elle est, sans chercher à la modifier immédiatement.

## Bienfaits de la méditation

De nombreuses études scientifiques ont démontré les bienfaits de la méditation régulière :
- Réduction du stress et de l'anxiété
- Amélioration de la concentration et de la mémoire
- Meilleure régulation émotionnelle
- Renforcement du système immunitaire
- Amélioration de la qualité du sommeil

## Comment commencer ?

Pour débuter la méditation de pleine conscience :
1. Choisissez un moment calme de la journée
2. Trouvez une position confortable, assise ou allongée
3. Concentrez-vous sur votre respiration
4. Lorsque votre esprit s'égare, ramenez doucement votre attention à votre respiration
5. Commencez par des sessions courtes (5 minutes) puis augmentez progressivement

La méditation est une compétence qui se développe avec la pratique. Soyez patient avec vous-même pendant votre apprentissage.`,
      published: true,
      categoryId: 8,
      createdAt: new Date("2025-01-18T14:00:00Z"),
      updatedAt: new Date("2025-02-20T10:45:00Z"),
    },

    // Catégorie: Bien-être au quotidien
    {
      id: 6,
      title: "Créer une routine de bien-être mental",
      slug: "creer-routine-bien-etre-mental",
      content: `# Créer une routine de bien-être mental

Intégrer des pratiques de bien-être mental dans votre quotidien peut améliorer considérablement votre santé mentale à long terme.

## Pourquoi établir une routine ?

Une routine bien structurée :
- Crée un sentiment de stabilité et de contrôle
- Réduit la fatigue décisionnelle
- Facilite l'adoption de nouvelles habitudes
- Permet d'intégrer naturellement des pratiques bénéfiques

## Éléments clés d'une routine de bien-être mental

### Le matin
- **Moment de calme** : Commencez par 5-10 minutes de méditation ou de respiration consciente
- **Intention positive** : Fixez une intention pour la journée
- **Mouvement** : Intégrez une activité physique, même brève

### Pendant la journée
- **Pauses conscientes** : Prenez 2-3 minutes toutes les heures pour respirer profondément
- **Contact avec la nature** : Essayez de passer au moins 20 minutes à l'extérieur
- **Limites numériques** : Définissez des périodes sans écran

### Le soir
- **Déconnexion** : Évitez les écrans au moins 1 heure avant le coucher
- **Réflexion** : Notez trois choses positives de votre journée
- **Rituel d'endormissement** : Créez une séquence apaisante avant le sommeil

## Personnaliser votre routine

Votre routine doit être adaptée à vos besoins personnels. Commencez par intégrer 1-2 nouvelles habitudes, puis augmentez progressivement.

L'important n'est pas la perfection mais la constance. Même des pratiques brèves, si elles sont régulières, peuvent avoir un impact significatif sur votre bien-être mental.`,
      published: true,
      categoryId: 5,
      createdAt: new Date("2025-02-01T11:20:00Z"),
      updatedAt: new Date("2025-03-05T09:30:00Z"),
    },

    // Catégorie: Sommeil
    {
      id: 7,
      title: "L'importance du sommeil pour la santé mentale",
      slug: "importance-sommeil-sante-mentale",
      content: `# L'importance du sommeil pour la santé mentale

Le sommeil et la santé mentale sont intimement liés. Un sommeil de qualité est essentiel au bon fonctionnement de notre cerveau et à notre équilibre émotionnel.

## Impact du sommeil sur la santé mentale

Un sommeil insuffisant ou de mauvaise qualité peut :
- Augmenter les risques d'anxiété et de dépression
- Réduire la capacité à gérer le stress
- Altérer les fonctions cognitives (concentration, mémoire)
- Amplifier les réactions émotionnelles négatives
- Augmenter l'irritabilité et l'impulsivité

À l'inverse, un sommeil réparateur favorise :
- Une meilleure régulation émotionnelle
- Une pensée plus claire et créative
- Une plus grande résistance au stress
- Un meilleur contrôle de l'attention
- Un système immunitaire plus fort

## Le cycle du sommeil

Le sommeil se compose de plusieurs phases qui se répètent en cycles d'environ 90 minutes :
1. **Phase d'endormissement**
2. **Sommeil léger**
3. **Sommeil profond** (particulièrement important pour la récupération physique)
4. **Sommeil paradoxal** (phase des rêves, essentielle pour la consolidation de la mémoire)

Chaque phase joue un rôle spécifique dans notre récupération mentale et physique.

## Conseils pour améliorer la qualité du sommeil

- Maintenez un horaire de sommeil régulier
- Créez un environnement propice (obscurité, silence, fraîcheur)
- Limitez la caféine et l'alcool, surtout en fin de journée
- Évitez les écrans au moins une heure avant le coucher
- Pratiquez une activité relaxante avant de vous coucher (lecture, méditation)

Investir dans la qualité de votre sommeil est l'un des moyens les plus efficaces d'améliorer votre santé mentale globale.`,
      published: true,
      categoryId: 6,
      createdAt: new Date("2025-02-10T16:45:00Z"),
      updatedAt: new Date("2025-03-12T14:20:00Z"),
    },

    // Catégorie: Ressources d'aide
    {
      id: 8,
      title: "Quand et comment chercher de l'aide professionnelle",
      slug: "quand-comment-chercher-aide-professionnelle",
      content: `# Quand et comment chercher de l'aide professionnelle

Il est parfois difficile de savoir à quel moment nos difficultés nécessitent un soutien professionnel. Voici quelques repères pour vous guider.

## Signes indiquant le besoin d'une aide professionnelle

### Changements persistants
- Modifications importantes de l'appétit ou du sommeil durant plus de 2 semaines
- Difficulté à accomplir les tâches quotidiennes
- Retrait des activités habituellement appréciées
- Sentiments de désespoir ou d'inutilité persistants

### Impact sur le fonctionnement
- Difficultés au travail ou dans les études
- Problèmes relationnels significatifs
- Incapacité à prendre soin de soi

### Comportements préoccupants
- Augmentation de la consommation d'alcool ou de substances
- Pensées d'automutilation ou suicidaires
- Comportements impulsifs ou à risque

## Les différents professionnels de la santé mentale

### Psychiatre
Médecin spécialisé pouvant prescrire des médicaments et diagnostiquer des troubles mentaux.

### Psychologue
Professionnel formé à l'évaluation psychologique et à diverses thérapies. Ne prescrit pas de médicaments.

### Psychothérapeute
Professionnel formé pour offrir des thérapies spécifiques.

### Médecin généraliste
Souvent le premier contact, peut proposer un traitement initial ou vous orienter vers un spécialiste.

## Comment trouver le bon professionnel

- Demandez des recommandations à votre médecin
- Contactez votre assurance pour connaître les professionnels couverts
- Consultez les associations et organisations spécialisées
- N'hésitez pas à changer si la relation thérapeutique ne vous convient pas

Chercher de l'aide est un signe de force, non de faiblesse. La thérapie et le soutien professionnel sont des outils efficaces pour surmonter les difficultés et améliorer votre qualité de vie.`,
      published: true,
      categoryId: 10,
      createdAt: new Date("2025-02-20T13:10:00Z"),
      updatedAt: new Date("2025-03-25T11:50:00Z"),
    },

    // Catégorie: Anxiété
    {
      id: 9,
      title: "Comprendre et gérer les crises d'angoisse",
      slug: "comprendre-gerer-crises-angoisse",
      content: `# Comprendre et gérer les crises d'angoisse

Les crises d'angoisse, aussi appelées attaques de panique, sont des épisodes intenses d'anxiété qui peuvent être très perturbants mais ne sont pas dangereux.

## Symptômes d'une crise d'angoisse

Une crise d'angoisse peut inclure plusieurs des symptômes suivants :
- Accélération du rythme cardiaque
- Transpiration excessive
- Tremblements
- Sensation d'étouffement
- Douleurs thoraciques
- Nausées ou malaises abdominaux
- Vertiges ou étourdissements
- Sensation d'irréalité ou de détachement
- Peur de perdre le contrôle
- Peur de mourir

Ces symptômes atteignent généralement leur paroxysme en quelques minutes et s'estompent progressivement.

## Que se passe-t-il dans le corps ?

Une crise d'angoisse est une réaction de "combat ou fuite" déclenchée par le système nerveux autonome. Le corps se prépare à faire face à un danger, même s'il n'y en a pas de réel.

## Techniques pour gérer une crise d'angoisse

### Pendant la crise
1. **Reconnaître ce qui se passe** : "C'est une crise d'angoisse, elle va passer"
2. **Respiration contrôlée** : Inspirez lentement par le nez (4s), expirez lentement par la bouche (6s)
3. **Technique 5-4-3-2-1** : Nommez 5 choses que vous voyez, 4 que vous pouvez toucher, 3 que vous entendez, 2 que vous sentez, 1 que vous goûtez
4. **Acceptation** : Ne luttez pas contre les sensations, laissez-les passer

### Prévention à long terme
- Pratique régulière de techniques de relaxation
- Thérapie cognitive-comportementale
- Réduction des stimulants (caféine)
- Activité physique régulière
- Techniques de gestion du stress

## Quand consulter ?

Consultez un professionnel si :
- Les crises sont fréquentes ou handicapantes
- Vous développez une peur des crises (anxiété anticipatoire)
- Vous commencez à éviter certaines situations
- Les crises affectent significativement votre quotidien

Avec le bon soutien et les bonnes stratégies, il est tout à fait possible de surmonter les crises d'angoisse et de retrouver une vie sereine.`,
      published: true,
      categoryId: 3,
      createdAt: new Date("2025-03-05T10:30:00Z"),
      updatedAt: new Date("2025-04-10T15:40:00Z"),
    },

    // Contenu non publié (brouillon)
    {
      id: 10,
      title: "Les bienfaits des adaptogènes sur le stress",
      slug: "bienfaits-adaptogenes-stress",
      content: `# Les bienfaits des adaptogènes sur le stress

[BROUILLON - À COMPLÉTER]

## Qu'est-ce que les adaptogènes ?

Les adaptogènes sont des plantes et champignons qui aident l'organisme à s'adapter au stress et à retrouver son équilibre.

## Principaux adaptogènes et leurs effets

- **Ashwagandha** : Réduit le cortisol et l'anxiété
- **Rhodiola** : Combat la fatigue et améliore les performances cognitives sous stress
- **Ginseng** : Booste l'énergie et la concentration
- **Champignon reishi** : Favorise la détente et le sommeil
- **Tulsi (basilic sacré)** : Équilibre le système nerveux

## Intégration dans la routine quotidienne

[À compléter]

## Précautions et contre-indications

[À compléter]`,
      published: false, // Brouillon non publié
      categoryId: 2,
      createdAt: new Date("2025-04-15T09:00:00Z"),
      updatedAt: new Date("2025-04-15T09:00:00Z"),
    },
  ];

  // Exemple d'utilisation avec Prisma dans un script de seed
  async function seedContents() {
    for (const content of contents) {
      const { id, ...contentData } = content;
      await prisma.content.upsert({
        where: { id },
        update: contentData,
        create: contentData,
      });
    }

    console.log("Contents seeded successfully!");
  }
  //#endregion
  await seedRoles();
  await seedAdminUser();
  await seedContentCategories();
  await seedContents();
  await seedBreathingExerciseTypes();
  await seedBreathingExerciseConfigurations();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
