const express = require("express");
const { sendMessage, getMessages, deleteMessage, deleteAllMessages } = require("../controllers/chatController");
const verifyToken = require("../middleware/authMiddleware");
const validateMessage = require("../middleware/validateMessage");

const router = express.Router();

router.post("/message", verifyToken, validateMessage, sendMessage);
router.get("/messages/:channel_id", verifyToken, getMessages);

// Ces routes n'étaient peut-être pas définies :
router.delete("/message/:id", verifyToken, deleteMessage);
router.delete("/messages/channel/:channel_id", verifyToken, deleteAllMessages);

module.exports = router;
