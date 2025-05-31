module.exports = (req, res, next) => {
    const { name, type } = req.body;

    if (!name || !type) {
        return res.status(400).json({ message: "Le nom et le type du canal sont requis" });
    }

    if (typeof name !== "string" || typeof type !== "string") {
        return res.status(400).json({ message: "Le nom et le type doivent être des chaînes de caractères" });
    }

    next();
};
