// getEphemeris.js

const express = require('express');
const path = require('path');
const fs = require('fs').promises;

module.exports = (app) => {
    app.get('/api/get-ephemeris/:id?', async (req, res) => {

        const ephemerisFolderPath = path.join(__dirname, '../ephemeris');
        const fileId = req.params.id;

        try {
            
            if (fileId) {
                // Si un ID est fourni, lire le contenu du fichier JSON correspondant
                console.log("get-ephemeris + ID");

                // Vérifier si l'ID est un nombre entier
                if (!Number.isInteger(Number(fileId))) {
                    return res.status(400).json({ error: 'L\'ID doit être un nombre entier ( ex: /api/ephemeris-files/601 ).' });
                }

                const filePath = path.join(ephemerisFolderPath, `${fileId}.json`);
                try {
                    const fileContent = await fs.readFile(filePath, 'utf-8');
                    const data = JSON.parse(fileContent);
                    const name = data.reformattedData && data.reformattedData.name ? ` (${data.reformattedData.name})` : "";
                    const message = `Données du fichier ${fileId}.json,${name} récupérées avec succès.`;
                    return res.status(200).json({ message, data });
                } 
                catch (error) {
                    // Si le fichier n'est pas trouvé ou n'existe pas
                    return res.status(404).json({ error: `Le fichier ${fileId}.json n'a pas été trouvé.` });
                }
            }
            else {
                // Si aucun ID n'est fourni, renvoyer la liste des noms de fichiers
                console.log("get-ephemeris");
                
                const files = await fs.readdir(ephemerisFolderPath);

                // Filtrer les fichiers qui ont la propriété "reformattedData" ou retourner le nom du fichier
                const filesList = await Promise.all(
                    files.map(async (file) => {
                        try {
                            const filePath = path.join(ephemerisFolderPath, file);
                            const fileContent = await fs.readFile(filePath, 'utf-8');
                            const jsonData = JSON.parse(fileContent);

                            // Vérifier si le fichier dispose de la propriété "reformattedData"
                            if (jsonData.hasOwnProperty('reformattedData')) {
                                // Retourner le nom, l'id, et le type du corps
                                return {
                                    name: jsonData.reformattedData.name.value,
                                    id: jsonData.reformattedData.id.value, 
                                    type: jsonData.reformattedData.type.value
                                }
                            };
                            // Retourner uniquement le nom du fichier
                            return path.parse(file).name;
                        } catch (error) {
                            console.error(`Erreur lors de la lecture du fichier ${file} :`, error);
                            return null;
                        }
                    })
                );
                const message = ['Liste des fichiers récupérée avec succès.', 'Detail d\'un corps sur l\'URL: api/get-ephemeris/:id'];
                return res.status(200).json({ message, filesList });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erreur interne du serveur' });
        }
    });
};
