// Horiblezon.js

import React, { useEffect, useState } from "react";
// Importation des fonctionnalités
import {
    getCookie,                      // Vérification de la présence du cookie de l'application.
    loginReq,                       // Identification d'un utilisateur.
    fetchEphemerisList,             // Récupération de la liste des fichiers d'éphémérides (number.json).
    fetchEphemerisData,             // Récupération des données brutes d'un fichier d'éphéméride.
    extractDataFromEphemeris,       // Extraction et assignation des données reformatées.
    renderNavBodiesList,            // Rendu HTML de la liste des corps.
    formattedDataHtmlRender,        // Rendu HTML des données reformatées.
    saveExtractData,                // Enregistrement des données reformatées d'un corps dans son fichiers d'éphémérides (number.json).
    addBody,                        // Ajouter un corps.
    addData,                        // Ajouter une donnée a un corps
    exportData,                     // Envoi des données a l'utilisateur 
    renderExportBodiesList          // Rendu HTML des données disponible a l'export.
} from "../functions/horiblezonUtils";

// Importation du style
import '../styles/horiblezon.css';

// Importation des composants
import Button from '../components/Button'
import Accordion from "../components/Accordion";
import SingleInputForm from "../components/SingleInputForm";

const Horiblezon = () => {
    // Etat de la liste des corps
    const [ephemerisList, setEphemerisList] = useState([]);

    // Etat du fichier.json correspondant
    const [selectedFile, setSelectedFile] = useState(null);

    // Etat de chargement des éphémérides du JPL 
    const [unformattedData, setUnformattedData] = useState('');

    // Etat contenant le rendu HTML des données formatées
    const [formattedDataHtml, setFormattedDataHtml] = useState(null);

    // Etat pour stocker les données formatées
    const [formattedData, setFormattedData] = useState([]);

    // Etat de l'affichage de l'accordeon addbody
    const [showAddBody, setShowAddBody] = useState(false);

    // Etat de l'affichage de l'accordeon addData
    const [showAddData, setShowAddData] = useState(false);

    // Etat de l'affichage de l'accordeon exportData
    const [showExportData, setShowExportData] = useState(false);

    // Etat des checkbox de l'accordeon exportData
    const [typeCheckboxes, setTypeCheckboxes] = useState({});
    const [bodyCheckboxes, setBodyCheckboxes] = useState({});

    // Etat de l'authentification del'utilisateur
    const [authenticated, setAuthenticated] = useState(false);

    // Etat des messages d'erreur
    const [message, setMessage] = useState(null);

    useEffect(() => {
        document.title = "Horiblezon";
        const authTokenCookie = getCookie('auth_token');
        // Si le cookie existe, l'utilisateur est considéré comme authentifié
        if (authTokenCookie) {
            setAuthenticated({
                role: 'user',
                authToken: authTokenCookie,
            });
        }
        fetchData();
    }, []);

    useEffect(() => {
        const fetchDataForSelectedFile = async () => {
            if (selectedFile) {
                try {
                    // Reset de la classe 'active'
                    const lis = document.getElementsByTagName("li")
                    for (let i = 0; i < lis.length; i++) {
                        const element = lis[i];
                        element.classList.remove('active');
                    }

                    // Ajout de la classe 'active' sur la balise <li> cliqué.
                    const li = document.getElementById(selectedFile);
                    li.classList.add('active');

                    // Appel des données depuis l'API
                    const result = await fetchEphemerisData(selectedFile);

                    // Atribution des données (éphéméride) dans la partie "Éphéméride du JPL"
                    setUnformattedData(result.unformattedData);

                    if (result.reformattedData) {
                        // Le fichier a déjà été reformaté
                        // Fonction pour charger puis afficher les données dans la balise "#extracted-data"
                        const data = result.reformattedData;
                        setFormattedData(data);

                        // Afficher les données dans la balise "#extracted-data"
                        const htmlRender = formattedDataHtmlRender(data, setFormattedData, addDataClick);
                        setFormattedDataHtml(htmlRender);
                    }
                    else {
                        // Le fichier n'a pas été reformaté
                        // Fonction pour extraire les données de "data.unformattedData" 
                        const data = extractDataFromEphemeris(result.unformattedData);
                        setFormattedData(data);

                        // Afficher les données dans la balise "#extracted-data"
                        const htmlRender = formattedDataHtmlRender(data, setFormattedData, addDataClick);
                        setFormattedDataHtml(htmlRender);
                    }
                } catch (error) {
                    console.error('Erreur lors de la requête du fichier:', error.message);
                }
            }
        };
        fetchDataForSelectedFile();
    }, [selectedFile]);

    // Fonction pour rafraichir la liste des fichiers "api/src/ephemeris/*.json"
    const fetchData = async () => {
        try {
            const data = await fetchEphemerisList();
            setEphemerisList(data);
        } catch (error) {
            console.error('Erreur lors de la requête de la liste:', error.message);
        }
    }

    // Fonction pour afficher un message pour l'utilisaeur
    const displayMessage = (message) => {
        setMessage(message);

        // Ajouter la classe pour l'effet de fondu à l'entrée
        const messageElement = document.getElementsByClassName("message")[0];

        messageElement.classList.remove('hidden');
        setTimeout(() => {
            messageElement.classList.add('fade-in');
            setTimeout(() => {
                messageElement.classList.remove('fade-in');
                messageElement.classList.add('fade-out');
                setTimeout(() => {
                    setMessage(null);
                    messageElement.classList.remove('fade-out');
                    messageElement.classList.add('hidden');
                }, 500);
            }, 8000);
        }, 10); // Décalage de 10 millisecondes

    };

    const handleUser = async () => {
        const login = document.getElementById('login').value;
        loginReq(login, setAuthenticated, displayMessage);
    };

    const handleVisitor = () => {
        setAuthenticated('visitor');
    };

    const liClick = (file) => {
        setSelectedFile(file);
    };

    const addBodyClick = () => {
        setShowAddBody(true);
    };

    const cancelAddBodyClick = () => {
        setShowAddBody(false);
    };

    const addDataClick = () => {
        setShowAddData(true);
    };

    const cancelAddDataClick = () => {
        setShowAddData(false);
    };

    const exportDataClick = () => {
        setShowExportData(true);
    };

    const cancelExportDataClick = () => {
        setShowExportData(false);
    };

    return (
        <>
            <main id="div-allData" className={`container-fluid d-flex justify-content-center ${showAddBody || showAddData || showExportData || (!authenticated || authenticated === 'login') ? 'blur' : ''}`}>
                <nav className="custom-border d-flex flex-column">
                    <div className="d-flex align-items-center justify-content-center">
                        <img src="./logo.png" alt="logo" />
                        <h1>Horiblezon</h1>
                    </div>
                    <Button label="Exporter les données" className="btn-primary" onClick={exportDataClick} />
                    <Button label="Ajouter un corps" className="btn-primary" onClick={addBodyClick} />
                    <div id="ephemerisList" className="scrollbar">
                        {renderNavBodiesList(ephemerisList, liClick)}
                    </div>
                </nav>

                {formattedDataHtml && (
                    <>
                        <div className="custom-border text-center">
                            <h2>Données extraites</h2>
                            <Button label="Sauvegarder les données" className="btn-primary" onClick={() => { saveExtractData(formattedData, fetchData, authenticated, displayMessage) }} />
                            {formattedDataHtml}
                        </div>
                    </>
                )}

                {unformattedData && (
                    <>
                        <div className="custom-border scrollbar">
                            <h2 className="text-center">Éphéméride du JPL</h2>
                            <pre className="scrollbar">{unformattedData}</pre>
                        </div>
                    </>
                )}
            </main>

            {!authenticated || authenticated === 'login' ? (
                <div className='container-fluid d-flex align-items-center justify-content-center addons'>
                    <Accordion idChild="accordion1" label="Bienvenue sur Horiblezon" view="open" collapse="noCollapse">
                        <p>Choisissez comment vous souhaitez continuer :</p>
                        <div className="d-flex">
                            <Button label="Visiteur" className="btn-primary" onClick={handleVisitor} />
                            <Button label="Utilisateur" className="btn-secondary" onClick={() => setAuthenticated('login')} />
                        </div>
                        {authenticated === "login" && (
                            <div className="text-center">
                                <SingleInputForm type="text" label="Identification:" categoryName="login" categoryValue="" placeholder="" />
                                <Button label="Valider" className="btn-primary" onClick={handleUser} />
                            </div>
                        )}
                    </Accordion>
                </div>
            ) : null}

            {showAddData && (
                <div className={`container-fluid d-flex align-items-center justify-content-center addons ${showAddData ? '' : 'hidden'} `}>
                    <Accordion idChild="accordion-addData" label="Ajout manuel de données" view="open" collapse="noCollapse">
                        <SingleInputForm type="select" label="Type de donnée:" categoryName="dataType"
                            options={[
                                { value: 'meanRadius', text: 'Rayon moyen:' },
                                { value: 'siderealRotPeriod', text: 'Période de rotation:' },
                                { value: 'mass', text: 'Masse:' },
                                { value: 'density', text: 'Densité:' },
                            ]}
                        />
                        <Button label="Valider" className="btn-primary w-100" onClick={() => addData(setFormattedData, setFormattedDataHtml, addDataClick, formattedData, cancelAddDataClick, displayMessage)} />
                        <Button label="Annuler" className="btn-secondary w-100" onClick={cancelAddDataClick} />
                    </Accordion>
                </div>
            )}

            {showAddBody && (
                <div className={`container-fluid d-flex align-items-center justify-content-center addons ${showAddBody ? '' : 'hidden'}`}>
                    <Accordion idChild="accordion-addBody" label="Ajouter un corps" view="open" collapse="noCollapse">
                        <SingleInputForm
                            type="text"
                            label="ID du corps:"
                            categoryName="add-id-value"
                            categoryValue=""
                            placeholder="599"
                        />
                        <SingleInputForm
                            type="text"
                            label="Centre de coordonnées:"
                            categoryName="add-coordinateCenter-value"
                            categoryValue="500@10"
                            placeholder="500@10"
                        />
                        <SingleInputForm
                            type="text"
                            label="Date des relevés:"
                            categoryName="add-date-value"
                            categoryValue="2000-01-01"
                            placeholder="yyyy-mm-dd"
                        />
                        <Button label="Envoyer la requête" className="btn-primary w-100" onClick={() => addBody(fetchData, cancelAddBodyClick, authenticated, displayMessage)} />
                        <Button label="Annuler" className="btn-secondary w-100" onClick={cancelAddBodyClick} />
                    </Accordion>
                </div>
            )}

            {showExportData && (
                <div className={`container-fluid d-flex align-items-center justify-content-center addons ${showExportData ? '' : 'hidden'} `}>
                    <Accordion idChild="accordion-export-data" label="Exporter les données" view="open" collapse="noCollapse">

                        <div className="custom-border w-100">
                            <h3>Type de données exportés :</h3>
                            <div className="form-check form-switch w-100">
                                <input className="form-check-input" type="checkbox" role="switch" id="check-identityData" defaultChecked />
                                <label className="form-check-label" htmlFor="check-identityData">Données d'identification</label>
                            </div>
                            <div className="form-check form-switch w-100">
                                <input className="form-check-input" type="checkbox" role="switch" id="check-physic-data" defaultChecked />
                                <label className="form-check-label" htmlFor="check-physic-data">Données physiques</label>
                            </div>
                            <div className="form-check form-switch w-100">
                                <input className="form-check-input" type="checkbox" role="switch" id="check-astronomic-data" defaultChecked />
                                <label className="form-check-label" htmlFor="check-astronomic-data">Données astronomiques</label>
                            </div>
                        </div>

                        <div id="exportList" className="custom-border w-100 scrollbar">
                            <h3>Corps disponibles à l'exportation :</h3>
                            {renderExportBodiesList(ephemerisList, typeCheckboxes, setTypeCheckboxes, bodyCheckboxes, setBodyCheckboxes)}
                        </div>

                        <Button label="Valider" className="btn-primary w-100" onClick={() => exportData(displayMessage, bodyCheckboxes)} />
                        <Button label="Annuler" className="btn-secondary w-100" onClick={cancelExportDataClick} />
                    </Accordion>
                </div>
            )}


            <div className="position-fixed bottom-0 w-100 text-center">
                <p className="message hidden">
                    {message}
                </p>
            </div>
        </>
    )
}

export default Horiblezon;