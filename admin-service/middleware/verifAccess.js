const jwt = require("jsonwebtoken");

const verifyAccess = (allowAllUsers = false) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Accès refusé : Token requis" });
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            // 🔥 Autoriser tous les utilisateurs si `allowAllUsers` est vrai
            if (allowAllUsers) return next();

            // 🔥 Sinon, restreindre aux admins uniquement
            if (decoded.role !== "admin") {
                return res.status(403).json({ message: "Accès refusé : Admin requis" });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: "Token invalide" });
        }
    };
};

module.exports = verifyAccess;
