const pool = require("../db");

module.exports = async (req, res, next) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Vérifier l'auteur du message
    const [messageInfo] = await pool.query("SELECT user_id FROM messages WHERE id = ?", [id]);
    if (!messageInfo.length) return res.status(404).json({ message: "Message introuvable" });

    const messageAuthor = messageInfo[0].user_id;

    if (messageAuthor !== user_id) {
      return res.status(403).json({ message: "Non autorisé à modifier ou supprimer ce message" });
    }

    next(); // ✅ L'utilisateur est bien l'auteur, on continue
  } catch (error) {
    console.error("❌ Erreur de vérification de l'auteur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
