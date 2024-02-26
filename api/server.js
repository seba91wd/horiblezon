// server.js

require('dotenv').config()
const express = require('express');
const path = require('path');
const app = express();

const port = process.env.BACK_PORT;
let hostname
if (process.env.REACT_DOCKER_ENV === 'true') {
    hostname = process.env.DOCKER_HOST;
}
else {
    hostname = process.env.HOST;
}

// Contenu statique
app.use(express.static(path.join(__dirname, 'public', 'build')));

app.use(express.json());

// Message
app.get('/api', async (req, res) => {
    res.status(200).json({
        name   : 'horiblezon-api', 
        version: '1.0', 
        status : 200, 
        message: 'Bienvenue sur l\'API Horiblezon :) !!!'
    });
});

// Routes
require('./src/routes/getEphemeris')(app);
require('./src/routes/postExtractData')(app);
require('./src/routes/postAddBody')(app);
require('./src/routes/postExportData')(app);
require('./src/routes/postLoginUser')(app);

app.listen(port, hostname, () => {
    console.log(`Backend démarée sur http://${hostname}:${port}/api`);
});