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
                renderBathroomList(json, lat, lng);
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

const renderBathroomList = (json, userLat, userLng) => {
    const resultsListDiv = document.getElementById("#results-listing");
    
    for(i=0; i<json.length; i++) {
      const name = json[i].name;
      const street = json[i].street;
      const city = json[i].city;
      const state = json[i].state;
      const destLat = json[i].latitude;
      const destLng = json[i].longitude;
      const distance = Number(json[i].distance).toFixed(2);
      const unisex = json[i].unisex ? 'yes':'no';
  
      const bathroomListEntry = {
        name: name, 
        address: `${street} /n ${city}, ${state}`,
        unisex: unisex,
        distance: distance,
      }

      bathroomName.textContent = bathroomListEntry.name;
      bathroomDist.textContent = `Distance: ${bathroomListEntry.distance}`;
      bathroomAddress.textContent = bathroomListEntry.address;
      bathroomUnisex.textContent = `Unisex: ${bathroomListEntry.unisex}`;
      dirButton.textContent = `Get directions`;

      const bathroomDiv = document.createElement('div');
      const bathroomHeaderDiv = document.createElement('div');
      const bathroomName = document.createElement('h3');
      const bathroomDist = document.createElement('h3');
      const bathroomTextDiv = document.createElement('div');
      const bathroomContentDiv = document.createElement('div');
      const bathroomAddress = document.createElement('p');
      // const bathroomCity = document.createElement('p');
      // const bathroomState = document.createElement('p');
      const bathroomUnisex = document.createElement('p');
      const dirButton = document.createElement('button');

      resultsListDiv.addClass(
        'bg-blue=950 border border-2 border-solid border-slate-700'
      )

      bathroomDiv.addClass(
        'bg-slate-900 border border-2 border-solid border-slate-700 m-1 flex justify-between'
      );

      bathroomHeaderDiv.addClass(
        'border-b-1 border-solid border-slate-600 mx-1 flex flex-row p-1'
      );

      bathroomName.addClass(
        'text-sky-300 font-bold flex-none pl-1 px-1 mr-2 basis-2/3 text-lg'
      );

      bathroomDist.addClass(
        'text-sky-300 font-bold flex-none pr-1 px-1 ml-2 basis-1/3 text-lg'
      );

      bathroomContentDiv.addClass(
        'flex flex-row justify-stretch'
      );
      
      bathroomTextDiv.addClass(
        'p-1 m-1 justify-start'
      );

      bathroomAddress.addClass(
        'text-sky-300 text-sm mb-1'
      );

      bathroomUnisex.addClass(
        'text-sky-300 text-sm'
      );

      dirButton.addClass(
        'justify-end p-1 m-1 text-base text-blue-950 text-semibold bg-sky-300 border border-1 border-slate-700'
      )

      bathroomHeaderDiv.append(bathroomName, bathroomDist);
      bathroomTextDiv.append(bathroomAddress, bathroomUnisex)
      bathroomContentDiv.append(bathroomTextDiv, dirButton)
      bathroomDiv.append(bathroomHeaderDiv, bathroomContentDiv);
      resultsListDiv.append(bathroomDiv);
    
      // event listener to center map
      //event listener to send to GoogleMaps
      // getGoogleMapDirURL (userLat, userLon, bathroomLat, bathroomLon)
    }

      
}

/*
Search restroom by the address input
Fetch geocode from Geoapify, then pass to fetchRestroomsByLocation
*/
function getRestroomsByAddress() {
  const addrEl = document.querySelector("#address-input");

  return new Promise((resolve, reject) => {
    fetch("https://api.geoapify.com/v1/geocode/search?text=" + addrEl.value.trim() + "&apiKey=3711ee29d36e4eac92f367e2842a812a&limit=1&bias=countrycode:us")
    .then((response) => {
        console.log(response);
        response.json()
        .then((addrJson) => {
            console.log("Addr geocode Recieved json:");
            fetchRestroomsByLocation(addrJson.features[0].geometry.coordinates[1], addrJson.features[0].geometry.coordinates[0], 10)
            .then((json) => {
                resolve({
                    bathroomJson: json,
                    latitude: addrJson.features[0].geometry.coordinates[1],
                    longitude: addrJson.features[0].geometry.coordinates[0]
                });
            })
        })
    })
    .catch((error) => {
        console.log("failed to grab restrooms with error ");
        console.log(error);
        reject(error);
    })
    .finally(() => {
        addrEl.value = "";
    })
  })
}

function wipeResultsContainer() {
  document.querySelector("#results-container").innerHTML = "";
}

function getGoogleMapDirURL (userLat, userLon, bathroomLat, bathroomLon) {
  return "https://www.google.com/maps/dir/" + userLat + "," + userLon + "/" + bathroomLat + "," + bathroomLon ;
}
/*
Event listeners for the address search bar and button. 
*/
document.querySelector("#address-search-btn").addEventListener("click", function(event){
    getRestroomsByAddress()
    .then((json) => {
        const position = {
            coords: {
                latitude: json.latitude,
                longitude: json.longitude
            }
        }
        renderMapAtPosition(position, "demoMap", json.bathroomJson);
    })
});
document.querySelector("#address-input").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector("#address-search-btn").click();
  }
});
document.querySelector("#near-search-btn").addEventListener("click", function(event){
    navigator.geolocation.getCurrentPosition(successfulLocationGrab, errorOnLocationGrab);
})