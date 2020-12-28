var locations = [];
var map;
var markers;
var timelineJson;
var host = "http://127.0.0.1:9936/"
//var host = "https://koenhabets.nl/api/owntracks/"

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

function setTimeline(date) {
    var timeline = $("#timeline");
    timeline.text("Laden...")
    $.get(host + "timeline?date=" + date, function (data, status) {
        console.log(data);
        timelineJson = JSON.parse(data);
        var jsonArray = timelineJson.stops;
        var jsonArrayRoutes = timelineJson.routes;
        timeline.text("");
        markers = L.layerGroup();
        for (i = 0; i < jsonArray.length; i++) {
            var item = jsonArray[i];
            var buttonText = ""
            if (!item.locationUserAdded){
                buttonText = "<button class='button-add-stop' id='" + item.start + item.end + "'>Opslaan</button>"
            }
            timeline.prepend("<p class='stop'>" + timestampToString(item.start) + " - " + timestampToString(item.end) + "<br>" + item.location + buttonText + "</p>");

            timeline.prepend()
            var marker = L.marker([item.lat, item.lon]);
            marker.bindPopup(item.location + "<br>Start: " + timestampToString(item.start) + "<br>Einde: " + timestampToString(item.end));
            markers.addLayer(marker);
            for (k = 0; k < jsonArrayRoutes.length; k++){
                var itemR = jsonArrayRoutes[k];
                if (itemR.start === item.end) {
                    var icon = ""
                    if (itemR.movementType === "walking") {
                        icon = "images/walking.svg"
                    } else if (itemR.movementType === "driving") {
                        icon = "images/car.svg"
                    }
                    timeline.prepend("<p class='route'><img class='route-icon' src=\"" + icon + "\">" + (itemR.distance / 1000).toFixed(1) + " km(" + itemR.speed.toFixed(1) + "km/h)</p>");
                }
            }
        }
        map.addLayer(markers);
        $(".button-add-stop").click(function() {
            console.log("button clicked")
            var id = $(this).attr('id');
            var jsonArray = timelineJson.stops;
            for (i = 0; i < jsonArray.length; i++) {
                var item = jsonArray[i];
                if(item.start + (item.end + "") === id){
                    var newName = prompt("Please enter the name of the stop", item.name)
                    $.post(host + "stopImproved mysql, added timeline test?name=" + newName + "&lat=" + item.lat + "&lon=" + item.lon, function (data, status) {
                        setDate();
                    });
                }
            }

        });
    });
}

function timestampToString(timestamp) {
    var date = new Date(timestamp);
    return date.getDate() + "-" + (date.getMonth() + 1) + " " + date.getHours() + ":" + date.getMinutes();
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
