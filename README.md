# Chat_v2
Custom discord

# Architecture
chat-app/
├── api-gateway/<br>
│   ├── server.js<br>
│   ├── package.json<br>
│   └── .env  (optionnel, par exemple pour le port)<br>
├── auth-service/<br>
│   ├── controllers/<br>
│   │   └── authController.js<br>
│   ├── routes/<br>
│   │   └── auth.js<br>
│   ├── db.js<br>
│   ├── server.js<br>
│   ├── package.json<br>
│   └── .env<br>
├── chat-service/<br>
│   ├── db.js<br>
│   ├── server.js<br>
│   ├── package.json<br>
│   └── .env<br>
└── admin-service/<br>
    ├── controllers/<br>
    │   └── adminController.js<br>
    ├── routes/<br>
    │   └── admin.js<br>
    ├── db.js<br>
    ├── server.js<br>
    ├── package.json<br>
    └── .env<br>

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
    PORT=3001
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=chat_app
    JWT_SECRET=your_secret_key

4. démarre le service
    ```bash
    npm start

# 🔑 Endpoints

🚀 Inscription (POST /api/auth/register)<br>
Permet aux utilisateurs de créer un compte.<br>

Requête :<br>
    ```json<br>
    {<br>
        "username": "JohnDoe",
        "email": "john@example.com",
        "password": "securepassword"
    }<br>
Réponse :<br>
    ```json<br>
    {<br>
        "message": "Utilisateur créé avec succès"<br>
    }<br>

 🔐 Connexion (POST /api/auth/login)<br>
Authentifie un utilisateur et retourne un JWT.<br>

Requête :<br>
    ```json<br>
    {<br>
        "email": "john@example.com",<br>
        "password": "securepassword"<br>
    }<br>
Réponse :<br>
    ```json<br>
    {<br>
        "token": "eyJhbGciOiJIUzI1NiIsIn..."<br>
    }<br>

🚪 Déconnexion (POST /api/auth/logout)<br>
Déconnecte un utilisateur (côté client).<br>

Réponse :<br>
    ```json<br>
    {<br>
        "message": "Déconnexion réussie"<br>    
    }<br>
🛡️ Sécurité<br>
Hashing des mots de passe : Utilisation de bcrypt pour garantir leur sécurité.<br>

JWT : Les tokens sont utilisés pour authentifier les utilisateurs.<br>

Bonnes pratiques : Ne jamais stocker les mots de passe en clair.<br>

📜 Licence<br>
Projet sous licence MIT. Tu es libre de l'utiliser et de le modifier.<br>
