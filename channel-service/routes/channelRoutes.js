const express = require("express");
const { createChannel, getChannels, joinChannel } = require("../controllers/channelController");
const verifyAdmin = require("../middleware/verifyAdmin");
const validateChannel = require("../middleware/validateChannel");

const router = express.Router();

// Route pour récupérer la liste des canaux
router.get("/all", getChannels);

// Route pour créer un nouveau canal (protégée : seuls les admins peuvent créer, avec validation des données)
router.post("/create", verifyAdmin, validateChannel, createChannel);

// Route pour rejoindre un canal (accessible pour tout utilisateur authentifié)
router.post("/join", joinChannel);

module.exports = router;
