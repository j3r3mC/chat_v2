const pool = require("../db");

exports.sendMessage = async (req, res) => {
  try {
    // Extraction des données depuis le body (validateMessage doit avoir déjà validé ces champs)
    const { content, channel_id } = req.body;
    // L'authMiddleware doit définir req.user (exemple : { id: 1, username: "monUser", ... })
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    const user_id = req.user.id;

    // Insertion du message dans la base de données
    const [result] = await pool.query(
      "INSERT INTO messages (content, user_id, channel_id) VALUES (?, ?, ?)",
      [content, user_id, channel_id]
    );
    const messageId = result.insertId;

    // Récupération des informations du message inséré (par exemple, l'heure d'envoi et le nom d'utilisateur)
    const [messageRows] = await pool.query(
      `SELECT messages.createdAt AS created_at, users.username 
       FROM messages 
       JOIN users ON messages.user_id = users.id 
       WHERE messages.id = ?`,
      [messageId]
    );

    const newMessage = {
      id: messageId,
      content,
      username: messageRows[0].username,
      channel_id,
      created_at: messageRows[0].created_at
    };

    // Récupération de l'instance Socket.IO pour émettre le message vers le salon approprié
    const io = req.app.get("socketio");
    console.log("📢 WebSocket - envoi du message :", newMessage);
    io.to(`channel-${channel_id}`).emit("chat message", newMessage);

    // Renvoi du message en JSON au client
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi du message :", error);
    res.status(500).json({ message: "Erreur serveur", error: error.toString() });
  }
};

exports.getMessages = async (req, res) => {
  try {
    // Extraction du channel_id depuis les paramètres d'URL
    const { channel_id } = req.params;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    const user_id = req.user.id;

    // Vérifier que l'utilisateur appartient bien au canal
    const [access] = await pool.query(
      `SELECT COUNT(*) AS authorized 
       FROM channel_users 
       WHERE user_id = ? AND channel_id = ?`,
      [user_id, channel_id]
    );
    if (access[0].authorized === 0) {
      return res.status(403).json({ message: "Accès refusé : Vous n'appartenez pas à ce canal" });
    }

    // Récupération de tous les messages du canal en ordre chronologique
    const [messages] = await pool.query(
      `SELECT messages.id, messages.content, messages.createdAt AS created_at, users.username
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
