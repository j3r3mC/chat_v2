# Chat_v2
Custom discord

# Architecture
chat-app/
├── api-gateway/
│   ├── server.js
│   ├── package.json
│   └── .env  (optionnel, par exemple pour le port)
├── auth-service/
│   ├── controllers/
│   │   └── authController.js
│   ├── routes/
│   │   └── auth.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── chat-service/
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
└── admin-service/
    ├── controllers/
    │   └── adminController.js
    ├── routes/
    │   └── admin.js
    ├── db.js
    ├── server.js
    ├── package.json
    └── .env

# Auth-Service

Ce service gère l'authentification des utilisateurs, y compris l'inscription, la connexion et la déconnexion. Il utilise **MySQL** pour stocker les utilisateurs, **bcrypt** pour sécuriser les mots de passe et **JWT** pour l'identification.

## 🛠️ Installation

1. Clone ce repository :
   ```bash
   git clone https://github.com/ton-repo/chat-app.git
   cd chat-app/auth-service

2. Installe les dépendences
    ```bash
    npm install

3. Ajoute un fichier.env
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=chat_app
    JWT_SECRET=your_secret_key

4. démarre le service
    ```bash
    npm start

# 🔑 Endpoints

🚀 Inscription (POST /api/auth/register)
Permet aux utilisateurs de créer un compte.

Requête :
    ```json
    {
        "username": "JohnDoe",
        "email": "john@example.com",
        "password": "securepassword"
    }
Réponse :
    ```json
    {
        "message": "Utilisateur créé avec succès"
    }

 🔐 Connexion (POST /api/auth/login)
Authentifie un utilisateur et retourne un JWT.

Requête :
    ```json
    {
        "email": "john@example.com",
        "password": "securepassword"
    }
Réponse :
    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }

🚪 Déconnexion (POST /api/auth/logout)
Déconnecte un utilisateur (côté client).

Réponse :
    ```json
    {
        "message": "Déconnexion réussie"    
    }
🛡️ Sécurité
Hashing des mots de passe : Utilisation de bcrypt pour garantir leur sécurité.

JWT : Les tokens sont utilisés pour authentifier les utilisateurs.

Bonnes pratiques : Ne jamais stocker les mots de passe en clair.

📜 Licence
Projet sous licence MIT. Tu es libre de l'utiliser et de le modifier.
