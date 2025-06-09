// socketChat.js
const socketIo = require("socket.io");
const pool = require("../db/db"); // Vérifie que le chemin est correct
const { encryptMessage, decryptMessage } = require("../security/cryptoUtils");

function initSocket(server) {
  const io = socketIo(server, {
    cors: { origin: "*" } // Adapté en production
  });

  io.on("connection", (socket) => {
    console.log(`🟢 Connexion WebSocket : ${socket.id}`);

    // Événement pour l'envoi d'un message
    socket.on("send private message", (msg) => {
      console.log("📩 Nouveau message reçu via socket :", msg);
      // Diffuse l'événement à tous les clients connectés
      io.emit("new private message", msg);
    });

    // Événement pour la mise à jour d'un message
    socket.on("update private message", async (msg) => {
      try {
        // Chiffrer le nouveau contenu
        const encryptedContent = encryptMessage(msg.content);
        // Met à jour le message en base en stockant le contenu chiffré
        await pool.execute(
          "UPDATE private_messages SET content = ?, updated_at = NOW() WHERE id = ?",
          [encryptedContent, msg.messageId]
        );
        console.log("📝 Message mis à jour (chiffré) :", msg);
        // Pour l'affichage, déchiffrer immédiatement le contenu
        const decryptedContent = decryptMessage(encryptedContent);
        io.emit("update private message", { messageId: msg.messageId, content: decryptedContent });
      } catch (error) {
        console.error("❌ Erreur mise à jour message :", error);
      }
    });

    // Événement pour la suppression d'un message
    socket.on("delete private message", async (msg) => {
      try {
        await pool.execute("DELETE FROM private_messages WHERE id = ?", [msg.messageId]);
        console.log("🗑 Message supprimé :", msg);
        io.emit("delete private message", msg);
      } catch (error) {
        console.error("❌ Erreur suppression message :", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Déconnexion : ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;
