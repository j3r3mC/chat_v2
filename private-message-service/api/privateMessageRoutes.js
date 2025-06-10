const express = require("express");
const multer = require("multer");
const router = express.Router();

// Utilisation de memoryStorage pour récupérer le fichier en mémoire
const upload = multer({ storage: multer.memoryStorage() });

const {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  sendFileMessage,
  getConversations,
} = require("../controllers/privateMessageController");

const authMiddleware = require("../middleware/authMiddleware");

// Route pour envoyer un message privé texte
router.post("/send", authMiddleware, sendMessage);

// Route pour envoyer un fichier en message privé
router.post("/send-file", authMiddleware, upload.single("file"), sendFileMessage);

// Route pour récupérer les messages d'une conversation
router.get("/get/:roomId", authMiddleware, getMessages);

// Route pour mettre à jour un message privé
router.put("/update/:messageId", authMiddleware, updateMessage);

// Route pour supprimer un message privé
router.delete("/delete/:messageId", authMiddleware, deleteMessage);
// Route pour récupérer les conversations privées
router.get("/conversations", authMiddleware, getConversations);

module.exports = router;
