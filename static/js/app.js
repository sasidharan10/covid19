mapboxgl.accessToken = 'pk.eyJ1Ijoic2FzaWRoYXJhbjEwIiwiYSI6ImNrcDhhdGtlYzA4Z3EydXA3OXc0NHl3N3QifQ.hhlLewMbrP5XZYGfGhhA0w';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [80, 20],
    zoom: 3.5,
    minZoom: 1
});

map.on('mouseover', () => {
    map.getCanvas().style.cursor = 'default'
})
map.on('mouseleave', () => {
    map.getCanvas().style.cursor = ''
})

map.addControl(
    new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false
    })
);

map.addControl(new mapboxgl.NavigationControl());
// map.dragRotate.disable();
// map.touchZoomRotate.disableRotation();
map.scrollZoom.disable();


let jsonString = JSON.stringify("/data");
const jsonData = JSON.parse(jsonString);   // to get local json data


const url = "https://covid-19-tracking.p.rapidapi.com/v1";
// const url = "https://api.covid19api.com/summary";
// const url = "https://mycovidapi-sj9z.onrender.com"; // custom API

const options = {
    method: 'GET',

    headers: {
        'X-RapidAPI-Key': '56bf2ba890msh46aeb5a3fd92fdfp1fa45djsnc141145c402f',
        'X-RapidAPI-Host': 'covid-19-tracking.p.rapidapi.com'
    }
};

fetch(url, options)
    .then((Response) => {
        console.log("API is working fine");
        return Response.json()
    }).catch((err) => {
        console.log("Covid19 API is down, Hence, data will be fetched from local json file");
        return fetch(jsonData).then(Response =>
            Response.json());
    })
    .then(res => {
        console.log("Populating data");
        populateData(res);
    }).catch(err => {
        console.log(err);
        console.log("Error Occured");
    });

function populateData(res) {
    let worldCases = document.getElementById("world-cases-count");
    let worldRecovered = document.getElementById("world-recovered-count");
    let worldDeaths = document.getElementById("world-deaths-count");

    let worldCasesCount = `<p>${res[0]["Total Cases_text"]}</p>`;
    let worldRecoveredCount = `<p>${res[0]["Total Recovered_text"]}</p>`;
    let worldDeathsCount = `<p>${res[0]["Total Deaths_text"]}</p>`;

    worldCases.innerHTML = worldCasesCount;
    worldRecovered.innerHTML = worldRecoveredCount;
    worldDeaths.innerHTML = worldDeathsCount;

    let i = 1;

    let table = document.getElementById("country-body");

    res.filter((a, b) => {
        return b > 0 && b < 232;
    }).forEach(elm => {

        const country = elm.Country_text;
        let totalCases, totalRecovered, totalDeath;
        if (elm["Total Cases_text"] !== "")
            totalCases = elm["Total Cases_text"];
        else
            totalCases = "N/A";

        if (elm["Total Recovered_text"] !== "")
            totalRecovered = elm["Total Recovered_text"];
        else
            totalRecovered = "N/A";

        if (elm["Total Deaths_text"] !== "")
            totalDeath = elm["Total Deaths_text"];
        else
            totalDeath = "N/A";

        const totalCasesInteger = parseInt(totalCases.replace(/,/g, ''), 10);

        let details =
            `<tr>
                        <td>${i}</td>
                        <td>${country}</td>
                        <td id="table-cases">${totalCases}</td>
                        <td id="table-recovered">${totalRecovered}</td>
                        <td id="table-deaths">${totalDeath}</td>
                    </tr>`;
        i++;

        table.innerHTML += details;

        let colors;

        if (totalCasesInteger >= 1000000) {
            colors = "rgb(255, 0, 0)";
        }
        else if (totalCasesInteger > 300000 && totalCasesInteger < 999999) {
            colors = "rgb(255, 102, 0)";
        }
        else if (totalCasesInteger > 100000 && totalCasesInteger < 299999) {
            colors = "rgb(255, 255, 0)";
        }
        else if (totalCasesInteger > 20000 && totalCasesInteger < 99999) {
            colors = "rgb(0, 204, 0)";
        }
        else {
            colors = "rgb(0, 255, 255)";
        }

        let popup = new mapboxgl.Popup(
            {
                offset: [0, 0],
                closeButton: false
            }
        ).setHTML(
            '<h3>' + country + '</h3><p id="infected">Infected &nbsp;&nbsp;&nbsp;&nbsp;&nbsp :&nbsp '
            + totalCases + '</p><p id="recovered">Recovered &nbsp:&nbsp ' + totalRecovered +
            '</p><p id="death">Deaths &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp : &nbsp'
            + totalDeath + '</p>'
        )

        let mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
        mapboxClient.geocoding
            .forwardGeocode({
                query: `${country}`,
                autocomplete: false,
                limit: 1
            })
            .send()
            .then(function (response) {
                if (
                    response &&
                    response.body &&
                    response.body.features &&
                    response.body.features.length
                ) {
                    let feature = response.body.features[0];
                    // console.log(response);

                    // Create a marker and add it to the map.
                    let marker = new mapboxgl.Marker({
                        draggable: false,
                        color: colors,
                        scale: 0.6  // resize
                    }).setLngLat(feature.center).addTo(map);

                    let element = marker.getElement();
                    // element.id = 'marker';
                    // hover event listener
                    element.addEventListener('mouseenter', () => popup.addTo(map));
                    element.addEventListener('mouseleave', () => popup.remove());

                    // add popup to marker
                    marker.setPopup(popup);

                }
            });
    });
}