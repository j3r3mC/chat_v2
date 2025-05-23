const pool = require('../db');
const jwt = require('jsonwebtoken');

// Fonction pour créer un nouveau canal
exports.createChannel = async (req, res) => {
    console.log("✅ Requête reçue :", req.body);

    const { name, type } = req.body;

    try {
        // Vérification du token
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Accès refusé : Token requis" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifie que l'utilisateur est bien admin
        if (!decoded || decoded.role !== "admin") {
            return res.status(403).json({ message: "Accès refusé : Seuls les admins peuvent créer un canal" });
        }
        console.log("✅ Requête reçue :", req.body);


        // Validation des données
        if (!name || !type) {
            return res.status(400).json({ message: "Le nom et le type du canal sont requis" });
        }

        if (typeof name !== "string" || typeof type !== "string") {
            return res.status(400).json({ message: "Le nom et le type doivent être des chaînes de caractères" });
        }

        const [result] = await pool.execute('INSERT INTO channels (name, type) VALUES (?, ?)', [name, type]);

        const newChannel = {
            id: result.insertId,
            name,
            type,
            createdAt: new Date()
        };

        console.log("✅ Canal créé :", newChannel);
        res.status(201).json({ message: "Canal créé avec succès", channel: newChannel });

    } catch (error) {
        console.error("❌ Erreur lors de la création du canal :", error);
        res.status(500).json({ message: "Erreur serveur lors de la création du canal" });
    }
};

// Fonction pour récupérer tous les channels
exports.getChannels = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM channels ORDER BY createdAt DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des channels :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

