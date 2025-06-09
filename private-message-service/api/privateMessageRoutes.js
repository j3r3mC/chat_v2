const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
} = require("../controllers/privateMessageController");
const authMiddleware = require("../middleware/authMiddleware");

// Route pour envoyer un message privé
router.post("/send", authMiddleware, sendMessage);

// Route pour récupérer les messages d'une conversation
router.get("/get/:roomId", authMiddleware, getMessages);

// Route pour mettre à jour un message privé
router.put("/update/:messageId", authMiddleware, updateMessage);

// Route pour supprimer un message privé
router.delete("/delete/:messageId", authMiddleware, deleteMessage);

module.exports = router;
