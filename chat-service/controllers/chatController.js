const pool = require("../db");

// ✅ Upload de fichier sans Multer ici
module.exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier envoyé" });
    }

    const { channel_id } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const user_id = req.user.id;
    const filePath = `/uploads/${req.file.filename}`;

    const [result] = await pool.query(
      "INSERT INTO messages (file_url, user_id, channel_id) VALUES (?, ?, ?)",
      [filePath, user_id, channel_id]
    );

    console.log("✅ Fichier reçu :", req.file);
    console.log("✅ Taille :", req.file.size);
    console.log("✅ Mime type :", req.file.mimetype);

    const newMessage = {
      id: result.insertId,
      file_url: filePath,
      user_id,
      channel_id,
      created_at: new Date().toISOString(),
    };

    const io = req.app.get("socketio");
    io.to(`channel-${channel_id}`).emit("file message", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Erreur lors de l'upload du fichier :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};

// ✅ Envoi de message
module.exports.sendMessage = async (req, res) => {
  try {
    const { content, channel_id } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    const user_id = req.user.id;

    const [result] = await pool.query(
      "INSERT INTO messages (content, user_id, channel_id) VALUES (?, ?, ?)",
      [content, user_id, channel_id]
    );
    const messageId = result.insertId;

    const [messageRows] = await pool.query(
      `SELECT messages.id, messages.content, messages.createdAt AS created_at, users.username, messages.user_id
       FROM messages
       JOIN users ON messages.user_id = users.id
       WHERE messages.id = ?`,
      [messageId]
    );

    const newMessage = {
      id: messageId,
      content,
      username: messageRows[0].username,
      user_id,
      channel_id,
      created_at: messageRows[0].created_at
    };

    const io = req.app.get("socketio");
    io.to(`channel-${channel_id}`).emit("chat message", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};

// ✅ Récupération des messages
module.exports.getMessages = async (req, res) => {
  try {
    const { channel_id } = req.params;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const [messages] = await pool.query(
      `SELECT messages.id, messages.content, messages.file_url, messages.createdAt AS created_at, users.username, messages.user_id
       FROM messages
       JOIN users ON messages.user_id = users.id
       WHERE messages.channel_id = ?
       ORDER BY messages.createdAt ASC`,
      [channel_id]
    );

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des messages :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};

// ✅ Mise à jour d'un message
module.exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const user_id = req.user.id;

    const [messageInfo] = await pool.query("SELECT user_id, channel_id FROM messages WHERE id = ?", [id]);
    if (!messageInfo.length) {
      return res.status(404).json({ message: "Message introuvable" });
    }

    if (messageInfo[0].user_id !== user_id) {
      return res.status(403).json({ message: "Non autorisé à modifier ce message" });
    }

    await pool.query("UPDATE messages SET content = ?, updated_at = NOW() WHERE id = ?", [content, id]);

    const updatedMessage = {
      id,
      content,
      user_id,
      channel_id: messageInfo[0].channel_id,
      updated_at: new Date().toISOString(),
    };

    const io = req.app.get("socketio");
    io.to(`channel-${updatedMessage.channel_id}`).emit("update message", updatedMessage);

    res.status(200).json(updatedMessage);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du message :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};

// ✅ Suppression d'un message
module.exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const [messageInfo] = await pool.query("SELECT channel_id FROM messages WHERE id = ?", [id]);
    if (!messageInfo.length) return res.status(404).json({ message: "Message introuvable" });

    const [result] = await pool.query("DELETE FROM messages WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Message introuvable" });

    res.status(200).json({ message: "Message supprimé" });

    const io = req.app.get("socketio");
    io.to(`channel-${messageInfo[0].channel_id}`).emit("delete message", { messageId: id });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du message :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};

