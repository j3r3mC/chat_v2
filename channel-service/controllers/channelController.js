const pool = require("../db");
const jwt = require("jsonwebtoken");

// 🔥 Créer un channel (seuls les admins/superadmins peuvent créer des canaux privés)
exports.createChannel = async (req, res) => {
    const { name, type, access } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: "Les champs 'name' et 'type' sont obligatoires" });
    }

    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Non authentifié" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (access === "private" && (decoded.role !== "admin" && decoded.role !== "superadmin")) {
            return res.status(403).json({ message: "Accès refusé : Seuls les admins ou superadmins peuvent créer des canaux privés" });
        }
        
        const channelAccess = access || "public";

        const [result] = await pool.execute(
            "INSERT INTO channels (name, type, access) VALUES (?, ?, ?)",
            [name, type, channelAccess]
        );
        
        res.status(201).json({ 
            message: "Canal créé avec succès", 
            channel: { id: result.insertId, name, type, access: channelAccess }
        });

    } catch (error) {
        console.error("❌ Erreur dans createChannel :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 🔥 Récupérer la liste des channels
exports.getChannels = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM channels ORDER BY createdAt DESC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des canaux :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 🔥 Rejoindre un canal (ajout de l’utilisateur dans channel_users)
exports.joinChannel = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Token manquant" });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        let { channelId } = req.body;
        if (!channelId || isNaN(parseInt(channelId, 10))) {
            return res.status(400).json({ message: "Paramètre 'channelId' invalide" });
        }

        const [rows] = await pool.query(
            "SELECT COUNT(*) AS count FROM channel_users WHERE channel_id = ? AND user_id = ?",
            [channelId, userId]
        );
        
        if (rows[0].count > 0) {
            return res.status(200).json({ message: "Déjà inscrit dans le canal" });
        }

        await pool.execute(
            "INSERT INTO channel_users (channel_id, user_id) VALUES (?, ?)",
            [channelId, userId]
        );
        
        return res.status(201).json({ message: "Utilisateur ajouté au canal avec succès" });

    } catch (error) {
        console.error("❌ Erreur dans joinChannel :", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
};

// 🔥 Supprimer un channel (accessible uniquement aux admins)
exports.deleteChannel = async (req, res) => {
    const { id } = req.params;
    console.log("🗑️ Tentative de suppression du channel ID :", id);

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: "ID invalide" });
    }

    try {
        const [result] = await pool.query("DELETE FROM channels WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            console.log("⚠️ Aucun channel trouvé avec cet ID :", id);
            return res.status(404).json({ message: "Channel introuvable" });
        }

        console.log("✅ Channel supprimé avec succès :", id);
        res.status(200).json({ message: "Channel supprimé avec succès" });

    } catch (error) {
        console.error("❌ Erreur lors de la suppression du channel :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
