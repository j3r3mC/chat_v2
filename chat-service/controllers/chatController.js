const pool = require("../db");

exports.sendMessage = async (req, res) => {
  try {
    const { content, channel_id } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    const user_id = req.user.id;

    // ✅ Enregistrement du message dans la base de données
    const [result] = await pool.query(
      "INSERT INTO messages (content, user_id, channel_id) VALUES (?, ?, ?)",
      [content, user_id, channel_id]
    );
    const messageId = result.insertId;

    // ✅ Récupération du message avec `user_id`
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
      user_id, // ✅ Ajout de `user_id`
      channel_id,
      created_at: messageRows[0].created_at
    };

    const io = req.app.get("socketio");
    console.log("📢 WebSocket - Envoi du message avec user_id :", newMessage);
    io.to(`channel-${channel_id}`).emit("chat message", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { channel_id } = req.params;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    // ✅ Modification : Ajout de `user_id` dans la récupération des messages
    const [messages] = await pool.query(
      `SELECT messages.id, messages.content, messages.createdAt AS created_at, users.username, messages.user_id
       FROM messages
       JOIN users ON messages.user_id = users.id
       WHERE messages.channel_id = ?
       ORDER BY messages.createdAt ASC`,
      [channel_id]
    );

    console.log("📥 Messages envoyés à ChatRoom.js :", messages); // ✅ Vérification console

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des messages :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};

exports.deleteMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const [messageInfo] = await pool.query("SELECT channel_id FROM messages WHERE id = ?", [id]);
    if (!messageInfo.length) return res.status(404).json({ message: "Message introuvable" });
    const channelId = messageInfo[0].channel_id;

    const [result] = await pool.query("DELETE FROM messages WHERE id = ?", [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Message introuvable" });

    res.status(200).json({ message: "Message supprimé" });

    const io = req.app.get("socketio");
    console.log(`🗑️ WebSocket - Suppression du message ID ${id} dans channel-${channelId}`);
    io.to(`channel-${channelId}`).emit("delete message", { messageId: id });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du message :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};

exports.deleteAllMessages = async (req, res) => {
  const { channel_id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM messages WHERE channel_id = ?", [channel_id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Aucun message trouvé" });
    res.status(200).json({ message: "Tous les messages du canal supprimés" });

    const io = req.app.get("socketio");
    console.log(`🗑️ WebSocket - Suppression de tous les messages pour channel-${channel_id}`);
    io.to(`channel-${channel_id}`).emit("delete all messages", { channelId: channel_id });
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des messages :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};
