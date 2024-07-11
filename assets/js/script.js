/*
arguments: lng, longitude of the location, number
lat, latitude of the location, number
num, nunber to return

returns: json response
*/
// Access the classes through the global ol namespace


let POSITION = null;

const fetchRestroomsByLocation = (lat, lng, num) => {
    return new Promise((resolve, reject) => {
        fetch("https://www.refugerestrooms.org/api/v1/restrooms/by_location?lat=" + lat + "&lng=" + lng + "&number=" + num)
        .then((response) => {
            console.log(response);
            response.json()
            .then((json) => {
                console.log("Recieved restroom json");
                resolve(json);
            })
        })
        .catch((error) => {
            console.log("failed to grab restrooms with error ");
            console.log(error);
            reject(error);
        })
    })
};

const renderMapAtPosition = (position, target, json) => {
    console.log("rendering map with positions:");
    var lat            = position.coords.latitude;
    var lon            = position.coords.longitude;
    var zoom           = 18;

    var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transform from WGS 1984
    var toProjection   = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
    var position       = new OpenLayers.LonLat(lon, lat).transform( fromProjection, toProjection);

    wipeResultsContainer();

    map = new OpenLayers.Map("results-container");
    var mapnik         = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);

    var markers = new OpenLayers.Layer.Markers( "Markers" );
    map.addLayer(markers);
    let homeMarker = new OpenLayers.Icon("/assets/images/marker.png", {w: 21, h: 25}, {x: -10.5, y: -25})
    markers.addMarker(new OpenLayers.Marker(position, homeMarker));
    
    for (bathroom of json){
        console.log("rendering marker at " + bathroom.longitude + ", " + bathroom.latitude);
        const bathroomIcon = new OpenLayers.Icon("/assets/images/toilet.png", {w: 21, h: 25}, {x: -10.5, y: -25});
        markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(bathroom.longitude, bathroom.latitude).transform( fromProjection, toProjection)
        , bathroomIcon))
    }
    map.setCenter(position, zoom);
}
const successfulLocationGrab = (position) => {
    fetchRestroomsByLocation(position.coords.latitude, position.coords.longitude)
    .then((json) => {
        renderMapAtPosition(position, "demoMap", json)
    });
}
const errorOnLocationGrab = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

/*
Search restroom by the address input
Fetch geocode from Geoapify, then pass to fetchRestroomsByLocation
*/
function getRestroomsByAddress() {
  const addrEl = document.querySelector("#address-input");

  new Promise((resolve, reject) => {
    fetch("https://api.geoapify.com/v1/geocode/search?text=" + addrEl.value.trim() + "&apiKey=3711ee29d36e4eac92f367e2842a812a&limit=1&bias=countrycode:us")
    .then((response) => {
        console.log(response);
        response.json()
        .then((json) => {
            console.log("Addr geocode Recieved json:");
            resolve(json);
            fetchRestroomsByLocation(json.features[0].geometry.coordinates[1], json.features[0].geometry.coordinates[0], 10)
            .then((json) => {
                console.log(json)
            })
        })
    })
    .catch((error) => {
        console.log("failed to grab restrooms with error ");
        console.log(error);
        reject(error);
    })
  })
  addrEl.value = "";
}

function wipeResultsContainer() {
  document.querySelector("#results-container").innerHTML = "";
}

function getGoogleMapDirURL (userLat, userLon, bathroomLat, bathroomLon) {
  return "https://www.google.com/maps/dir/" + userLat + "," + userLon + "/" + bathroomLat + "," + bathroomLon ;
}

navigator.geolocation.getCurrentPosition(successfulLocationGrab, errorOnLocationGrab);

/*
Event listeners for the address search bar and button. 
*/
document.querySelector("#address-search-btn").addEventListener("click", getRestroomsByAddress);
document.querySelector("#address-input").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector("#address-search-btn").click();
  }
});