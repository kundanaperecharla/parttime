const mapSocket1 = io();
var map;

function initMap() {
    console.log("YEs");
    const center = { lat: 40.774102, lng: -73.971734 }; // todo: current location
    const options = { zoom: 15, scaleControl: true, center: center };
    map = new google.maps.Map(
        document.getElementById('map'), options);

    new google.maps.places.Autocomplete(
        document.getElementById("to_place")
    );
}

const toPlace = document.getElementById("to_place");

document.getElementById("submit-to").addEventListener("click", () => {
    mapSocket1.emit('getLatLongOfTo', toPlace.value, {});
});

mapSocket1.on('postLatLongOfTo', (toLatLong, finalLatLong) => {
    var mk2 = new google.maps.Marker({ position: toLatLong, map: map });
    map.setCenter(toLatLong);
});
