// ========================================================================================================== //
// Accordion.js
//
// Props du composant:
// label    = texte du bouton.
// onClick  = maFonction().
// view     = choisir "open" || "close".
// collapse = choisir "" || "noCollapse", empêche de déplier / replier l'accordéon
// idChild  = Id de la balise enfant de l'accordéon
//
// Note: 1 - {children} est un nom réservé dans React qui est utilisé comme convention pour représenter tous 
//           les éléments situés entre les balises ouvrante et fermante d'un composant.
//       2 - uuidv4 est utilisé pour générer un id (tres probablement) unique pour chaque composant Accordion
//
// exemple utilisaion:
/* 
    <Accordion idChild="accordion1" label="Ajout manuel de données" view="close" collapse="">
        <p>Tutu</p>
    </Accordion> 
*/
// ========================================================================================================== //

import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const Accordion = (props) => {
    const { label, children, view, collapse, idChild } = props;
    const accordionId = uuidv4();
    const isOpen = view === 'open';
    const isCollapse = collapse === "noCollapse"

    return (
        <div className="accordion">
            <div className="accordion-item">
                <h2 className="accordion-header">
                    <button
                        className={`accordion-button${isOpen ? '' : ' collapsed'}${isCollapse ? ' noCollapsed' : ''}`}
                        type="button"
                        data-bs-toggle={isCollapse ? ''  : 'collapse'}
                        data-bs-target={`#collapse-${accordionId}`}
                        aria-expanded={isOpen ? 'true' : 'false'}
                        aria-controls={`collapse-${accordionId}`}
                    >
                        {label}
                    </button>
                </h2>
                <div
                    id={`collapse-${accordionId}`}
                    className={`accordion-collapse collapse${isOpen ? ' show' : ''}`}
                    aria-labelledby={`heading-${accordionId}`}
                >
                    <div id={idChild} className="accordion-body d-flex flex-column align-items-center">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Accordion;
