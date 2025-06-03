const express = require("express");
const { sendMessage, getMessages, deleteMessage, updateMessage } = require("../controllers/chatController");
const verifyToken = require("../middleware/authMiddleware");
const validateMessage = require("../middleware/validateMessage");
const verifyAuthor = require("../middleware/verifyAuthor");

const router = express.Router();

router.post("/message", verifyToken, validateMessage, sendMessage);
router.get("/messages/:channel_id", verifyToken, getMessages);
router.put("/message/:id", verifyToken, verifyAuthor, updateMessage);
router.delete("/message/:id", verifyToken, deleteMessage);

module.exports = router;
