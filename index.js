require('dotenv').config()
const express = require('express');
const axios = require('axios');
const app = express();
const host = "127.0.0.1";
const port = process.env.PORT || 5000;

const RapidApiKey = process.env.RAPIDAPIKEY;
const RapidApiHost = process.env.RAPIDAPIHOST;

app.use(express.static('static'));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/data', (req, res) => {
  res.sendFile(__dirname + '/static/json/newCovid.json');
});

app.get('/api', (req, res) => {
  const url = "https://covid-19-tracking.p.rapidapi.com/v1";
  const options = {
    method: 'GET',

    headers: {
      'X-RapidAPI-Key': RapidApiKey,
      'X-RapidAPI-Host': RapidApiHost
    }
  };
  axios.get(url, options)
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

});

app.listen(port, () => {
  console.log(`The application started successfully at : http://${host}:${port}`);
});
