const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Accès refusé : Token manquant" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(`🔍 JWT décodé :`, decoded);

        next();
    } catch (error) {
        return res.status(403).json({ error: "Accès refusé : Token invalide" });
    }
};

module.exports = authMiddleware;
