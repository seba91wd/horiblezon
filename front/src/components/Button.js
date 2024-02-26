// ========================================================================================================== //
// Button.js
//
// Props du composant:
// label     = texte du bouton
// className = classe(s) de style
// onClick   = fonction
//
// exemple utilisation:
/*
    <Button label="Cliquez-moi" className="btn-primary" onClick={ () => console.log("ButtonPrimary")} /> 
*/
// ========================================================================================================== //

import React from 'react';

const Button = (props) => {
    const { label, className, onClick } = props;
    return (
        <button type="button" className={`btn ${className}`} onClick={onClick}>
            {label}
        </button>
    );
};

export default Button;
