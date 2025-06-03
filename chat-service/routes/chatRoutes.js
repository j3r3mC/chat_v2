const express = require("express");
const upload = require("../config/multerConfig"); // ✅ Import de la configuration Multer
const { sendMessage, getMessages, deleteMessage, updateMessage, uploadFile } = require("../controllers/chatController"); // ✅ Assurez-vous que toutes les fonctions sont bien importées
const verifyToken = require("../middleware/authMiddleware");
const validateMessage = require("../middleware/validateMessage");
const verifyAuthor = require("../middleware/verifyAuthor");

const router = express.Router();

router.post("/message", verifyToken, validateMessage, sendMessage);
router.get("/messages/:channel_id", verifyToken, getMessages);
router.put("/message/:id", verifyToken, verifyAuthor, updateMessage);
router.delete("/message/:id", verifyToken, deleteMessage);
router.post("/upload", verifyToken, upload.single("file"), uploadFile); // ✅ Route pour l'upload des fichiers

module.exports = router;
