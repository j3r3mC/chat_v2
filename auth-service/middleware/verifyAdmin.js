const jwt = require("jsonwebtoken");
const pool = require("../db");

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(403).json({ message: "Accès refusé, aucun token." });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.execute("SELECT role FROM users WHERE id = ?", [decoded.id]);

        if (rows.length === 0 || rows[0].role !== 'superadmin') {
            return res.status(403).json({ message: "Accès refusé, vous n'êtes pas superadmin." });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Erreur lors de la vérification du superadmin :", error);
        res.status(500).json({ message: "Erreur serveur lors de la vérification du superadmin." });
    }
};
