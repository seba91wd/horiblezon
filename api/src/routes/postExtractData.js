// postExtractData.js
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middlewares/auth');

module.exports = (app) => {
    app.post('/api/post-extractData/', auth, async (req, res) => {
        console.log("post-extractData");

        const fileId = req.body.id.value;
        const name = req.body.name.value;
        if (fileId === 'null' ) {
            return res.status(400).json({ error: 'L\'ID du corps ne doit pas être null.' });
        }

        if (name === 'null' ) {
            return res.status(400).json({ error: 'Le nom du corps ne doit pas être null.' });
        }

        const ephemerisFolderPath = path.join(__dirname, '../ephemeris');
        const filePath = path.join(ephemerisFolderPath, `${fileId}.json`);

        try {
            // Lire le contenu actuel du fichier
            const file = await fs.readFile(filePath, 'utf-8');
            const parseFile = JSON.parse(file);

            // Ajouter les nouvelles données
            parseFile.reformattedData = req.body;

            // Réécrire le fichier avec les données mises à jour
            await fs.writeFile(filePath, JSON.stringify(parseFile, null, 2), 'utf-8');

            const message = `Données du fichier ${fileId}.json, ${name} sauvegardées avec succès.`;
            return res.status(200).json({ message });
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données :', error);
            return res.status(500).json({ error: 'Erreur lors de la sauvegarde des données.' });
        }
    });
};
