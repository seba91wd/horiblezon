// ========================================================================================================== //
// SingleInputForm.js
//
// Props du composant:
// type             = choisir (text || select).
// label            = texte du bouton.
// categoryName     = représente le type de données reçu par le champ du formulaire.
// categoryValue    = valeur affichée dans le champ.
// placeholder      = Contenu affiché si la balise est vide
// options          = contient les options de la balise <select>
// dataProps        = données du formulaire
// setFormattedData = permet la mise a jour des données du formulaire
// 
// Sous composant utilisés:
// InfoSticker
//
// Note: 1 - Dans le cas ` SingleInputForm type="select" `, le props "categoryValue" affichera par défaut l'option choisie.
//
// exemple utilisation:
/* 
    Type: text
    <SingleInputForm type="text" label="Nom du corps:" categoryName="bodyName" categoryValue="Mars" placeholder="Pluto" />

    Type: select
    <SingleInputForm type="select" label="Type du corps:" categoryName="bodyType" categoryValue="telluric-planet"
        options={[
            { value: 'undefined', text: 'Indéfini' },
            { value: 'stars', text: 'Étoile' },
            { value: 'telluric-planet', text: 'Planète tellurique' },
        ]}
    /> 
*/
// ========================================================================================================== //


import React, { useState } from 'react';
import InfoSticker from './InfoSticker';

const SingleInputForm = (props) => {
    const { type, label, categoryName, categoryValue, placeholder, options, dataProps, setFormattedData } = props;

    // Déclarer un état local pour stocker la valeur du champ de formulaire
    const [inputValue, setInputValue] = useState(categoryValue);

    const recursiveUpdate = (data, parameter, childParameter, value, parentKey = null) => {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                // Vérifiez d'abord la correspondance avec le paramètre actuel
                if (key === parameter) {
                    if (childParameter && childParameter in data[key]) {
                        data[key][childParameter] = value;
                        // Mettre à jour le state extracttedData
                        setFormattedData({...dataProps});
                        console.log("Update", parameter, childParameter, value);
                        return;
                    }
                } 
                else if (typeof data[key] === 'object') {
                    // Si la valeur est un objet, recherchez récursivement à l'intérieur de cet objet
                    recursiveUpdate(data[key], parameter, childParameter, value, key);
                }
            }
        }
    
        if (parentKey && data[parentKey]) {
            // Remontez d'un niveau si la propriété parente existe
            recursiveUpdate(data[parentKey], parameter, childParameter, value, parentKey);
        }
    };
    
    const handleChange = (event) => {
        // Modification de la valeur du champ
        setInputValue(event.target.value);
        console.log('Modification de la valeur du champ', event.target.value);
    };

    const handleBlur = () => {
        // Focus perdu par le champ
        // Evenement: confirmation de la prise en compte de la saisie
        const [param, childParam] = categoryName.split('-');
        recursiveUpdate(dataProps, param, childParam, inputValue);
    };

    return (
        <div className="input-form">
            <label htmlFor={`${categoryName}`} className="label-category1 d-flex justify-content-center align-items-center btn btn-info">
                {label}
            </label>
            <InfoSticker idSticker={categoryName} />
            {type === 'text' && (
                <input
                    type="text"
                    id={categoryName}
                    className="input-text1 value"
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                />
            )}

            {type === 'select' && (
                <select
                    id={categoryName}
                    className="input-text1 value"
                    value={inputValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.text}
                        </option>
                    ))}
                </select>
            )}

        </div>
    );
};

export default SingleInputForm;
