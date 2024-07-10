/*
arguments: lng, longitude of the location, number
lat, latitude of the location, number
num, nunber to return

returns: json response
*/

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
const successfulLocationGrab = (position) => {
    console.log("Position recieved: ");
    console.log(position);
    fetchRestroomsByLocation(position.coords.latitude, position.coords.longitude, 10)
    .then((json) => {
        console.log(json)
    })
}
function errorOnLocationGrab(err) {
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
