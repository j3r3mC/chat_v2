const express = require("express");
const router = express.Router();
const privateMessageController = require("../controllers/privateMessageController");
const authMiddleware = require("../middleware/authMiddleware");

// 📩 Envoi de messages privés
router.post("/send", authMiddleware, privateMessageController.sendMessage);

// 📩 Récupération des messages d’une conversation
router.get("/get/:roomId", authMiddleware, privateMessageController.getMessages);

// 📩 Récupération de la liste des conversations privées
router.get("/conversations", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await privateMessageController.getPrivateConversations(userId);
    res.json({ success: true, conversations });
  } catch (error) {
    console.error("❌ Erreur récupération MP :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// ✏ Modifier un MP
router.put("/update/:messageId", authMiddleware, privateMessageController.updateMessage);

// 🗑 Supprimer un MP
router.delete("/delete/:messageId", authMiddleware, privateMessageController.deleteMessage);

module.exports = router;
