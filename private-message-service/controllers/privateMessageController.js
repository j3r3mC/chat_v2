// privateMessageController.js
const pool = require("../db/db");
const path = require("path");
const fs = require("fs");
const { encryptMessage, decryptMessage } = require("../security/cryptoUtils");
const mime = require("mime-types"); // Pour détecter le type MIME

// ──────────────────────────────────────────────
// Envoyer un message privé (texte) – on conserve le chiffrement pour le texte
// ──────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user?.id;
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }
    // Chiffrer le contenu pour la DB
    const encryptedMessage = encryptMessage(message);
    const [result] = await pool.query(
      "INSERT INTO private_messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [senderId, receiverId, encryptedMessage]
    );
    // Pour l'affichage immédiat, renvoyer le message en clair
    const newMessage = {
      id: result.insertId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: message,
      created_at: new Date().toISOString(),
    };
    res.status(201).json({ success: true, message: newMessage });
    req.io.emit("new private message", newMessage);
  } catch (error) {
    console.error("❌ Erreur envoi MP:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// ──────────────────────────────────────────────
// Récupérer les messages d'une conversation
// ──────────────────────────────────────────────
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) {
      return res.status(400).json({ error: "roomId est requis" });
    }
    const [messages] = await pool.query(
      "SELECT * FROM private_messages WHERE receiver_id = ? OR sender_id = ? ORDER BY created_at ASC",
      [roomId, roomId]
    );
    if (!messages.length) {
      return res.status(404).json({ error: "Aucun message trouvé" });
    }
    const transformedMessages = messages.map((msg) => {
      // Cas d'un message fichier
      if (msg.file_name && msg.file_type) {
        return {
          ...msg,
          isFile: true,             // Indique que c'est un message fichier
          fileName: msg.file_name,    // Nom du fichier en clair
          filePath: msg.content,      // Le champ "content" contient ici le chemin en clair
          fileType: msg.file_type,    // Type en clair
        };
      } else {
        // Message texte : déchiffrer le contenu
        try {
          return { ...msg, content: decryptMessage(msg.content) };
        } catch (err) {
          console.error("❌ Erreur déchiffrement MP:", err.message);
          return { ...msg, content: "[Message non déchiffrable]" };
        }
      }
    });
    res.status(200).json({ success: true, messages: transformedMessages });
  } catch (error) {
    console.error("❌ Erreur récupération des messages:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

// ──────────────────────────────────────────────
// Mise à jour d'un message texte
// ──────────────────────────────────────────────
const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const senderId = req.user.id;
    if (!content) {
      return res.status(400).json({ error: "Le contenu du message est requis" });
    }
    const [message] = await pool.query(
      "SELECT sender_id FROM private_messages WHERE id = ?",
      [messageId]
    );
    if (!message.length || message[0].sender_id !== senderId) {
      return res.status(403).json({ error: "Non autorisé à modifier ce message" });
    }
    const encryptedContent = encryptMessage(content);
    await pool.query(
      "UPDATE private_messages SET content = ?, updated_at = NOW() WHERE id = ?",
      [encryptedContent, messageId]
    );
    const decryptedContent = decryptMessage(encryptedContent);
    req.io.emit("update private message", { messageId, content: decryptedContent });
    res.status(200).json({ success: true, message: "Message mis à jour !" });
  } catch (error) {
    console.error("❌ Erreur mise à jour MP:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ──────────────────────────────────────────────
// Suppression d'un message privé
// ──────────────────────────────────────────────
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const senderId = req.user.id;
    const [message] = await pool.query(
      "SELECT sender_id FROM private_messages WHERE id = ?",
      [messageId]
    );
    if (!message.length || message[0].sender_id !== senderId) {
      return res.status(403).json({ error: "Non autorisé à supprimer ce message" });
    }
    await pool.query("DELETE FROM private_messages WHERE id = ?", [messageId]);
    req.io.emit("delete private message", { messageId });
    res.status(200).json({ success: true, message: "Message supprimé !" });
  } catch (error) {
    console.error("❌ Erreur suppression MP:", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// ──────────────────────────────────────────────
// Envoyer un fichier par MP
// On stocke le fichier en clair et on insère en DB le nom et le chemin en clair.
// ──────────────────────────────────────────────
const sendFileMessage = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user?.id;
    if (!senderId || !receiverId) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Fichier non fourni" });
    }
    // Récupérer le buffer du fichier
    const fileBuffer = req.file.buffer;
    // Définir le dossier de stockage
    const uploadDir = path.join(__dirname, "../upload");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const savedFileName = `encrypted-${uniqueSuffix}-${req.file.originalname}`;
    const absoluteFilePath = path.join(uploadDir, savedFileName);
    fs.writeFileSync(absoluteFilePath, fileBuffer);
    // Construire le chemin relatif pour l'accès public
    const relativeFilePath = path.join("upload", savedFileName).replace(/\\/g, "/");
    // Déterminer le type MIME à l'aide de mime-types (si req.file.mimetype n'est pas défini)
    const fileType = req.file.mimetype || mime.lookup(req.file.originalname) || "unknown";
    // Insertion en DB : on stocke dans "content" le chemin en clair, et "file_name" le nom en clair
    const [result] = await pool.query(
      "INSERT INTO private_messages (sender_id, receiver_id, content, file_name, file_type) VALUES (?, ?, ?, ?, ?)",
      [senderId, receiverId, relativeFilePath, req.file.originalname, fileType]
    );
    const newFileMessage = {
      id: result.insertId,
      sender_id: senderId,
      receiver_id: receiverId,
      fileName: req.file.originalname,
      fileType: fileType,
      filePath: relativeFilePath,
      isFile: true,
      created_at: new Date().toISOString(),
    };
    res.status(201).json({ success: true, message: newFileMessage });
    req.io.emit("new private file", newFileMessage);
  } catch (error) {
    console.error("❌ Erreur envoi fichier MP:", error.message);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  sendFileMessage,
};
