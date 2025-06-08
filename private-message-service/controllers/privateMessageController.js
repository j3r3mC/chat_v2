const pool = require("../db/db"); // 🔥 Vérifie que le chemin vers ta DB est correct
const { encryptMessage, decryptMessage } = require("../security/cryptoUtils");

// 🚀 **Envoyer un message privé**
const sendMessage = async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user?.id; // 🔥 Ajout de protection contre une valeur `undefined`

        if (!senderId || !receiverId || !message) {
            return res.status(400).json({ error: "Tous les champs sont requis" });
        }

        const encryptedMessage = encryptMessage(message); // 🔥 Retrait du `await`, car `encryptMessage` est une fonction synchrone

        const [result] = await pool.query(
            "INSERT INTO private_messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
            [senderId, receiverId, encryptedMessage]
        );

        res.status(201).json({ 
            success: true, 
            message: {
                id: result.insertId,
                sender_id: senderId,
                receiver_id: receiverId,
                content: message,
                created_at: new Date().toISOString(),
            } 
        });

    } catch (error) {
        console.error("❌ Erreur envoi MP :", error.message);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// 🚀 **Récupérer les messages privés**
const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        console.log("🔍 Room ID reçu :", roomId);

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

        // 🔥 Protection contre les erreurs de déchiffrement
        const decryptedMessages = messages.map(msg => {
            try {
                return { ...msg, content: decryptMessage(msg.content) };
            } catch (err) {
                console.error("❌ Erreur déchiffrement MP :", err.message);
                return { ...msg, content: "[Message non déchiffrable]" };
            }
        });

        res.status(200).json({ success: true, messages: decryptedMessages });

    } catch (error) {
        console.error("❌ Erreur récupération des messages :", error.message);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// 🚀 **Récupérer la liste des conversations privées**
const getPrivateConversations = async (userId) => {
    try {
        if (!userId) {
            throw new Error("userId est requis");
        }

        const [conversations] = await pool.query(`
            SELECT DISTINCT u.id AS interlocutorId, u.username AS interlocutorName
            FROM private_messages pm
            JOIN users u ON (pm.sender_id = u.id OR pm.receiver_id = u.id)
            WHERE (pm.sender_id = ? OR pm.receiver_id = ?)
            AND u.id != ?
        `, [userId, userId, userId]);

        return conversations;

    } catch (error) {
        console.error("❌ Erreur récupération des conversations MP :", error);
        throw error;
    }
};
const updateMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const senderId = req.user.id;

        if (!content) {
            return res.status(400).json({ error: "Le contenu du message est requis" });
        }

        const [message] = await pool.query("SELECT sender_id FROM private_messages WHERE id = ?", [messageId]);

        if (!message.length || message[0].sender_id !== senderId) {
            return res.status(403).json({ error: "Non autorisé à modifier ce message" });
        }

        const encryptedContent = encryptMessage(content);
        await pool.query("UPDATE private_messages SET content = ?, updated_at = NOW() WHERE id = ?", [encryptedContent, messageId]);

        req.io.emit("messageUpdated", { messageId, content }); // 🔥 Mise à jour en temps réel

        res.status(200).json({ success: true, message: "Message mis à jour !" });
    } catch (error) {
        console.error("❌ Erreur mise à jour MP :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const senderId = req.user.id;

        const [message] = await pool.query("SELECT sender_id FROM private_messages WHERE id = ?", [messageId]);

        if (!message.length || message[0].sender_id !== senderId) {
            return res.status(403).json({ error: "Non autorisé à supprimer ce message" });
        }

        await pool.query("DELETE FROM private_messages WHERE id = ?", [messageId]);

        req.io.emit("messageDeleted", messageId); // 🔥 Suppression en temps réel

        res.status(200).json({ success: true, message: "Message supprimé !" });
    } catch (error) {
        console.error("❌ Erreur suppression MP :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

module.exports = { sendMessage, getMessages, updateMessage, deleteMessage, getPrivateConversations };

