const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const { loadRSAKeys } = require("./security/cryptoUtils"); // Chargement des clés RSA
const privateMessageRoutes = require("./api/privateMessageRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app); // 🚀 Création du serveur HTTP
const io = socketIo(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json()); // 🔥 Placé AVANT les logs pour éviter que `req.body` soit undefined
app.use(express.urlencoded({ extended: true })); // 🔥 Ajout pour gérer les données URL-encoded

// 📩 Middleware de log amélioré
app.use((req, res, next) => {
  console.log(`🔍 Requête reçue dans Private Message Service : ${req.method} ${req.url}`);
  console.log("🛠️ Headers :", req.headers);
  console.log("📦 Body après parsing :", req.body); // ✅ Maintenant `req.body` sera bien affiché
  next();
});

loadRSAKeys();

// Connexion aux routes API
app.use("/api/private-messages", privateMessageRoutes);

// Route de test
app.get("/", (req, res) => {
  res.send("✅ Private Messages Service fonctionne !");
});

// 🚀 WebSocket - Gestion des connexions
io.on("connection", (socket) => {
  console.log(`🚀 Nouvelle connexion WebSocket : ${socket.id}`);

  socket.on("send private message", (message) => {
    console.log("📩 Message reçu et diffusé via WebSocket :", message);
    io.emit("new private message", message); // 🔥 Diffusion à tous les clients connectés
  });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => {
    console.log(`🔥 Private Message Service avec WebSocket actif sur le port ${PORT}`);
});
