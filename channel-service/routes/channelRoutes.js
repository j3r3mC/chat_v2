const express = require("express");
const { createChannel, getChannels, joinChannel, deleteChannel } = require("../controllers/channelController");
const verifyAdmin = require("../middleware/verifyAdmin");
const validateChannel = require("../middleware/validateChannel");

const router = express.Router();

// Liste des channels (accessible à tous)
router.get("/all", getChannels);

// Création d'un channel (réservé aux admins)
router.post("/create", verifyAdmin, validateChannel, createChannel);

// 🔥 Suppression d'un channel (réservé aux admins)
router.delete("/channel/:id", verifyAdmin, deleteChannel);

// Rejoindre un channel (accessible à tous les utilisateurs authentifiés)
router.post("/join", joinChannel);

module.exports = router;
