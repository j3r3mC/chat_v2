// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const initSocket = require("./sockets/chatSocket"); // Logique Socket centralisée
const privateMessageRoutes = require("./api/privateMessageRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware : Injection de l'instance Socket.io dans chaque requête (pour le cas d'utilisation dans les contrôleurs)
const io = initSocket(server);
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes API
app.use("/api/private-messages", privateMessageRoutes);

app.get("/", (req, res) => res.send("✅ Private Messages Service fonctionne !"));

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`🔥 Serveur actif sur le port ${PORT}`));
