// postLoginUser.js

const jwt = require('jsonwebtoken');
const privateKey = require('../privateKey')

const maxTry = 3;
const invalidTry = {};

module.exports = (app) => {
    app.post('/api/post-loginUser/', (req, res) => {
        console.log("post-loginUser");

        const ip = req.ip;
        const pass = req.body.pass;

        // Vérifier si l'utilisateur est verrouillé
        if (invalidTry[ip] >= maxTry) {
            return res.status(401).json({ message: "Compte verrouillé. Réessayez plus tard." });
        }

        if (!pass) {
            return res.status(400).json({ message: "Saisissez au moins 8 caractères" });
        }

        // Vérification du mot de passe
        const passwordAccess = "adminPass";
        if (pass !== passwordAccess) {
            // Incrémenter le nombre de tentatives incorrectes
            invalidTry[ip] = (invalidTry[ip] || 0) + 1;
            return res.status(401).json({ message: `Saisie incorrect. ${invalidTry[ip]}/3` });
        }
        else {
            // Réinitialiser le nombre de tentatives incorrectes en cas de succès
            invalidTry[ip] = 0;
        }

        // JWT
        const token = jwt.sign({ user_ip: ip }, privateKey, { expiresIn: '1h' });

        return res.json({ message: "Bon retour, vous êtes connecté pour 1 heure", token});
    })
}