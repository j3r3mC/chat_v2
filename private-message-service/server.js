// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");
const initSocket = require("./sockets/chatSocket"); // Votre logique Socket centralisée
const privateMessageRoutes = require("./api/privateMessageRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app);

const { loadRSAKeys } = require("./security/cryptoUtils");
loadRSAKeys();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT : Servir statiquement le dossier "upload" 
// pour accéder aux fichiers via, par exemple, http://localhost:5000/upload/nom_du_fichier
app.use("/upload", express.static(path.join(__dirname, "upload")));

// Injection de l'instance Socket.io dans chaque requête (pour les contrôleurs)
const io = initSocket(server);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes API
app.use("/api/private-messages", privateMessageRoutes);

// Endpoint racine de test
app.get("/", (req, res) =>
  res.send("✅ Private Messages Service fonctionne !")
);

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`🔥 Serveur actif sur le port ${PORT}`));
