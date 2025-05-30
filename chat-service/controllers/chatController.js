const pool = require("../db");

exports.sendMessage = async (req, res) => {
    try {
        const { content, channel_id } = req.body;
        const user_id = req.user.id;

        const [result] = await pool.query(
            "INSERT INTO messages (content, user_id, channel_id) VALUES (?, ?, ?)",
            [content, user_id, channel_id]
        );

        const messageId = result.insertId;
        const [messageRows] = await pool.query(`
            SELECT messages.createdAt AS created_at, users.username 
            FROM messages 
            JOIN users ON messages.user_id = users.id 
            WHERE messages.id = ?
        `, [messageId]);

        const newMessage = {
            id: messageId,
            content,
            username: messageRows[0].username,
            channel_id,
            created_at: messageRows[0].created_at
        };

const io = req.app.get("socketio");
console.log(`📢 WebSocket doit envoyer ce message :`, newMessage); // ✅ Affichage du message
io.to(`channel-${channel_id}`).emit("chat message", newMessage); // 🔥 Change "message received" en "chat message"



        res.status(201).json(newMessage);
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi du message :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.toString() });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { channel_id } = req.params;

        const [messages] = await pool.query(`
            SELECT messages.id, messages.content, messages.createdAt AS created_at, users.username
            FROM messages
            JOIN users ON messages.user_id = users.id
            WHERE messages.channel_id = ?
            ORDER BY messages.createdAt ASC
        `, [channel_id]);

        res.status(200).json(messages);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des messages :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.toString() });
    }
};
