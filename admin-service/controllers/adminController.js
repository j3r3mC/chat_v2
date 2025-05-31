const pool = require("../db");

// 🔥 Récupérer la liste des utilisateurs
exports.getUsers = async (req, res) => {
    try {
        console.log("🔍 Requête SQL getUsers exécutée...");
        const [users] = await pool.query(`
            SELECT id, username, email, createdAt FROM users ORDER BY createdAt DESC
        `);
        console.log("✅ Utilisateurs récupérés :", users);
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des utilisateurs :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// 🔥 Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    console.log("🗑️ Tentative de suppression de l'utilisateur ID :", id);

    // Vérification que l'id est bien un entier
    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ message: "ID invalide" });
    }

    try {
        const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            console.log("⚠️ Aucun utilisateur trouvé avec cet ID :", id);
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        console.log("✅ Utilisateur supprimé avec succès :", id);
        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        console.error("❌ Erreur lors de la suppression de l'utilisateur :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
