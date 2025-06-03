const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
const { configureSocket } = require("./sockets/chatSocket");

const app = express();
app.use(express.json());

// Création d'un serveur HTTP basé sur Express
const server = http.createServer(app);

// Initialisation de Socket.IO sur ce serveur avec configuration CORS
const io = socketIo(server, { 
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"] 
  } 
});

// Stocke l'instance Socket.IO dans l'application pour la récupérer ailleurs (ex. dans vos contrôleurs)
app.set("socketio", io);

// Montez vos routes API sous le préfixe /chat
app.use("/chat", chatRoutes);
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Configurez la logique Socket (par exemple, rejoindre une room, gestion des déconnexions, etc.)
configureSocket(io);

// Démarrage du serveur sur le port défini, ici par défaut 3002
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`✅ Chat-Service en écoute sur le port ${PORT}`));
