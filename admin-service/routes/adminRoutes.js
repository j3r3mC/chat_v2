const express = require("express");
const { getUsers, deleteUser } = require("../controllers/adminController");
const verifyAccess = require("../middleware/verifAccess");
const router = express.Router();

// ✅ Accessible à tous les utilisateurs (allowAllUsers = true)
router.get("/users", verifyAccess(true), getUsers);

// 🔥 Accessible uniquement aux admins (par défaut)
router.delete("/user/:id", verifyAccess(), deleteUser);

module.exports = router;
