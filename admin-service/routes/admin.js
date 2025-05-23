// admin-service/routes/admin.js
const express = require('express');
const router = express.Router();
const { createChannel } = require('../controllers/adminController');
const { getChannels } = require('../controllers/adminController'); // Importe la fonction

router.post('/channel', createChannel);
router.get('/channels', getChannels); // Ajoute la route GET

module.exports = router;
