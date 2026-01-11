# 📌 TP MongoDB – API REST Complète  
**Conception et Développement des Systèmes d’Information**

---

## 🏫 Contexte académique

Ce projet a été réalisé dans le cadre du module **Conception et Développement des Systèmes d’Information**  
au sein du **Mastere Data Engineer à  l'ECE Paris**.

Il vise à mettre en pratique les concepts de :
- modélisation de systèmes d’information,
- conception d’API REST,
- persistance des données,
- architecture logicielle N-tiers,
- transactions et cohérence des données.

---

## 🎯 Objectifs du projet

L’objectif principal est de **concevoir et développer une API REST robuste et professionnelle**, basée sur une architecture claire et maintenable, permettant de :

- modéliser un système d’information complet,
- gérer plusieurs entités interconnectées,
- assurer la cohérence des données via des transactions,
- implémenter des mécanismes de monitoring,
- préparer une base saine pour une application scalable.

---

## 🛠️ Technologies utilisées

| Technologie | Rôle |
|-----------|------|
| **Node.js** | Environnement d’exécution JavaScript |
| **Express.js** | Framework API REST |
| **MongoDB** | Base de données NoSQL orientée documents |
| **Mongoose** | ODM (Object Data Modeling) |
| **JavaScript ES6** | Langage principal |
| **MongoDB Transactions** | Gestion de la cohérence |
| **Middleware personnalisé** | Monitoring des performances |

---

## 🧱 Architecture du projet

Le projet suit une **architecture N-tiers**, assurant une séparation claire des responsabilités :

- **Couche présentation** : API REST (routes Express)
- **Couche métier** : logique applicative et règles métiers
- **Couche persistance** : accès aux données via Mongoose

### 📂 Structure des dossiers

```text
.
├── config/
│   └── database.js
├── middleware/
│   └── monitoring.js
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   └── Category.js
├── routes/
│   ├── users.js
│   ├── posts.js
│   ├── comments.js
│   └── categories.js
├── services/
│   └── userTransactions.js
├── seed/
│   └── seed.js
├── server.js
└── README.md
```

---

## 🧩 Modélisation du Système d’Information

### 📌 Entités principales

- **User** : gestion des utilisateurs et rôles
- **Post** : articles publiés par les utilisateurs
- **Comment** : commentaires hiérarchiques
- **Category** : classification des articles

### 📐 Diagramme de classes UML

Le système est modélisé à l’aide d’un **diagramme de classes UML formel**, mettant en évidence :

- les relations 1..* et *..1,
- les clés primaires et étrangères,
- l’héritage logique des commentaires (parent / enfant),
- la cohérence des dépendances.

---

## 🗃️ Schéma de la base de données

Le système repose sur des **collections MongoDB** avec des contraintes explicites :

- unicité (`unique`)
- validation (`required`, `enum`, `regex`)
- références (`ObjectId`)
- timestamps automatiques

---

## 🔁 Fonctionnalités de l’API

### 👤 Users
- CRUD complet
- Activation / désactivation de compte
- Statistiques utilisateur
- Suppression transactionnelle

### 📝 Posts
- CRUD complet
- Gestion du statut (draft / published)
- Comptage des vues
- Mise en avant (featured)

### 💬 Comments
- Création de commentaires imbriqués
- Suppression logique
- Gestion des likes

### 🗂️ Categories
- CRUD complet
- Slug unique
- Couleur associée

---

## 🔄 Transactions MongoDB

La suppression d’un utilisateur repose sur une **transaction MongoDB** garantissant :

- suppression sécurisée de l’utilisateur,
- réaffectation de ses posts à un utilisateur système `deleted`,
- cohérence totale de la base même en cas d’erreur.

---

## 🌱 Seed de la base de données

Un script de **seed** permet de générer un environnement de test cohérent.

### ▶️ Exécution

```bash
node seed/seed.js
```

---

## 📊 Monitoring & Performance

Un **middleware personnalisé** mesure le temps d’exécution des requêtes Mongoose et sécurise le cycle des middlewares.

---

## 🚀 Améliorations possibles

- Authentification JWT
- Tests automatisés
- Cache Redis
- Documentation Swagger
- Déploiement Docker

---

## 👩‍💻 Auteur

**Hélène Cakposse**  
🎓 Mastere Data Engineer  
🏫 ECE Paris

---

## 📄 Licence

Projet académique – Usage pédagogique uniquement.
