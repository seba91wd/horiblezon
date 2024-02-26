// ========================================================================================================== //
// middlewares/auth.js
//
// Parametres du middleware:
//
//
// Note: 1 - Ce middleware vérifie l'authenticité du token contenue dans le cookie délivré à un utilisateur identifié.
// 
// exemple d'utilisation:
/* 

*/
// ========================================================================================================== //

require('dotenv').config()
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Récupérer le jeton depuis les cookies, les en-têtes ou les paramètres de la requête
    const authorization = req.headers.authorization;

    // Récupérer le token dans l'en-tête
    const token = authorization.split(' ')[1];

    // Vérifier si le jeton est présent
    if (token === 'undefined') {
        return res.status(401).json({ message: "Cette fonction est réservée aux utilisateurs." });
    }

    // Vérifier le jeton
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Identification invalide. Veuillez vous reconnecter." });
        }
        next();
    });
};
