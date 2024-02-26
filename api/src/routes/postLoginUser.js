// postLoginUser.js

require('dotenv').config()
const jwt = require('jsonwebtoken');
const maxTry = 3;
const lockoutTime = 5 * 60 * 1000; // 5 minutes en millisecondes
const invalidTry = {};

module.exports = (app) => {
    app.post('/api/post-loginUser/', (req, res) => {
        console.log("post-loginUser");

        const ip = req.ip;
        const userPass = req.body.pass;

        // Vérifier si l'utilisateur est verrouillé
        const userLockout = invalidTry[ip];
        if (userLockout && Date.now() - userLockout.time < lockoutTime) {
            return res.status(401).json({ message: `Compte verrouillé. Réessayez dans ${Math.ceil((lockoutTime - (Date.now() - userLockout.time)) / 1000 / 60)} minutes.` });
        }
        
        if (!userPass) {
            return res.status(400).json({ message: "Saisissez au moins 8 caractères" });
        }
        
        // Vérification du mot de passe
        const secretPass = process.env.SECRET_PASS;
        if (userPass !== secretPass) {
            // Incrémenter le nombre de tentatives incorrectes
            invalidTry[ip] = {
                count: (userLockout ? userLockout.count : 0) + 1,
            };

            if (invalidTry[ip].count >= maxTry) {
                // Réinitialiser le nombre de tentatives
                invalidTry[ip].count = 0;
                // Ajout d'une date
                invalidTry[ip].time = Date.now();
                return res.status(401).json({ message: `Compte verrouillé.` });
            }

            return res.status(401).json({ message: `Saisie incorrecte. ${invalidTry[ip].count}/3` });
        } else {
            // Réinitialiser le nombre de tentatives incorrectes en cas de succès
            delete invalidTry[ip];
        }

        // Création du jeton JWT
        const token = jwt.sign({ user_ip: ip }, process.env.SECRET_KEY, { expiresIn: '1h' });
        // Envoi du jeton au client
        return res.json({ message: "Bon retour, vous êtes connecté pour 1 heure", token });
    })
}