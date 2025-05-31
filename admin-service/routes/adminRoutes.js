const express = require("express");
const { getUsers, deleteUser } = require("../controllers/adminController");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// 🔥 Sécurité : Vérifier que les fonctions existent
if (!getUsers || !deleteUser) {
    console.error("❌ Erreur : Les contrôleurs admin ne sont pas bien importés !");
}

// 🔗 Récupérer tous les utilisateurs
router.get("/users", verifyAdmin, async (req, res) => {
    try {
        await getUsers(req, res);
    } catch (error) {
        console.error("❌ Erreur dans /users :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// 🔗 Supprimer un utilisateur
router.delete("/user/:id", verifyAdmin, async (req, res) => {
    try {
        await deleteUser(req, res);
    } catch (error) {
        console.error("❌ Erreur dans /user/:id :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
