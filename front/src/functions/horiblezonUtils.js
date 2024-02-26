// horiblezonUtils.js

import Accordion from "../components/Accordion";
import Button from "../components/Button";
import DoubleInputForm from "../components/DoubleInputForm";
import SingleInputForm from "../components/SingleInputForm";

export function getCookie(cookieName) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}

export async function loginReq(login, setAuthenticated, displayMessage) {
    try {
        const response = await fetch('/api/post-loginUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pass: login }),
        });

        const data = await response.json();
        if (response.ok) {
            const expiration_date = new Date();
            expiration_date.setHours(expiration_date.getHours() + 1); // Ajoute 1 heure à l'heure actuelle

            // Créer le cookie pour stocker le token avec la durée de vie d'une heure
            document.cookie = `auth_token=${data.token}; expires=${expiration_date.toUTCString()}; path=/;`;

            // Mise a jour de l'état de l'authentification del'utilisateur
            setAuthenticated({
                role: 'user',
                authToken: data.token,
            });

            // Afficher le message d'authentification dans le navigateur
            return displayMessage(data.message);
        }
        else {
            return displayMessage(data.message);
        }

    }
    catch (error) {
        console.error('Erreur lors de la requête :', error);
    }
}

export function fetchEphemerisList() {
    return fetch('/api/get-ephemeris/')
        .then(response => {
            if (!response.ok) {
                throw new Error('La requête a échoué.');
            }
            return response.json();
        })
        .then(data => {
            const organizedData = data.filesList.reduce((acc, file) => {
                const type = file.type || 'undefined';
                if (!acc[type]) {
                    acc[type] = [];
                }
                acc[type].push(file);
                return acc;
            }, {});

            return organizedData;
        })
        .catch(error => {
            console.error('Erreur lors de la requête:', error);
            throw error;
        });
};

export function fetchEphemerisData(selectedFile) {
    return fetch(`/api/get-ephemeris/${selectedFile}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('La requête a échoué.');
            }
            return response.json();
        })
        .then(file => {
            const result = {
                unformattedData: file.data.result,
                reformattedData: file.data.reformattedData
            };

            return result;
        })
        .catch(error => {
            console.error('Erreur lors de la requête:', error);
            throw error;
        });
}

export function extractDataFromEphemeris(rawdData) {
    // Remplacer les espaces consécutifs par un seul espace
    let data = rawdData.replace(/\s+/g, ' ');
    // Remplacer les Majuscules par des minuscules
    data = data.toLowerCase();

    const formattedData = {
        astronomicalData: {},
        physicalData: {},
        type: { value: "null" },
    };

    //***********************************************************************
    // ****************************** identity ******************************

    // Date de revision
    const regexRevisionDate = /revised: (\w+) (\d{1,2}), (\d{4})/;
    const matchRevisionDate = data.match(regexRevisionDate);
    if (matchRevisionDate) {
        const [, month, day, year] = matchRevisionDate;
        const property = { value: `${month} ${day} ${year}` }
        formattedData.revised = property;
    };

    // Nom et ID du corps
    const regexTargetBody = /target body name: (\w+) \((\d+)\)/;
    const matchTargetBody = data.match(regexTargetBody);

    const regexTargetBodyFormat2 = /target body name: (\d+) (\w+)/;
    const matchTargetBodyFormat2 = data.match(regexTargetBodyFormat2);

    const regexTargetBodyFormat3 = /target body name: (.+?) \((\d+)\)/;
    const matchTargetBodyFormat3 = data.match(regexTargetBodyFormat3);

    if (matchTargetBody) {
        const [, bodyName, bodyId] = matchTargetBody;
        const propertyName = { value: bodyName };
        const propertyId = { value: bodyId };
        formattedData.name = propertyName;
        formattedData.id = propertyId;
    }
    else if (matchTargetBodyFormat2) {
        const [, bodyName, bodyId] = matchTargetBodyFormat2;
        const propertyName = { value: bodyName };
        const propertyId = { value: bodyId };
        formattedData.name = propertyName;
        formattedData.id = propertyId;
    }
    else if (matchTargetBodyFormat3) {
        const [, bodyName, bodyId] = matchTargetBodyFormat3;
        const propertyName = { value: bodyName };
        const propertyId = { value: bodyId };
        formattedData.name = propertyName;
        formattedData.id = propertyId;
    }
    else {
        formattedData.name = "null";
        formattedData.id = "null";
    };

    // Nom et ID du corps de référence
    const regexCenterBody = /center body name:\s+(.+?)\s+\((\d+)\)/;
    const matchCenterBody = data.match(regexCenterBody);

    if (matchCenterBody) {
        const [, bodyName, bodyId] = matchCenterBody
        formattedData.coordinateCenter = { value: bodyName, id: bodyId };
    }
    else {
        formattedData.coordinateCenter = { value: "null", id: "null" };
    };

    //***********************************************************************
    // **************************** physicalData ****************************

    // Rayon moyen (km) 
    const regexMeanRadiusFormat1 = /mean radius \(km\) = (\d+(\.\d+)?)/;
    const matchMeanRadiusFormat1 = data.match(regexMeanRadiusFormat1);

    const regexMeanRadiusFormat2 = /radius \(km\) = (\d+(\.\d+)?)/;
    const matchMeanRadiusFormat2 = data.match(regexMeanRadiusFormat2);

    if (matchMeanRadiusFormat1) {
        const property = {
            value: parseFloat(matchMeanRadiusFormat1[1]),
            unit: "km",
        }
        formattedData.physicalData.meanRadius = property
    }
    else if (matchMeanRadiusFormat2) {
        const property = {
            value: parseFloat(matchMeanRadiusFormat2[1]),
            unit: "km",
        }
        formattedData.physicalData.meanRadius = property
    };

    // Période de rotation sidérale
    const regexSiderealRotPeriod = /sidereal rot\. period = (\d+\.\d+) d/;
    const matchSiderealRotPeriod = data.match(regexSiderealRotPeriod);

    // Regex pour le format hh h mm m ss.s
    const regexSidRotPeriodFormat2 = /sid\. rot\. period \(iii\)= (\d+)h (\d+)m (\d+\.\d+)/;
    const matchSidRotPeriodFormat2 = data.match(regexSidRotPeriodFormat2);

    // Regex pour le format hh h mm m ss.s+-dd
    const regexSidRotPeriodFormat3 = /sid\. rot\. period \(iii\)= (\d+\.\d+)/;
    const matchSidRotPeriodFormat3 = data.match(regexSidRotPeriodFormat3);

    const regexSynchronousRotPeriod = /rotational period\s*=\s*synchronous/;
    const matchSynchronousRotPeriod = data.match(regexSynchronousRotPeriod);

    if (matchSiderealRotPeriod) {
        const property = {
            value: parseFloat(matchSiderealRotPeriod[1]),
            unit: "j",
        };
        formattedData.physicalData.siderealRotPeriod = property;
    }
    else if (matchSidRotPeriodFormat2) {
        const hours = parseInt(matchSidRotPeriodFormat2[1]);
        const minutes = parseInt(matchSidRotPeriodFormat2[2]);
        const seconds = parseFloat(matchSidRotPeriodFormat2[3]);
        const days = (hours * 3600 + minutes * 60 + seconds) / (24 * 3600);
        const property = {
            value: parseFloat(days),
            unit: "j",
        };
        formattedData.physicalData.siderealRotPeriod = property;

    }
    else if (matchSidRotPeriodFormat3) {
        const days = parseFloat(parseInt(matchSidRotPeriodFormat3[1]) / 24);
        const property = {
            value: parseFloat(days),
            unit: "j",
        };
        formattedData.physicalData.siderealRotPeriod = property;

    }
    else if (matchSynchronousRotPeriod) {
        const property = {
            value: "synchronous",
        };
        formattedData.physicalData.siderealRotPeriod = property;
    }

    // Masse du corps

    // Extraction de la masse au format "mass x10^23 (kg) = 48.685"
    const regexMassFormat1 = /mass x10\^(\d+) \(kg\) = (\d+\.\d+)/;
    const matchMassFormat1 = data.match(regexMassFormat1);

    // Extraction de la masse au format "mass (10^19 kg) = 10.805"
    const regexMassFormat2 = /mass \(10\^(\d+) kg\) = (\d+\.\d+)/;
    const matchMassFormat2 = data.match(regexMassFormat2);

    // Extraction de la masse au format "mass x10^22 (g) = 189818722 +- 8817"
    const regexMassFormat3 = /mass x 10\^(\d+) \(g\) = (\d+)/;
    const matchMassFormat3 = data.match(regexMassFormat3);

    if (matchMassFormat1) {
        const property = {
            value: parseFloat(matchMassFormat1[2]),
            exponent: parseInt(matchMassFormat1[1]),
            unit: "kg",
        };
        formattedData.physicalData.mass = property;
    }
    else if (matchMassFormat2) {
        const property = {
            value: parseFloat(matchMassFormat2[2]),
            exponent: parseInt(matchMassFormat2[1]),
            unit: "kg",
        };
        formattedData.physicalData.mass = property;
    }
    else if (matchMassFormat3) {
        // Conversion en kilogrammes
        const exponent = parseInt(matchMassFormat3[1]);
        const grams = parseInt(matchMassFormat3[2]);
        const kilograms = grams / 1000

        const property = {
            // value: parseFloat(kilograms.toExponential(8).split('e')[0]),
            value: parseFloat(kilograms),
            exponent: exponent,
            unit: "kg",
        };
        formattedData.physicalData.mass = property;
    }

    // Densité

    const regexDensity = /density\s*\(g\s*[/]?cm\^\s*-?\s*3\s*\)\s*=\s*(\d+\.\d+)/;
    const matchDensity = data.match(regexDensity);

    if (matchDensity) {
        const property = {
            value: parseFloat(matchDensity[1]),
            unit: "g/cm³",
        };
        formattedData.physicalData.density = property;
    }

    //***********************************************************************
    // ************************** astronomicalData **************************

    // JDTDB
    const regexJDTDB = /\$\$soe (\d+\.\d+) = a\.d\. \d+-[a-z]+-\d+ \d+:\d+:\d+\.\d+ tdb/;
    const matchJDTDB = data.match(regexJDTDB);

    if (matchJDTDB) {
        const property = { value: parseFloat(matchJDTDB[1]) }
        formattedData.astronomicalData.jdtdb = property;
    }

    // Date 
    const regexDate = /\$\$soe \d+\.\d+ = a\.d\. (\d+-[a-z]+-\d+ \d+:\d+:\d+\.\d+) tdb/;
    const matchDate = data.match(regexDate);

    if (matchDate) {
        const property = { value: matchDate[1] }
        formattedData.astronomicalData.date = property;
    }

    // Eccentricity
    const regexEccentricity = /ec= ([\d.]+)e(-?\d+)/;
    const matchEccentricity = data.match(regexEccentricity);
    if (matchEccentricity) {
        const property = {
            value: parseFloat(matchEccentricity[1]),
            exponent: parseInt(matchEccentricity[2]),
        }
        formattedData.astronomicalData.eccentricity = property
    };

    // Periapsis distance
    const regexPeriapsis = /qr= (\d+\.\d+)e([+-]?\d+)/;
    const matchPeriapsis = data.match(regexPeriapsis);
    if (matchPeriapsis) {
        const property = {
            value: parseFloat(matchPeriapsis[1]),
            exponent: parseInt(matchPeriapsis[2]),
            unit: "km",
        }
        formattedData.astronomicalData.periapsis = property;
    };

    // Inclination
    const regexInclination = /in= ([\d.]+)e([+\-\d]+)/;
    const matchInclination = data.match(regexInclination);
    if (matchInclination) {
        const property = {
            value: parseFloat(matchInclination[1]),
            exponent: parseInt(matchInclination[2]),
            unit: "degrees",
        }
        formattedData.astronomicalData.inclination = property;
    };

    // Longitude of Ascending Node
    const regexLongitudeNode = /om= ([\d.]+)e([+-]?\d+)/;
    const matchLongitudeNode = data.match(regexLongitudeNode);
    if (matchLongitudeNode) {
        const property = {
            value: parseFloat(matchLongitudeNode[1]),
            exponent: parseInt(matchLongitudeNode[2]),
            unit: "degrees",
        }
        formattedData.astronomicalData.longitudeNode = property;
    };

    // Argument of Perifocus
    const regexArgumentPerifocus = /w = ([\d.]+)e([+-]?\d+)/;
    const matchArgumentPerifocus = data.match(regexArgumentPerifocus);
    if (matchArgumentPerifocus) {
        const property = {
            value: parseFloat(matchArgumentPerifocus[1]),
            exponent: parseInt(matchArgumentPerifocus[2]),
            unit: "degrees",
        }
        formattedData.astronomicalData.argumentPerifocus = property;
    };

    // Time of Periapsis
    const regexTimePeriapsis = /tp= ([\d.]+)/;
    const matchTimePeriapsis = data.match(regexTimePeriapsis);
    if (matchTimePeriapsis) {
        const property = {
            value: parseFloat(matchTimePeriapsis[1]),
            unit: "Julian Day Number",
        }
        formattedData.astronomicalData.timePeriapsis = property;
    };

    // Mean Motion
    const regexMeanMotion = /n = ([\d.]+)e([+-]?\d+)/;
    const matchMeanMotion = data.match(regexMeanMotion);
    if (matchMeanMotion) {
        const property = {
            value: parseFloat(matchMeanMotion[1]),
            exponent: parseInt(matchMeanMotion[2]),
            unit: "degrees/sec",
        }
        formattedData.astronomicalData.meanMotion = property;
    };

    // Mean anomaly
    const regexMeanAnomaly = /ma= ([\d.]+)e([+\-\d]+)/;
    const matchMeanAnomaly = data.match(regexMeanAnomaly);
    if (matchMeanAnomaly) {
        const property = {
            value: parseFloat(matchMeanAnomaly[1]),
            exponent: parseInt(matchMeanAnomaly[2]),
            unit: "degrees",
        }
        formattedData.astronomicalData.meanAnomaly = property;
    };

    // True anomaly
    const regexTrueAnomaly = /ta= ([\d.]+)e([+\-\d]+)/;
    const matchTrueAnomaly = data.match(regexTrueAnomaly);
    if (matchTrueAnomaly) {
        const property = {
            value: parseFloat(matchTrueAnomaly[1]),
            exponent: parseInt(matchTrueAnomaly[2]),
            unit: "degrees",
        }
        formattedData.astronomicalData.trueAnomaly = property;
    };

    // Semi-major axis
    const regexSemiMajorAxis = /a = ([\d.]+)e([+\-\d]+)/;
    const matchSemiMajorAxis = data.match(regexSemiMajorAxis);
    if (matchSemiMajorAxis) {
        const property = {
            value: parseFloat(matchSemiMajorAxis[1]),
            exponent: parseInt(matchSemiMajorAxis[2]),
            unit: "km",
        }
        formattedData.astronomicalData.semiMajorAxis = property;
    };

    // Apoapsis distance
    const regexApoapsisDistance = /ad= (\d+\.\d+)e([+-]?\d+)/;
    const matchApoapsisDistance = data.match(regexApoapsisDistance);
    if (matchApoapsisDistance) {
        const property = {
            value: parseFloat(matchApoapsisDistance[1]),
            exponent: parseInt(matchApoapsisDistance[2]),
            unit: "km",
        }
        formattedData.astronomicalData.apoapsis = property;
    };

    // Sidereal orbit period
    const regexSiderealOrbitPeriod = /pr= ([\d.]+)e([+\-\d]+)/;
    const matchSiderealOrbitPeriod = data.match(regexSiderealOrbitPeriod);
    if (matchSiderealOrbitPeriod) {
        const property = {
            value: parseFloat(matchSiderealOrbitPeriod[1]),
            exponent: parseInt(matchSiderealOrbitPeriod[2]),
            unit: "sec",
        }
        formattedData.astronomicalData.siderealOrbitPeriod = property;
    };
    // console.log(formattedData);
    return formattedData;
}

export function formattedDataHtmlRender(reformattedData, setFormattedData, addDataClick) {
    // Fonction pour rendre les données formatées dans un Accordion
    const identityLength = Object.keys(reformattedData).length - 2;
    const physicDataLength = Object.keys(reformattedData.physicalData).length;
    const astronomicDataLength = Object.keys(reformattedData.astronomicalData).length;

    return (
        <div key={`formattedData-${reformattedData.name.value}`} id="formattedData" className="scrollbar">
            <Accordion idChild="accordion-identity" label={`Identification: ${identityLength}/5`} view="open">
                <SingleInputForm
                    type="text"
                    label="Nom du corps:"
                    categoryName="name-value"
                    categoryValue={reformattedData.name.value}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <SingleInputForm
                    type="select"
                    label="Type du corps:"
                    categoryName="type-value"
                    categoryValue={reformattedData.type.value}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                    options={[
                        { value: 'undefined', text: 'Indéfini' },
                        { value: 'stars', text: 'Étoile' },
                        { value: 'telluric-planet', text: 'Planète tellurique' },
                        { value: 'gas-giant-planet', text: 'Planète géante gazeuse' },
                        { value: 'dwarf-planet', text: 'Planète naine' },
                        { value: 'moon', text: 'Lune' },
                        { value: 'asteroid', text: 'Astéroïde' },
                        { value: 'comet', text: 'Comète' },
                        { value: 'barycentre', text: 'Barycentre' },
                    ]}
                />
                <SingleInputForm
                    type="text"
                    label="ID du corps:"
                    categoryName="id-value"
                    categoryValue={reformattedData.id.value}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Centre des coordonées:"
                    label2="ID:"
                    categoryName1="coordinateCenter-value"
                    categoryName2="coordinateCenter-id"
                    value1={reformattedData.coordinateCenter.value}
                    value2={reformattedData.coordinateCenter.id}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
            </Accordion>

            <Accordion idChild="accordion-physic-data" label={`Données physiques: ${physicDataLength}`} view="open">
                <Button label="Ajout manuel de données" className="btn-primary" onClick={addDataClick} />
                {reformattedData.physicalData.meanRadius && (
                    <SingleInputForm
                        type="text"
                        label="Rayon moyen:"
                        categoryName="meanRadius-value"
                        categoryValue={reformattedData.physicalData.meanRadius.value}
                        dataProps={reformattedData}
                        setFormattedData={setFormattedData}
                    />
                )}
                {reformattedData.physicalData.siderealRotPeriod && (
                    <SingleInputForm
                        type="text"
                        label="Période de rotation:"
                        categoryName="siderealRotPeriod-value"
                        categoryValue={reformattedData.physicalData.siderealRotPeriod.value}
                        dataProps={reformattedData}
                        setFormattedData={setFormattedData}
                    />
                )}
                {reformattedData.physicalData.mass && (
                    <DoubleInputForm
                        label1="Masse:"
                        label2="x10^"
                        categoryName1="mass-value"
                        categoryName2="mass-exponent"
                        value1={reformattedData.physicalData.mass.value}
                        value2={reformattedData.physicalData.mass.exponent}
                        dataProps={reformattedData}
                        setFormattedData={setFormattedData}
                    />
                )}
                {reformattedData.physicalData.density && (
                    <SingleInputForm
                        type="text"
                        label="Densité:"
                        categoryName="density-value"
                        categoryValue={reformattedData.physicalData.density.value}
                        dataProps={reformattedData}
                        setFormattedData={setFormattedData}
                    />
                )}
            </Accordion>

            <Accordion idChild="accordion-astronomic-data" label={`Données astronomiques: ${astronomicDataLength}/14`} view="open">
                <SingleInputForm
                    type="text"
                    label="Date du relevé JDTDB:"
                    categoryName="jdtdb-value"
                    categoryValue={reformattedData.astronomicalData.jdtdb.value}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <SingleInputForm
                    type="text"
                    label="Date du relevé:"
                    categoryName="date-value"
                    categoryValue={reformattedData.astronomicalData.date.value}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Excentricité:"
                    label2="x10^"
                    categoryName1="eccentricity-value"
                    categoryName2="eccentricity-exponent"
                    value1={reformattedData.astronomicalData.eccentricity.value}
                    value2={reformattedData.astronomicalData.eccentricity.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Périapsis:"
                    label2="x10^"
                    categoryName1="periapsis-value"
                    categoryName2="periapsis-exponent"
                    value1={reformattedData.astronomicalData.periapsis.value}
                    value2={reformattedData.astronomicalData.periapsis.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Inclinaison:"
                    label2="x10^"
                    categoryName1="inclination-value"
                    categoryName2="inclination-exponent"
                    value1={reformattedData.astronomicalData.inclination.value}
                    value2={reformattedData.astronomicalData.inclination.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Longitude du nœud ascendant:"
                    label2="x10^"
                    categoryName1="longitudeNode-value"
                    categoryName2="longitudeNode-exponent"
                    value1={reformattedData.astronomicalData.longitudeNode.value}
                    value2={reformattedData.astronomicalData.longitudeNode.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Argument de périapsis:"
                    label2="x10^"
                    categoryName1="argumentPerifocus-value"
                    categoryName2="argumentPerifocus-exponent"
                    value1={reformattedData.astronomicalData.argumentPerifocus.value}
                    value2={reformattedData.astronomicalData.argumentPerifocus.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <SingleInputForm
                    type="text"
                    label="Jour du périapsis:"
                    categoryName="timePeriapsis-value"
                    categoryValue={reformattedData.astronomicalData.timePeriapsis.value}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Mouvement moyen:"
                    label2="x10^"
                    categoryName1="meanAnomaly-value"
                    categoryName2="meanAnomaly-exponent"
                    value1={reformattedData.astronomicalData.meanAnomaly.value}
                    value2={reformattedData.astronomicalData.meanAnomaly.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Anomalie Réelle:"
                    label2="x10^"
                    categoryName1="trueAnomaly-value"
                    categoryName2="trueAnomaly-exponent"
                    value1={reformattedData.astronomicalData.trueAnomaly.value}
                    value2={reformattedData.astronomicalData.trueAnomaly.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Axe semi majeur:"
                    label2="x10^"
                    categoryName1="semiMajorAxis-value"
                    categoryName2="semiMajorAxis-exponent"
                    value1={reformattedData.astronomicalData.semiMajorAxis.value}
                    value2={reformattedData.astronomicalData.semiMajorAxis.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Apoapsis:"
                    label2="x10^"
                    categoryName1="apoapsis-value"
                    categoryName2="apoapsis-exponent"
                    value1={reformattedData.astronomicalData.apoapsis.value}
                    value2={reformattedData.astronomicalData.apoapsis.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />
                <DoubleInputForm
                    label1="Période orbital:"
                    label2="x10^"
                    categoryName1="siderealOrbitPeriod-value"
                    categoryName2="siderealOrbitPeriod-exponent"
                    value1={reformattedData.astronomicalData.siderealOrbitPeriod.value}
                    value2={reformattedData.astronomicalData.siderealOrbitPeriod.exponent}
                    dataProps={reformattedData}
                    setFormattedData={setFormattedData}
                />

            </Accordion>

        </div>
    );
}

export function renderNavBodiesList(ephemerisList, liClick) {
    // Fonction pour rendre les <Accordion> de la navbar en fonction des données

    // Mapping des types de corps en francais
    const typeMappings = {
        'undefined': 'Indéfini',
        'stars': 'Étoiles',
        'telluric-planet': 'Planètes telluriques',
        'gas-giant-planet': 'Planètes géantes gazeuses',
        'dwarf-planet': 'Planète naine',
        'moon': 'Lune',
        'asteroid': 'Astéroïde',
        'comet': 'Comète',
        'barycentre': 'Barycentre',
    };

    return Object.keys(ephemerisList).map(type => (
        <Accordion
            key={`accordion-${type}`}
            idChild={`accordion-${type}`}
            label={`${typeMappings[type] || type}: ${ephemerisList[type].length}`}
            view="open"
        >
            <ul>
                {ephemerisList[type].map(file => {
                    // Déclarer la clé et l'ID avant la balise <li>
                    const key = file.id || file;

                    return (
                        <li key={key} id={key} onClick={() => liClick(key)}>
                            {typeof file === 'object' ? (
                                `${file.id} / ${file.name}`
                            ) : (
                                // Gérer le cas où file n'est pas un objet (chaîne de caractères)
                                file
                            )}
                        </li>
                    );
                })}
            </ul>
        </Accordion>
    ));
}

export function saveExtractData(extractedData, fetchData, authenticated, displayMessage) {
    console.log(extractedData);
    if (extractedData.name.value === 'null') {
        const message = `Le corps doit être nommé pour sauvegarder les données.`;
        displayMessage(message);
        return;
    }

    if (extractedData.type.value === 'null') {
        const message = `Vous devez sélectionner le type de corps pour sauvegarder les données.`;
        displayMessage(message);
        return;
    }

    if (extractedData.id.value === 'null') {
        const message = `Le corps doit posseder un ID pour sauvegarder les données.`;
        displayMessage(message);
        return;
    }

    if (extractedData.coordinateCenter.value === 'null' || extractedData.coordinateCenter.id === 'null') {
        const message = `Le corps doit posseder un centre de coordonnées pour sauvegarder les données.`;
        displayMessage(message);
        return;
    }

    return fetch('/api/post-extractData/', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authenticated.authToken}`,
        },
        body: JSON.stringify(extractedData),
    })
        .then(response => response.json())
        .then(({ message }) => {
            displayMessage(message);
            fetchData();
        })
        .catch(error => {
            console.error(error);
        });
}

export function addBody(fetchData, cancelAddBodyClick, authenticated, displayMessage) {
    const id = parseInt(document.getElementById("add-id-value").value);
    const coordinateCenter = document.getElementById("add-coordinateCenter-value").value;
    const date = document.getElementById("add-date-value").value;

    if (!id) {
        const message = `Veuillez saisir un ID valide, exmeple: "599" = Jupiter, "199" = Venus`;
        displayMessage(message);
        return;
    }

    const data = { id, coordinateCenter, date }

    return fetch('/api/post-addBody/', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authenticated.authToken}`,
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(({ message }) => {
            displayMessage(message);
            cancelAddBodyClick();
            fetchData();
        })
        .catch(error => {
            console.error(error);
        });
}

export function addData(setFormattedData, setFormattedDataHtml, addDataClick, formattedData, cancelAddDataClick, displayMessage) {

    // Selection de l'option
    const selectedDataType = document.getElementById("dataType").value;

    const typeMappings = {
        'meanRadius': 'rayon moyen',
        'siderealRotPeriod': 'période de rotation',
        'mass': 'masse',
        'density': 'densité',
    };

    // Controle anti doublon des données
    if (formattedData.physicalData[selectedDataType]) {
        const message = `Le corps a déjà une donnée du type ${typeMappings[selectedDataType]}, choisissez une autre option.`;
        displayMessage(message);
        return;
    }

    // Créer une copie des données
    const reformattedData = { ...formattedData };

    const singleInputType = ["meanRadius", "siderealRotPeriod", "density"]
    if (singleInputType.includes(selectedDataType)) {
        const property = { value: "" };
        reformattedData.physicalData[selectedDataType] = property;
        setFormattedData(reformattedData);
    }
    else {
        const property = { value: "", exponent: "" };
        reformattedData.physicalData[selectedDataType] = property;
        setFormattedData(reformattedData);
    }

    const htmlRender = formattedDataHtmlRender(reformattedData, setFormattedData, addDataClick);
    setFormattedDataHtml(htmlRender);
    cancelAddDataClick()

    const message = `La donnée ${typeMappings[selectedDataType]}, a été ajouté.`;
    displayMessage(message);

}

export async function exportData(displayMessage, bodyCheckboxes) {

    const identityData = document.getElementById("check-identityData").checked;
    const physicData = document.getElementById("check-physic-data").checked;
    const astronomicData = document.getElementById("check-astronomic-data").checked;

    const bodyList = Object.entries(bodyCheckboxes)
        .filter(([key, value]) => value === true)
        .map(([key]) => key);

    const data = {
        identityData,
        physicData,
        astronomicData,
        bodyList
    }

    if (bodyList.length === 0) {
        return displayMessage("Votre liste de corps exportés est vide.");
    }

    try {
        const response = await fetch('/api/post-exportData/', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const { message, result } = await response.json();
            const jsonString = JSON.stringify(result, null, 2);
            // console.log(result);

            // Créer un lien temporaire
            const url = window.URL.createObjectURL(new Blob([jsonString]));

            // Créer un élément d'ancre pour le téléchargement
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'exportedData.json');

            // Ajouter le lien à la page et déclencher le téléchargement
            document.body.appendChild(link);
            link.click();

            // Nettoyer l'URL objet après le téléchargement
            window.URL.revokeObjectURL(url);

            displayMessage(message);
        }
        else {
            const { message } = await response.json();
            console.log(message);
            displayMessage(message);
            return message;
        }
    }
    catch (error) {
        console.error('Erreur lors de l\'envoi de la requête:', error);
    }
}

export function renderExportBodiesList(ephemerisList, typeCheckboxes, setTypeCheckboxes, bodyCheckboxes, setBodyCheckboxes) {

    // Vérifier si ephemerisList est défini
    if (ephemerisList === undefined) {
        // ephemerisList n'est pas pret !
        return
    }

    // Initialiser toutes les cases à cocher à true par défaut
    let newTypeCheckboxes = { ...typeCheckboxes };
    let newBodyCheckboxes = { ...bodyCheckboxes };

    if (Object.keys(newTypeCheckboxes).length === 0) {

        newTypeCheckboxes = Object.keys(ephemerisList).reduce((acc, type) => {
            acc[type] = true;
            return acc;
        }, {});

        newBodyCheckboxes = Object.values(ephemerisList).flat().reduce((acc, file) => {
            if (file.type) {
                acc[file.id] = true;
            }
            return acc;
        }, {});
    }

    // Mapping des types de corps en francais
    const typeMappings = {
        'undefined': 'Indéfini',
        'stars': 'Étoiles',
        'telluric-planet': 'Planètes telluriques',
        'gas-giant-planet': 'Planètes géantes gazeuses',
        'dwarf-planet': 'Planète naine',
        'moon': 'Lune',
        'asteroid': 'Astéroïde',
        'comet': 'Comète',
        'barycentre': 'Barycentre',
    };

    // Fonction pour gérer le changement d'état de la case à cocher de type
    const handleTypeCheckboxChange = (type) => {
        newTypeCheckboxes = { ...newTypeCheckboxes, [type]: !newTypeCheckboxes[type] };
        setTypeCheckboxes(newTypeCheckboxes);

        // Mettre à jour l'état des cases à cocher de corps en fonction de la case à cocher de type
        ephemerisList[type].forEach(file => {
            const key = file.id;
            newBodyCheckboxes[key] = newTypeCheckboxes[type];
        });

        setBodyCheckboxes(newBodyCheckboxes);
    };

    // Fonction pour gérer le changement d'état de la case à cocher de corps
    const handleBodyCheckboxChange = (key) => {
        let type = 'undefined';

        if (!ephemerisList.undefined.includes(key)) {
            const matchingFile = Object.values(ephemerisList).flat().find(file => file.id === key);
            type = matchingFile?.type || 'undefined';
        }

        newBodyCheckboxes = { ...newBodyCheckboxes, [key]: !newBodyCheckboxes[key] };
        setBodyCheckboxes(newBodyCheckboxes);

        // Les corps qui n'ont pas de 'type' defini (ex: "barycentre", "moon", etc ...) sont ecartés de l'export
        if (type !== 'undefined') {
            const allChecked = ephemerisList[type].every(file => newBodyCheckboxes[file.id]);
            newTypeCheckboxes = { ...newTypeCheckboxes, [type]: allChecked };
            setTypeCheckboxes(newTypeCheckboxes);
        }
    };

    // Initialisation des états "bodyCheckboxes" et "typeCheckboxes"
    if (Object.keys(bodyCheckboxes).length === 0) {
        setTypeCheckboxes(newTypeCheckboxes);
        setBodyCheckboxes(newBodyCheckboxes);
    }

    return Object.keys(ephemerisList).map(type => (
        type !== "undefined" ? (
            <Accordion
                key={`accordion-${type}`}
                idChild={`accordion-${type}`}
                label={`${typeMappings[type] || type}: ${ephemerisList[type].length}`}
                view="close"
            >
                <div className="form-check">
                    <label className="form-check-label" htmlFor={`check-${type}`}><h3>{typeMappings[type]}</h3></label>
                    <input
                        id={`check-${type}`}
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        checked={typeCheckboxes[type] || false}
                        onChange={() => handleTypeCheckboxChange(type)}
                    />
                </div>
                <ul>
                    {ephemerisList[type].map(file => {
                        const key = file.id;
                        return (
                            <li key={`corps-${key}`} id={`corps-${key}`} >
                                <div className="form-check">
                                    <label className="form-check-label" htmlFor={`check-${key}`} >{file.id} / {file.name}</label>
                                    <input
                                        id={`check-${key}`}
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        checked={bodyCheckboxes[key] || false}
                                        onChange={() => handleBodyCheckboxChange(key)}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </Accordion>
        ) : null
    ));
}

