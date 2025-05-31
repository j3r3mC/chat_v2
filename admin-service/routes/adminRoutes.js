const express = require("express");
const { getUsers, deleteUser } = require("../controllers/adminController");
const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// 🔗 Récupérer tous les utilisateurs
router.get("/users", verifyAdmin, getUsers);

// 🔗 Supprimer un utilisateur
router.delete("/user/:id", verifyAdmin, deleteUser);

module.exports = router;
