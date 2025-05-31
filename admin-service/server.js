require("dotenv").config();
const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// 🚀 Activation des middleware
app.use(cors());  // Autorisation des requêtes cross-origin
app.use(express.json());  // Parsing du JSON

// 🔗 Montée des routes admin
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`✅ Admin-Service en écoute sur le port ${PORT}`));
