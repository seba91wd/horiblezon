// postExtractData.js
const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const moment = require('moment');
const axios = require('axios');
const auth = require('../middlewares/auth');

// Chemin du fichier JSON
const ephemerisFolderPath = path.join(__dirname, '../ephemeris');

module.exports = (app) => {
    // Middleware pour analyser le corps de la requête en JSON

    app.post('/api/post-addBody/', auth, async (req, res) => {
        console.log("post-addBody");

        const id = req.body.id;
        const coordinateCenter = req.body.coordinateCenter || '500@10';
        const date = req.body.date || '2000-01-01';

        if (id === '' ) {
            return res.status(400).json({ error: 'L\'ID du corps ne doit pas être null.' });
        }

        try {
            const data = await reqToJpl(id, coordinateCenter, date);
            if (data.error) {
                return res.status(502).json({ error: 'Le service du JPL "Horizon" est actuellement indisponible. Veuillez réessayer plus tard.' });
            }
            writeRawFile(id, data);

            const message = `Données du fichier ${id}.json, sauvegardées avec succès.`;
            return res.status(200).json({ message });
        } 
        catch (error) {
            console.error('Erreur lors de la sauvegarde des données :', error);
            return res.status(500).json({ error: 'Erreur lors de la sauvegarde des données.' });
        }
    });
};

// Fonction pour envoyer une requète vers l'API du JPL "Horizon"
async function reqToJpl(targetBody, coordinateCenter, startDate) {
    // Ajouter un jour à la date de début
    const stoptDate = moment(startDate).add(1, 'day').format('YYYY-MM-DD');

    // URL de l'API du JPL
    const baseUrl = 'https://ssd.jpl.nasa.gov/api/horizons.api';

    const params = {
        format: 'json',
        COMMAND: `'${targetBody}'`,
        OBJ_DATA: "'YES'",                  // Données physiques du corps
        MAKE_EPHEM: "'YES'",
        EPHEM_TYPE: "'ELEMENTS'",           // Type d'éphéméride
        CENTER: `'${coordinateCenter}'`,    // '500@10' pour le centre du Soleil
        START_TIME: `'${startDate}'`,
        STOP_TIME: `'${stoptDate}'`,
        STEP_SIZE: "'1 mo'",                // 1 relevé par mois
        QUANTITIES: "'1,9,20,23,24,29'",    // Type de données 
    };

    try {
        const response = await axios(baseUrl, { params });
        return response.data;
    } catch (error) {
        throw error;
    }
}

// Fonction pour sauvegarde les données brute, pour utilisation ultérieure.
async function writeRawFile(id, data) {
    try {
        // Construire le nom du fichier JSON en utilisant l'identifiant
        const fileName = path.join(ephemerisFolderPath, `${id}.json`);
        
        // Convertir les données en format JSON
        const jsonData = JSON.stringify(data, null, 2);
        
        // Écrire les données dans le fichier
        await fs.writeFile(fileName, jsonData);

        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
}