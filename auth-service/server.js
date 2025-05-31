require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");

const app = express();

// 🔥 Middleware pour gérer les requêtes JSON
app.use(cors()); // Autorise les requêtes du frontend
app.use(bodyParser.json({ limit: "10mb" })); // ✅ Assure une bonne lecture du JSON

// 🔍 Debug : Voir les requêtes qui arrivent
app.use((req, res, next) => {
    console.log(`🔍 Requête API Auth : ${req.method} ${req.url}`);
    console.log(`📩 Headers :`, req.headers);
    console.log(`📥 Body :`, req.body);
    next();
});

// 🔗 Routes pour l'authentification
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Auth-Service en écoute sur le port ${PORT}`);
});
