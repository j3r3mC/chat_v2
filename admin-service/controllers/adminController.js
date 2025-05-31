const pool = require("../db");

// 🔥 Récupérer la liste des utilisateurs
exports.getUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT id, username, email, createdAt FROM users ORDER BY createdAt DESC
        `);
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 🔥 Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
