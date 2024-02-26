// NotFound.js
import React, { useEffect } from 'react';

const NotFound = () => {

    useEffect(() => {
        document.title = '404 - Page Not Found'
    })

    return (
        <div>
            <h2>404 - Page Not Found</h2>
            <p>Sorry, the page you are looking for does not exist.</p>
        </div>
    );
};

export default NotFound;
