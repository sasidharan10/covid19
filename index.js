const express = require('express');
const axios = require('axios');
const app = express();
const host = "127.0.0.1";
const port = process.env.PORT || 5000;

app.use(express.static('static'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'html');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/data', (req, res) => {
    res.sendFile(__dirname + '/static/json/newCovid.json');
});

app.listen(port, () => {
    console.log(`The application started successfully at : http://${host}:${port}`);
});
