const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Accès refusé : Token requis" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || decoded.role !== "admin") {
            return res.status(403).json({ message: "Accès refusé : Seuls les admins peuvent gérer les canaux" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Erreur de vérification du token admin :", error);
        res.status(403).json({ message: "Token invalide ou non admin" });
    }
};
