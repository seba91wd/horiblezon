// ========================================================================================================== //
// InfoSticker.js
//
// Props du composant:
// idSticker = id du span
//
// Note: Utiliser `onClick={stickerSwitch}` pour afficher/masquer avec un click (ligne 51).
//
// exemple utilisation:
/* 
    <InfoSticker idSticker={categoryName} /> 
*/
// ========================================================================================================== //

import React from 'react';
import { useState } from "react"

const InfoSticker = (props) => {

    const { idSticker } = props;

    const [stickerOpen, setStickerOpen] = useState(false)

    const stickerSwitch = () => {
        setStickerOpen(prevState => !prevState)
    }
    const stickerClose = () => {
        setStickerOpen(false)
    }

    // Entrez ici les descriptions affichés dans les InfoSticker.
    // Le parametre "case" est extrait de l'id de la balise parent du composant InfoSticker, ici cette id est reflété dans le props "idSticker"
    const getMessage = () => {
        const suffix = "-value"
        switch (idSticker) {
            case `name${suffix}`:
                return (<p>Préférez le nom anglais du corps céleste par souci d’uniformité des données.<br />Exemple: Mercure ➡ Mercury</p>);

            case `type${suffix}`:
                return 'Le type du corps ne doit pas etre "indéfini" pour être extrait vers la base de données.';

            case `id${suffix}`:
                return 'Il s\'agit du numéro d\'identification du corps dans la base de données du système Horizon du JPL(NASA).';

            case `coordinateCenter${suffix}`:
                return 'Indique le point central par rapport auquel les coordonnées sont calculées pour le corps céleste sélectionné.';

            case `meanRadius${suffix}`:
                return (<p>Correspond à la moyenne arithmétique des rayons minimaux et maximaux du corps céleste.<br />Unité: km</p>);

            case `siderealRotPeriod${suffix}`:
                return (<p>Indiquez la durée nécessaire pour qu'un point fixe sur le corps céleste revienne à la même position par rapport aux étoiles.<br />Unité: jour</p>);

            case `mass${suffix}`:
                return (<p>La masse représente la quantité de matière d'une substance ou d'un objet.<br />Unité: kg</p>);

            case `density${suffix}`:
                return (<p>Définie une quantité de masse par une unité de volume.<br />Unité: g/cm³</p>);

            case `jdtdb${suffix}`:
                return 'Le JDTDB est une mesure du temps astronomique basée sur le Jour Julien. Il représente la date et l\'heure d\'un événement astronomique spécifique, fournissant un repère temporel précis dans les éphémérides';

            case `date${suffix}`:
                return (<p>Date des relevés selon le calendrier grégorien (traditionnel)<br />Unité: YYYY-MMM-DD hh:mm:ss</p>);

            case `eccentricity${suffix}`:
                return 'Mesure l\'aplatissement de l\'orbite par rapport à un cercle parfait, avec une valeur de 0 pour une orbite circulaire et de 1 pour une orbite complètement elliptique.';

            case `periapsis${suffix}`:
                return (<p>Distance minimale entre le corps céleste et le foyer de son orbite.<br />Unité: km</p>);

            case `inclination${suffix}`:
                return (<p>Représentant l'angle entre le plan de son orbite et le plan de référence.<br />Unité: degré</p>);

            case `longitudeNode${suffix}`:
                return (<p>Angle entre la direction du point vernal et la ligne des nœuds, dans le plan écliptique<br />Unité: degré</p>);

            case `argumentPerifocus${suffix}`:
                return (<p>Angle mesuré le long de l'orbite depuis le nœud ascendant jusqu'au périapse.<br />Unité: degré</p>);

            case `timePeriapsis${suffix}`:
                return (<p>Correspondant au moment où le corps céleste atteint son point orbital le plus proche du foyer de son orbite.<br />Unité: Julian Day Number</p>);

            case `meanMotion${suffix}`:
                return (<p>Défini la vitesse angulaire moyenne de déplacement du corps le long de son orbite.<br />Unité: degré/sec</p>);

            case `meanAnomaly${suffix}`:
                return (<p>Représentant l'angle fictif dans une orbite circulaire imaginaire se déplaçant à une vitesse constante.<br />Unité: degré</p>);

            case `trueAnomaly${suffix}`:
                return (<p>L'anomalie réelle caractérise la position actuelle du corps céleste le long de son orbite elliptique à un moment donné.<br />Unité: degré</p>);

            case `semiMajorAxis${suffix}`:
                return (<p>Représente la moitié de la plus grande dimension de l'orbite elliptique. Elle caractérise la taille et la forme générale de l'orbite.<br />Unité: km</p>);

            case `apoapsis${suffix}`:
                return (<p>Distance maximale entre le corps céleste et le foyer de son orbite.<br />Unité: km</p>);

            case `siderealOrbitPeriod${suffix}`:
                return (<p>Représentant le temps nécessaire pour effectuer une révolution complète autour de son foyer orbital.<br />Unité: sec</p>);

            case `dataType`:
                return (<p>Choisissez dans la liste, le type de données à ajouter au corps, puis validez.</p>);

            case `add-id${suffix}`:
                return 'Il s\'agit du numéro d\'identification du corps dans la base de données du système Horizon du JPL(NASA).';

            case `add-coordinateCenter${suffix}`:
                return 'Indique le point central par rapport auquel les coordonnées sont calculées pour le corps céleste sélectionné.';

            case `add-date${suffix}`:
                return (<p>Date des relevés selon le calendrier grégorien (traditionnel)<br />Unité: YYYY-MMM-DD hh:mm:ss</p>);

            case `login`:
                return 'Saisissez votre identifiant.';

            default:
                return 'Message par défaut.';
        }
    };

    return (
        <>
            <span
                id={`${idSticker}-sticker`}
                className='info-sticker'
                // onClick={stickerSwitch}
                onMouseEnter={stickerSwitch}
                onMouseLeave={stickerClose}
            >i
            </span>
            {/* tooltip itself */}
            {stickerOpen &&
                <div className="info-content">
                    {getMessage()}
                </div>}
        </>
    )
}

export default InfoSticker;
