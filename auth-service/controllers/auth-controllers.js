const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, email, password} = req.body;
    try{
        //hachage du mot de passe
        const hashedpassword = await bcrypt.hash(password, 10);
        //insertion de l'utilisateur dans la base de données
        await pool.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedpassword]);
        req.res.status(201).json({ message: 'Utilisateur créer avec succès' });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
}
