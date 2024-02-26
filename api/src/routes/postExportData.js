// postExportData.js
const path = require('path');

module.exports = (app) => {
    app.post('/api/post-exportData/', async (req, res) => {
        console.log("post-exportData");
        
        const bodyList = req.body.bodyList;
        const identityData = req.body.identityData;
        const physicData = req.body.physicData;
        const astronomicData = req.body.astronomicData;

        if (!bodyList) {
            return res.status(400).json({ message: 'Veuillez fournir une liste d\'export valide.' });
        }

        if (Object.keys(bodyList).length === 0) {
            return res.status(400).json({ message: 'Votre liste de corps exportés est vide.' });
        }

        // Charger les données pour chaque corps
        const result = bodyList.map(bodyNumber => {
            // Chemin du fichier JSON
            const filePath = `../ephemeris/${bodyNumber}.json`;
            const bodyData = require(`./${filePath}`);

            // Filtrer les données en fonction des paramètres
            let data = {};

            if (identityData) {
                data = {
                    type: bodyData.reformattedData.type,
                    revised: bodyData.reformattedData.revised,
                    name: bodyData.reformattedData.name,
                    id: bodyData.reformattedData.id,
                    coordinateCenter: bodyData.reformattedData.coordinateCenter,
                };
            }

            if (physicData) {
                data.physicalData = bodyData.reformattedData.physicalData;
            }

            if (astronomicData) {
                data.astronomicalData = bodyData.reformattedData.astronomicalData;
            }

            return data;
        });

        const message = `Données exportées avec succès.`;
        return res.status(200).json({ message, result });
    })
}
