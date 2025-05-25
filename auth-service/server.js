// auth-service/server.js
require('dotenv').config();
const express = require('express');
const authroutes = require('./routes/auth');

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors()); // 🔥 Autorise les requêtes du frontend

//routes pour l'authentification
app.use('/api/auth', authroutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT,'0.0.0.0',  () => {
    console.log(`Auth service is running on port ${PORT}`);
});