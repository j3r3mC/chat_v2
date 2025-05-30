module.exports = (req, res, next) => {
    const { content, channel_id } = req.body;

    if (!content || !channel_id) {
        return res.status(400).json({ message: "Le contenu et le canal sont requis" });
    }

    if (content.length > 500) {
        return res.status(400).json({ message: "Le message est trop long (max 500 caractères)" });
    }

    next();
};
