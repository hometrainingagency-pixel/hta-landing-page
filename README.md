# 🎓 HTA Landing Page

<div align="center">

![HTA Logo](client/public/hta-logo.png)

**Home Training Agency** - Formation linguistique personnalisée

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📋 Description

Landing page moderne et responsive pour **Home Training Agency (HTA)**, une agence spécialisée dans la formation linguistique en anglais et français. Le site présente les formations disponibles et permet aux visiteurs de s'inscrire via un formulaire de contact.

## ✨ Fonctionnalités

### 🌐 Site Public
- **Page d'accueil** avec slider d'images animé
- **Présentation** de l'agence et de sa mission
- **Catalogue des formations** :
  - Anglais pour francophones
  - Français pour anglophones
  - Français pour francophones
  - Anglais pour anglophones
- **Programme Together** : Formation d'anglais en ligne flexible
- **Formulaire d'inscription** avec validation

### 🔐 Panneau Administrateur
- **Authentification sécurisée** (email/mot de passe)
- **Gestion des contacts** : Visualisation de toutes les inscriptions
- **Recherche et filtrage** des soumissions
- **Export des données** au format CSV

## 🛠️ Technologies

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Node.js, Express, tRPC |
| **Base de données** | PostgreSQL (Supabase), Drizzle ORM |
| **UI Components** | Radix UI, Lucide Icons |
| **Animations** | Framer Motion |
| **Formulaires** | React Hook Form, Zod |

## 📦 Installation

### Prérequis
- Node.js 18+ 
- pnpm (gestionnaire de paquets)
- Compte Supabase (pour la base de données)

### Étapes

1. **Cloner le repository**
```bash
git clone https://github.com/hometrainingagency-pixel/hta-landing-page.git
cd hta-landing-page
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configurer l'environnement**
```bash
cp .env.example .env
```

Remplissez le fichier `.env` avec vos informations :
```env
DATABASE_URL=postgresql://...
JWT_SECRET=votre_secret_jwt
```

4. **Lancer le serveur de développement**
```bash
pnpm dev
```

5. **Ouvrir dans le navigateur**
```
http://localhost:3000
```

## 🔑 Accès Administrateur

- **URL** : `/admin/login`
- **Email** : `nathankalala100@gmail.com`
- **Mot de passe** : Configuré dans le code

## 📁 Structure du Projet

```
hta-landing-page/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants UI réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks personnalisés
│   │   └── lib/            # Utilitaires et configuration
│   └── public/             # Assets statiques
├── server/                 # Backend Express
│   ├── _core/              # Configuration serveur
│   └── routers.ts          # Routes tRPC
├── drizzle/                # Schéma de base de données
└── shared/                 # Code partagé client/serveur
```

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement à chaque push

### Variables d'environnement requises
- `DATABASE_URL` - URL de connexion PostgreSQL
- `JWT_SECRET` - Clé secrète pour les tokens JWT
- `NODE_ENV` - `production` pour le déploiement

## 🤝 Contact

**Home Training Agency**
- 📧 Email : hometrainingagency@gmail.com
- 📱 WhatsApp : +243 971 036 852
- 🌐 Site : [hta-landing.manus.space](https://hta-landing.manus.space)

---

<div align="center">

**Fait avec ❤️ par l'équipe HTA**

© 2024-2026 Home Training Agency. Tous droits réservés.

</div>
