var locations = [];
var map;
var markers;
//var host = "http://127.0.0.1:9936/"
var host = "https://koenhabets.nl/api/owntracks/"

function initMap() {
    map = L.map('mapid').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors', detectRetina: true
    }).addTo(map);
}

initMap();

setMap(0, 99999999999);

function setMap(startTime, endTime) {
    clearMap();
    $.get(host + "info?startTime=" + startTime + "&endTime=" + endTime, function (data, status) {
        var jsonArray = JSON.parse(data);
        locations = [];
        for (i = 0; i < jsonArray.length; i++) {
            var item = jsonArray[i];
            locations.push([item.lat, item.lon]);
        }
        var polyline = L.polyline(locations, {color: 'red'}).addTo(map);
// zoom the map to the polyline
        map.fitBounds(polyline.getBounds());
    });
}

function setTimeline(date){
    $.get(host + "timeline?date=" + date, function (data, status) {
        console.log(data)
        var jsonArray = JSON.parse(data);
        $("#timeline").text("");
        markers = L.layerGroup()
        for (i = 0; i < jsonArray.length; i++) {
            var item = jsonArray[i];
            $("#timeline").prepend("<p>" + item.start.slice(5, -2) + " - " + item.end.slice(5, -2) + "<br>" + item.location + "</p>");
            var marker = L.marker([item.lat, item.lon]);
            marker.bindPopup(item.location + "<br>Start: " + item.start.slice(5, -2) + "<br>Einde: " + item.end.slice(5, -2))
            markers.addLayer(marker);
        }
        map.addLayer(markers)
    });
}

function clearMap() {
    try {
        map.removeLayer(markers);
    } catch (e) {
        console.log(e)
    }
    for (i in map._layers) {
        if (map._layers[i]._path != undefined) {
            try {
                map.removeLayer(map._layers[i]);
            } catch (e) {
                console.log("problem with " + e + map._layers[i]);
            }
        }
    }
}

function setDate() {
    var dateString = document.getElementById("datepicker").value;
    var dateStringSplit = dateString.split("-")
    var dateP = new Date(parseInt(dateStringSplit[0]), parseInt(dateStringSplit[1]) - 1, parseInt(dateStringSplit[2]));
    var millisecondsStart = Math.round(dateP.getTime() / 1000);
    var millisecondsEnd = Math.round(dateP.getTime() / 1000 + 86400);
    setMap(millisecondsStart, millisecondsEnd);
    setTimeline(dateString);
}