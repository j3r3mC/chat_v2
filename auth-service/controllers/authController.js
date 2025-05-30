const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔹 Inscription standard (user ou superadmin)
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        // 🔍 Vérifications des champs
        if (!username || !email || !password) {
            console.warn("❌ Champs manquants lors de l'inscription");
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn(`❌ Email invalide fourni : ${email}`);
            return res.status(400).json({ message: "Email invalide" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 🔥 Vérification du superadmin unique
        if (role === "superadmin") {
            const [existingSuperadmin] = await pool.execute("SELECT id FROM users WHERE role = 'superadmin'");
            if (existingSuperadmin.length > 0) {
                console.warn("❌ Tentative de création d'un second superadmin");
                return res.status(403).json({ message: "Un superadmin existe déjà" });
            }
        }

        const assignedRole = role === "superadmin" ? "superadmin" : "user";

        await pool.execute("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
            [username, email, hashedPassword, assignedRole]);

        console.log(`✅ Inscription réussie pour ${username} en tant que ${assignedRole}`);
        res.status(201).json({ message: `Compte ${assignedRole} créé avec succès` });
    } catch (error) {
        console.error("❌ Erreur lors de l'inscription :", error);
        res.status(500).json({ message: "Erreur serveur lors de l'inscription", error: error.toString() });
    }
};

// 🔹 Connexion avec récupération du rôle
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (!username || !password) {
            console.warn("❌ Connexion échouée : Champs manquants");
            return res.status(400).json({ message: "Nom d'utilisateur et mot de passe requis" });
        }

        const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
        if (rows.length === 0) {
            console.warn(`❌ Connexion échouée : Identifiant inconnu (${username})`);
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn("❌ Connexion échouée : Mot de passe incorrect");
            return res.status(400).json({ message: "Identifiants invalides" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        console.log(`✅ Connexion réussie pour ${username}`);
        res.status(200).json({ token, userId: user.id, role: user.role });

    } catch (error) {
        console.error("❌ Erreur lors de la connexion :", error);
        res.status(500).json({ message: "Erreur serveur lors de la connexion", error: error.toString() });
    }
};

// 🔹 Déconnexion
exports.logout = async (req, res) => {
    try {
        console.log(`✅ Déconnexion réussie pour l'utilisateur ID: ${req.user?.id || "Inconnu"}`);
        res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
        console.error("❌ Erreur lors de la déconnexion :", error);
        res.status(500).json({ message: "Erreur serveur lors de la déconnexion", error: error.toString() });
    }
};

// 🔹 Inscription d'un admin via un superadmin
exports.registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // 🔍 Vérifications des champs
        if (!username || !email || !password) {
            console.warn("❌ Échec inscription admin : Champs manquants");
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.warn(`❌ Email invalide fourni : ${email}`);
            return res.status(400).json({ message: "Email invalide" });
        }

        const [existingUser] = await pool.execute("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            console.warn(`❌ Tentative d'inscription avec un email existant : ${email}`);
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute("INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
            [username, email, hashedPassword, "admin"]);

        console.log(`✅ Administrateur ${username} créé avec succès`);
        res.status(201).json({ message: "Administrateur créé avec succès" });

    } catch (error) {
        console.error("❌ Erreur lors de la création de l'admin :", error);
        res.status(500).json({ message: "Erreur serveur lors de la création de l'admin", error: error.toString() });
    }
};
