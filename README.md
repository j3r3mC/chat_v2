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
