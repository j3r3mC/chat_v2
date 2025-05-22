// admin-service/routes/admin.js
const express = require('express');
const router = express.Router();
const { createChannel } = require('../controllers/adminController');

router.post('/channels', createChannel);

module.exports = router;
