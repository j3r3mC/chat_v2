const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        // Vérification des champs obligatoires
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        // Vérification du format de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email invalide' });
        }

        // Vérification si l'utilisateur existe déjà
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Définir le rôle : soit celui fourni, soit 'user' par défaut
        const userRole = role && ['user', 'admin', 'superadmin'].includes(role) ? role : 'user';

        // Insérer l'utilisateur avec le rôle défini
        await pool.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
            [username, email, hashedPassword, userRole]
        );

        res.status(201).json({ message: `Utilisateur créé avec succès (rôle : ${userRole})` });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }

        const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        const user = rows[0];

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        // Création du token JWT
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({ token });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
    }
};

exports.logout = async (req, res) => {
    try {
        res.status(200).json({ message: 'Déconnexion réussie' });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la déconnexion' });
    }
};

// Vérification du rôle SuperAdmin avant de créer un admin
exports.registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        // Vérifier que l'utilisateur est superadmin
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(403).json({ message: "Accès refusé, aucun token." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.execute("SELECT role FROM users WHERE id = ?", [decoded.id]);

        if (rows.length === 0 || rows[0].role !== 'superadmin') {
            return res.status(403).json({ message: "Accès refusé, vous n'êtes pas superadmin." });
        }

        // Vérification des champs obligatoires
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        // Vérification du format de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Email invalide' });
        }

        // Vérification si l'email est déjà utilisé
        const [existingUser] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insérer l'administrateur avec le rôle "admin"
        await pool.execute('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', 
            [username, email, hashedPassword, 'admin']
        );

        res.status(201).json({ message: 'Administrateur créé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la création de l\'admin:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création de l\'admin' });
    }
};
