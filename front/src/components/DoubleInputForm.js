// ========================================================================================================== //
// DoubleInputForm.js
//
// Props du composant:
// label1, label2                = texte du bouton.
// categoryName1, categoryName2  = représente le type de données reçu par le champ du formulaire.
// value1, value2                = valeur affichée dans les champs.
//
// Sous composant utilisés:
// InfoSticker
//
// Note:
//
// exemple utilisation:
/* 
    <DoubleInputForm label1="Centre des coordonées:" label2="ID:" categoryName1="coordinateCenter" categoryName2="coordinateCenterId" value1="sun" value2="10" />
*/
// ========================================================================================================== //


import React, { useState } from 'react';
import InfoSticker from './InfoSticker';

const DoubleInputForm = (props) => {
    const { label1, label2, categoryName1, categoryName2, value1, value2, dataProps, setFormattedData } = props;

    // Déclarer des états locaux pour stocker les valeurs des champs de formulaire
    const [inputValue1, setInputValue1] = useState(value1);
    const [inputValue2, setInputValue2] = useState(value2);

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
                } else if (typeof data[key] === 'object') {
                    // Si la valeur est un objet, recherchez récursivement à l'intérieur de cet objet
                    recursiveUpdate(data[key], parameter, childParameter, value, key);
                }
            }
        }
    
        // Si nous sommes ici, cela signifie que la correspondance n'a pas été trouvée à ce niveau
        // Vous pouvez utiliser la variable parentKey pour remonter correctement le chemin
        if (parentKey && data[parentKey]) {
            // Remontez d'un niveau si la propriété parente existe
            recursiveUpdate(data[parentKey], parameter, childParameter, value, parentKey);
        }
    };

    const handleChange1 = (event) => {
        // Modification de la valeur du premier champ
        setInputValue1(event.target.value);
    };

    const handleChange2 = (event) => {
        // Modification de la valeur du deuxième champ
        setInputValue2(event.target.value);
    };

    const handleBlur1 = () => {
        // Focus perdu par le premier champ
        console.log('Champ 1 perdu le focus avec la valeur :', inputValue1);
        const [param, childParam] = categoryName1.split('-');
        recursiveUpdate(dataProps, param, childParam, inputValue1);
    };

    const handleBlur2 = () => {
        // Focus perdu par le deuxième champ
        console.log('Champ 2 perdu le focus avec la valeur :', inputValue2);
        const [param, childParam] = categoryName2.split('-');
        recursiveUpdate(dataProps, param, childParam, inputValue2);
    };

    return (
        <div className="input-form">
            <label htmlFor={`${categoryName1}`} className="label-category1 d-flex justify-content-center align-items-center btn btn-info">
                {label1}
            </label>
            <InfoSticker idSticker={categoryName1} />
            <input
                type="text"
                id={`${categoryName1}`}
                className="input-text2 value"
                value={inputValue1}
                onChange={handleChange1}
                onBlur={handleBlur1}
            />

            <label htmlFor={`${categoryName2}`} className="label-category2 btn btn-info">
                {label2}
            </label>
            {/* <InfoSticker idSticker={categoryName2} /> */}
            <input
                type="text"
                id={`${categoryName2}`}
                className="input-text3 value"
                value={inputValue2}
                onChange={handleChange2}
                onBlur={handleBlur2}
            />
        </div>
    );
};

export default DoubleInputForm;
