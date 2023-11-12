const mapSocket2 = io();
var map;

function initMap() {
    const center = { lat: 40.774102, lng: -73.971734 }; // todo: current location
    const options = { zoom: 15, scaleControl: true, center: center };
    map = new google.maps.Map(
        document.getElementById('map'), options);

    new google.maps.places.Autocomplete(
        document.getElementById("from_place2")
    );
    new google.maps.places.Autocomplete(
        document.getElementById("to_place2")
    );
}

const renderMarkersAndRoute = ({ origin, destination }) => {
    var mk1 = new google.maps.Marker({ position: origin, map: map }); // todo: remove : map
    var mk2 = new google.maps.Marker({ position: destination, map: map });

    // directions
    let directionsService = new google.maps.DirectionsService();
    let directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    const route = {
        origin,
        destination,
        travelMode: 'DRIVING'
    }

    directionsService.route(route,
        function (response, status) {
            if (status !== 'OK') {
                window.alert('Directions request failed due to ' + status);
                return;
            } else {
                directionsRenderer.setDirections(response); // Add route to the map
                var directionsData = response.routes[0].legs[0]; // Get data about the mapped route
                if (!directionsData) {
                    window.alert('Directions request failed');
                    return;
                }
                else {
                    document.getElementById('msg').innerHTML += " Driving distance is " + directionsData.distance.text + " (" + directionsData.duration.text + ").";
                }
            }
        }
    );
};

const fromPlace2 = document.getElementById("from_place2");
const toPlace2 = document.getElementById("to_place2");

document.getElementById("submit-from-and-to").addEventListener("click", () => {
    mapSocket2.emit('getLatLongOfFrom', fromPlace2.value);
});

mapSocket2.on('postLatLongOfFrom', (fromLatLong) => {
    const finalLatLong = {
        from: fromLatLong
    };
    mapSocket2.emit('getLatLongOfTo', toPlace2.value, finalLatLong);
});

mapSocket2.on('postLatLongOfTo', (toLatLong, finalLatLong) => {
    finalLatLong.to = toLatLong;
    renderMarkersAndRoute({
        origin: finalLatLong.from, 
        destination: finalLatLong.to
    });
});
