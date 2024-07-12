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
                // renderBathroomList(json, lat, lng);
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
    document.querySelector("#OpenLayers_Map_2_OpenLayers_ViewPort").classList.add("rounded-md");
}
const successfulLocationGrab = (position) => {
    fetchRestroomsByLocation(position.coords.latitude, position.coords.longitude)
    .then((json) => {
        renderMapAtPosition(position, "demoMap", json)
        renderBathroomList(json, position.coords.latitude, position.coords.longitude)
    });
}
const errorOnLocationGrab = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

const renderBathroomList = (json, userLat, userLng) => {
  document.querySelector("main").setAttribute("class", "row-span-4 w-svw");
  console.log(json)
  
  for(i=0; i<5; i++) {
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
      address1: `${street}`,  
      address2: `${city}, ${state}`,
      unisex: unisex,
      distance: distance,
    }

    const resultsListDiv = document.querySelector("#results-listing");
    const bathroomDiv = document.createElement('div');
    const bathroomHeaderDiv = document.createElement('div');
    const bathroomName = document.createElement('h3');
    const bathroomDist = document.createElement('p');
    const bathroomTextDiv = document.createElement('div');
    const bathroomContentDiv = document.createElement('div');
    const bathroomAddress1 = document.createElement('p');
    const bathroomAddress2  = document.createElement('p');
    const bathroomUnisex = document.createElement('p');
    const dirButton = document.createElement('button');
    
    addListTextContent(dirButton, bathroomName, bathroomDist, bathroomAddress1, bathroomAddress2, bathroomUnisex, bathroomListEntry);

    setListElementAttributes(resultsListDiv, bathroomHeaderDiv, bathroomTextDiv, bathroomContentDiv, bathroomDiv, bathroomName, bathroomDist, bathroomAddress1, bathroomAddress2, bathroomUnisex, dirButton);

    appendBathroomListElements(resultsListDiv, bathroomHeaderDiv, bathroomTextDiv, bathroomContentDiv, bathroomDiv, bathroomName, bathroomDist, bathroomAddress1, bathroomAddress2, bathroomUnisex, dirButton);
  }  
}

//adding text to list elements
function addListTextContent(dirButton, bathroomName, bathroomDist, bathroomAddress1, bathroomAddress2, bathroomUnisex, bathroomListEntry) {
  dirButton.textContent = `Get directions`;
  bathroomName.textContent = bathroomListEntry.name;
  bathroomDist.textContent = `Distance: ${bathroomListEntry.distance}`;
  bathroomAddress1.textContent = bathroomListEntry.address1;
  bathroomAddress2.textContent = bathroomListEntry.address2;
  bathroomUnisex.textContent = `Unisex: ${bathroomListEntry.unisex}`;
}

//setting tailwind style attributes for html list elements
function setListElementAttributes(resultsListDiv, bathroomHeaderDiv, bathroomTextDiv, bathroomContentDiv, bathroomDiv, bathroomName, bathroomDist, bathroomAddress1, bathroomAddress2, bathroomUnisex, dirButton) {
  resultsListDiv.setAttribute(
    'class',
    'bg-slate-900 border border-2 border-solid rounded-md border-slate-700 overflow-y-auto w-11/12 mx-auto row-span-3 mt-2'
  )

  bathroomDiv.setAttribute(
    'class',
    'bg-blue-950 border border-2 border-solid rounded-lg border-slate-700 m-1 flex flex-col place-content-between'
  );

  bathroomHeaderDiv.setAttribute(
    'class',
    'border-b-2 border-solid border-slate-600 flex flex-row p-1 place-content-between w-9/10'
  );

  bathroomName.setAttribute(
    'class',
    'text-sky-300 font-bold flex-none pl-1 basis-2/3 text-base'
  );

  bathroomDist.setAttribute(
    'class',
    'text-sky-300 font-semibold basis-1/3 max-w-fit text-base mr-2'
  );

  bathroomContentDiv.setAttribute(
    'class',
    'flex flex-row place-content-between pr-3'
  );
  
  bathroomTextDiv.setAttribute(
    'class',
    'p-1 justify-start ml-3'
  );

  bathroomAddress1.setAttribute(
    'class',
    'text-sky-300 text-xs'
  );

  bathroomAddress2.setAttribute(
    'class',
    'text-sky-300 text-xs mb-1'
  );

  bathroomUnisex.setAttribute(
    'class',
    'text-sky-300 text-xs'
  );

  dirButton.setAttribute(
    'class',
    'py-1 px-2 m-2 text-xs text-blue-950 text-900 bg-sky-300 border border-3 border-slate-900 rounded-full w-1/4 max-w-fit h-1/4 justify-self-end self-end'
  )
}

//appending the elements together and onto the html
function appendBathroomListElements (resultsListDiv, bathroomHeaderDiv, bathroomTextDiv, bathroomContentDiv, bathroomDiv, bathroomName, bathroomDist, bathroomAddress1, bathroomAddress2, bathroomUnisex, dirButton) {
  bathroomHeaderDiv.append(bathroomName, bathroomDist);
  bathroomTextDiv.append(bathroomAddress1, bathroomAddress2, bathroomUnisex)
  bathroomContentDiv.append(bathroomTextDiv, dirButton)
  bathroomDiv.append(bathroomHeaderDiv, bathroomContentDiv);
  resultsListDiv.append(bathroomDiv);
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
        renderBathroomList(json, position.coords.latitude, position.coords.longitude)
    })
});
document.querySelector("#address-input").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    document.querySelector("#address-search-btn").click();
  }
});
document.querySelector("#near-search-btn").addEventListener("click", function(event){
  document.querySelector("#results-listing").innerHTML = ""
  navigator.geolocation.getCurrentPosition(successfulLocationGrab, errorOnLocationGrab);
})