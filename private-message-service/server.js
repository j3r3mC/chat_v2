const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const socketIo = require("socket.io");
const { loadRSAKeys } = require("./security/cryptoUtils");
const privateMessageRoutes = require("./api/privateMessageRoutes");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 Ajout de `req.io` pour transmettre WebSockets aux routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🔍 Middleware de log amélioré
app.use((req, res, next) => {
  console.log(`🔍 Requête reçue : ${req.method} ${req.url}`);
  console.log("🛠️ Headers :", req.headers);
  console.log("📦 Body :", req.body);
  next();
});

loadRSAKeys();
app.use("/api/private-messages", privateMessageRoutes);

app.get("/", (req, res) => res.send("✅ Private Messages Service fonctionne !"));

io.on("connection", (socket) => {
  console.log(`🟢 Connexion WebSocket : ${socket.id}`);

  socket.on("updateMessage", (data) => {
    console.log("✏ Message modifié :", data);
    io.emit("messageUpdated", data);
  });

  socket.on("deleteMessage", (messageId) => {
    console.log("🗑 Message supprimé :", messageId);
    io.emit("messageDeleted", messageId);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Déconnexion :", socket.id);
  });
});

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`🔥 Serveur WebSocket actif sur ${PORT}`));
