require('dotenv').config();
console.log(process.env.PORT); // Vérification des variables d'environnement

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pool = require('./db');

const app = express();
app.use(express.json()); // Permet de lire le body JSON dans les requêtes

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// 📌 Route REST pour envoyer un message
app.post('/chat/message', async (req, res) => {
    const { content, user_id } = req.body; // Correction ici (user → user_id)

    if (!content || !user_id) {
        return res.status(400).json({ message: "Le contenu et l'utilisateur sont requis" });
    }

    try {
        const [result] = await pool.query('INSERT INTO messages (content, user_id) VALUES (?, ?)', [content, user_id]);

        const newMessage = {
            id: result.insertId,
            content,
            user_id,
            created_at: new Date(),
        };

        // Diffuser le message via WebSocket
        io.emit('chat message', newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement du message :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 📌 Route REST pour récupérer les messages
app.get('/chat/messages', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM messages ORDER BY createdAt ASC LIMIT 50');
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des messages :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 📌 Gestion de WebSocket
io.on('connection', async (socket) => {
    console.log('Nouvelle connexion client');

    // Envoyer l'historique des messages
    try {
        const [rows] = await pool.query('SELECT * FROM messages ORDER BY createdAt ASC LIMIT 50');
        socket.emit('chat history', rows);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération de l'historique :", error);
    }

    // Réception et diffusion des messages via WebSocket
    socket.on('chat message', async (msg) => {
        try {
            if (!msg.content || !msg.user_id) {
                console.error("❌ Message invalide :", msg);
                return;
            }

            const [result] = await pool.query(
                'INSERT INTO messages (content, user_id) VALUES (?, ?)',
                [msg.content, msg.user_id]
            );

            const newMessage = {
                id: result.insertId,
                content: msg.content,
                user_id: msg.user_id,
                created_at: new Date(),
            };

            // Diffuser le message à tous les clients
            io.emit('chat message', newMessage);
        } catch (error) {
            console.error("❌ Erreur lors de l'envoi du message :", error);
        }
    });

    // Gestion de la déconnexion
    socket.on('disconnect', () => {
        console.log('Client déconnecté');
    });
});

// 📌 Démarrer le serveur
const PORT = process.env.PORT || 3002;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Serveur de chat en écoute sur le port ${PORT}`);
});
