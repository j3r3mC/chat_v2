require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const chatRoutes = require("./routes/chatRoutes");
const { configureSocket } = require("./sockets/chatSocket");

const app = express();
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

app.set("socketio", io); // ✅ **Correction : Permet à `chatController.js` d'utiliser WebSocket**

app.use("/chat", chatRoutes);

configureSocket(io);

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`✅ Chat-Service en écoute sur le port ${PORT}`));
