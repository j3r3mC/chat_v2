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

## 🔑 Endpoints

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

# Chat-Service
Ce service gère la communication en temps réel entre les utilisateurs via WebSockets et fournit des API REST pour envoyer et récupérer des messages. Il est conçu pour s'intégrer avec l’auth-service pour l'authentification.

## Fonctionnalités
✔ WebSockets pour une communication en temps réel. ✔ API REST pour envoyer et récupérer des messages. ✔ Base de données MySQL pour stocker les messages. ✔ Protection via JWT (à intégrer avec l'auth-service).

## 🔑 Endpoints API

📝 Envoyer un message (POST /chat/message)<br>
🔹Permet d’envoyer un message et de le diffuser aux clients WebSockets :<br>
    Méthode POST<br>
    URL : http://localhost:3002/chat/message<br>

🔹Requête :<br> 
{<br>
  "content": "Hello tout le monde!",<br>
  "user_id": 1<br>
}<br>
🔹Réponse :<br>
{<br>
  "id": 10,<br>
  "content": "Hello tout le monde!",<br>
  "user_id": 1,<br>
  "createdAt": "2025-05-20T14:57:00.000Z"<br>
}<br>

Récupérer les messages (GET /chat/messages)<br>
Récupère l'historique des messages triés par date.<br>

🔹 Requête :<br>
 Méthode : GET<br>
 URL : http://localhost:3002/chat/messages<br>

🔹 Réponse exemple :<br>
 [<br>
  {<br>
    "id": 1,<br>
    "content": "Bienvenue sur le chat !",<br>
    "user_id": 2,<br>
    "createdAt": "2025-05-20T14:55:00.000Z"<br>
  },<br>
  {<br>
    "id": 2,<br>
    "content": "Comment ça va ?",<br>
    "user_id": 3,<br>
    "createdAt": "2025-05-20T14:57:00.000Z"<br>
  }<br>
]<br>
🔒 Sécurité<br>
✔ Protection JWT (à implémenter avec auth-service). ✔ Vérification des entrées (content, user_id). ✔ Cors activé pour autoriser les connexions Web.






