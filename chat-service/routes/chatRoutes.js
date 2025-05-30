const express = require("express");
const { sendMessage, getMessages } = require("../controllers/chatController");
const verifyToken = require("../middleware/authMiddleware");
const validateMessage = require("../middleware/validateMessage");

const router = express.Router();

// 📌 Route pour envoyer un message (protégée par JWT et validation)
router.post("/message", verifyToken, validateMessage, sendMessage);

// 📌 Route pour récupérer les messages d'un canal (protégée par JWT)
router.get("/messages/:channel_id", verifyToken, getMessages);

module.exports = router;
