const express = require('express');
const path = require('path');

const app = express.Router();

module.exports = (app) => {
    app.get('/horiblezon', (req, res) => {
        console.log("horiblezon");
        // res.sendFile(path.join(__dirname, '../../../front/build/index.html'));
        res.sendFile(path.join(__dirname, '../../public/build/index.html'));
    })
}