const pool = require("../db");
const jwt = require("jsonwebtoken");

// Fonction pour créer un canal avec un niveau d'accès ('public' ou 'private')
// Seuls les admins ou superadmins peuvent créer des canaux privés.
exports.createChannel = async (req, res) => {
  const { name, type, access } = req.body;

  // Validation minimale des champs
  if (!name || !type) {
    return res.status(400).json({ message: "Les champs 'name' et 'type' sont obligatoires" });
  }

  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Si le canal est privé, seuls les admins ou superadmins sont autorisés.
    if (access === "private" && (decoded.role !== "admin" && decoded.role !== "superadmin")) {
      return res.status(403).json({ message: "Accès refusé : Seuls les admins ou superadmins peuvent créer des canaux privés" });
    }
    
    // Utilise "public" par défaut si aucun accès n'est précisé.
    const channelAccess = access || "public";
    
    // Insertion dans la table 'channels' (les colonnes attendues sont : name, type et access)
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

// Fonction pour récupérer la liste des canaux, triée par date de création décroissante.
exports.getChannels = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM channels ORDER BY createdAt DESC");
    res.status(200).json(rows);
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des canaux :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Fonction pour attacher (inscrire) un utilisateur à un canal.
// Vérifie d'abord si l'utilisateur est authentifié et si le paramètre 'channelId' est valide.
// Si l'utilisateur est déjà inscrit, renvoie un message approprié.
exports.joinChannel = async (req, res) => {
  try {
    // Récupère le token dans les headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    let { channelId } = req.body;
    if (!channelId) {
      return res.status(400).json({ message: "Paramètre 'channelId' manquant" });
    }
    
    // Convertir channelId en entier (facultatif, mais recommandé)
    channelId = parseInt(channelId, 10);
    if (isNaN(channelId)) {
      return res.status(400).json({ message: "Paramètre 'channelId' invalide" });
    }
    
    // Vérifier si l'utilisateur est déjà inscrit au canal
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS count FROM channel_users WHERE channel_id = ? AND user_id = ?",
      [channelId, userId]
    );
    
    if (rows[0].count > 0) {
      return res.status(200).json({ message: "Déjà inscrit dans le canal" });
    }
    
    // Inscrire l'utilisateur en insérant la relation dans la table 'channel_users'
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
