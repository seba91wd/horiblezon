// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import Horiblezon from './pages/Horiblezon';
// import './styles/index.css';
// import './styles/components.css';

// const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(
//     <React.StrictMode>
//         <Horiblezon />
//     </React.StrictMode>
// );


import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './styles/index.css';
import './styles/components.css';

import Horiblezon from './pages/Horiblezon';
import NotFound from './pages/NotFound';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <Router>
            <Routes>
                <Route path="/" element={<Horiblezon />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    </React.StrictMode>
);
