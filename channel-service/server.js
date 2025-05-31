require("dotenv").config();
const express = require("express");
const cors = require("cors");
const channelRoutes = require("./routes/channelRoutes");

const app = express();
app.use(express.json());
app.use(cors()); // Autorise les requêtes entre services

// Monte les routes à la racine
// Ainsi, une requête pour "/all" (après réécriture par l'API Gateway) sera correctement traitée.
app.use("/", channelRoutes);

// Middleware de débogage pour afficher les requêtes entrantes
app.use((req, res, next) => {
  console.log(`🔍 Channel-Service reçoit : ${req.method} ${req.url}`);
  console.log(`📩 Headers :`, req.headers);
  next();
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`✅ Channel-Service en écoute sur le port ${PORT}`));
