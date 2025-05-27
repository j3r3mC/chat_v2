require("dotenv").config();
console.log(`🚀 Port utilisé : ${process.env.PORT}`);

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const pool = require("./db");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json()); // Permet de lire le body JSON des requêtes

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Ajustez cette valeur selon vos besoins de sécurité
    methods: ["GET", "POST"],
  },
});

// 🔐 Middleware de vérification du token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Accès refusé : Token requis" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Stocke les informations utilisateur
    next();
  } catch (error) {
    return res.status(403).json({ message: "Accès refusé : Token invalide" });
  }
};

app.use((req, res, next) => {
  console.log(`🔍 Chat Service reçoit : ${req.method} ${req.url}`);
  next();
});

// 📌 Route REST pour envoyer un message (avec vérification du canal)
app.post("/chat/message", verifyToken, async (req, res) => {
  const { content, channel_id } = req.body;
  const user_id = req.user.id;
  const user_role = req.user.role;

  if (!content || !channel_id) {
    return res.status(400).json({ message: "Le contenu et le canal sont requis" });
  }

  try {
    // Vérifier l'existence du canal
    const [channelRows] = await pool.query("SELECT type FROM channels WHERE id = ?", [channel_id]);
    if (channelRows.length === 0) {
      return res.status(404).json({ message: "Canal introuvable" });
    }
    const channelType = channelRows[0].type;
    if (channelType === "admin" && user_role !== "admin" && user_role !== "superadmin") {
      return res.status(403).json({ message: "Accès refusé : Seuls les admins peuvent poster ici" });
    }

    // Insérer le message dans la base de données
    const [result] = await pool.query(
      "INSERT INTO messages (content, user_id, channel_id) VALUES (?, ?, ?)",
      [content, user_id, channel_id]
    );

    const newMessage = {
      id: result.insertId,
      content,
      user_id,
      channel_id,
      created_at: new Date(),  // Utilisation de created_at
    };

    // Émettre le message vers les clients sur le channel concerné
    io.to(`channel-${channel_id}`).emit("chat message", newMessage);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Route REST pour récupérer les messages d'un canal
app.get("/chat/messages/:channel_id", verifyToken, async (req, res) => {
  const channel_id = req.params.channel_id;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM messages WHERE channel_id = ? ORDER BY createdAt ASC LIMIT 50",
      [channel_id]
    );
    console.log("🕰️ Messages envoyés à l'API :", rows);
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des messages :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.use((req, res, next) => {
  console.log(`🔍 Token reçu dans chat-service :`, req.headers.authorization);
  next();
});

// 📌 Gestion des WebSockets pour les channels
io.on("connection", (socket) => {
  console.log(`🟢 Client connecté : ${socket.id}`);

  // Ici, nous utilisons l'objet envoyé par le client pour connaitre le flag skipHistory.
  socket.on("join channel", async (data) => {
    const { channel_id, skipHistory } = data;
    console.log(`👤 Client ${socket.id} rejoint le canal ${channel_id} avec skipHistory=${skipHistory}`);
    socket.join(`channel-${channel_id}`);

    // Si le client demande de ne pas recevoir l'historique (skipHistory=true),
    // ne rien faire ici : l'historique sera récupéré via l'API.
    if (skipHistory) {
      console.log("⏩ Historique ignoré pour ce client (skipHistory activé).");
      return;
    }

    try {
      if (!socket.joinedChannels) socket.joinedChannels = new Set();
      if (!socket.joinedChannels.has(channel_id)) {
        const [messages] = await pool.query(
          "SELECT * FROM messages WHERE channel_id = ? ORDER BY createdAt ASC LIMIT 50",
          [channel_id]
        );
        console.log("📜 Envoi des anciens messages :", messages);
        socket.emit("previous messages", messages);
        socket.joinedChannels.add(channel_id);
      } else {
        console.log("🛑 Messages déjà envoyés à ce client, annulation.");
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi des anciens messages :", error);
    }
  });

  // Réception d'un message émis par un client via WebSocket
  socket.on("chat message", async (msg) => {
    try {
      if (!msg.content || !msg.user_id || !msg.channel_id) {
        console.error("❌ Message invalide :", msg);
        return;
      }

      // Insertion du message dans la base de données (pour une synchronisation bidirectionnelle)
      const [channelRows] = await pool.query("SELECT type FROM channels WHERE id = ?", [msg.channel_id]);
      if (channelRows.length === 0) {
        console.error("❌ Canal introuvable :", msg.channel_id);
        return;
      }

      const [result] = await pool.query(
        "INSERT INTO messages (content, user_id, channel_id) VALUES (?, ?, ?)",
        [msg.content, msg.user_id, msg.channel_id]
      );

      const newMessage = {
        id: result.insertId,
        content: msg.content,
        user_id: msg.user_id,
        channel_id: msg.channel_id,
        created_at: new Date(), // Création d'une date ici
      };

      // Émettre le message aux autres clients du channel
      io.to(`channel-${msg.channel_id}`).emit("chat message", newMessage);
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du message :", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Client déconnecté : ${socket.id}`);
  });
});

// 📌 Démarrer le serveur
const PORT = process.env.PORT || 3002;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Serveur de chat en écoute sur le port ${PORT}`);
});
