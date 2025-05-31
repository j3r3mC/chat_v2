require("dotenv").config();
const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(express.json());
app.use(cors()); // 🔥 Autorise les requêtes entre services

// 🔗 Routes du service admin
app.use("/admin", adminRoutes);

const PORT = process.env.ADMIN_PORT || 3003;
app.listen(PORT, () => console.log(`✅ Admin-Service en écoute sur le port ${PORT}`));
