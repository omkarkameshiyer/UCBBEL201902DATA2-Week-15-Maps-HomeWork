 d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(earthquakeData) {
     createPopUpAndMarker(earthquakeData.features);
 });

 function markerSize(magnitude) {
     return magnitude * 40000;
 };

 function color(m) {

     var colors = ['lightgreen', 'yellowgreen', 'gold', 'purple', 'lightsalmon', 'orange', 'tomato', 'red', ''];

     return m > 7 ? colors[7] :
         m > 6 ? colors[6] :
         m > 5 ? colors[5] :
         m > 4 ? colors[4] :
         m > 3 ? colors[3] :
         m > 2 ? colors[2] :
         m > 1 ? colors[1] :
         colors[0];
 };

 function createPopUpAndMarker(earthquakeData) {

     var earthquakes = L.geoJSON(earthquakeData, {
         onEachFeature: function(feature, layer) {
             layer.bindPopup("<h2> Magnitude: " + feature.properties.mag +
                 "</h2><h2>Location: " + feature.properties.place +
                 "</h2><hr><h2>" + new Date(feature.properties.time) + "</h2>");
         },

         pointToLayer: function(feature, latlng) {
             return new L.circle(latlng, {
                 radius: markerSize(feature.properties.mag),
                 fillColor: color(feature.properties.mag),
                 fillOpacity: .8,
                 color: 'grey',
                 weight: .5
             })
         }
     });

     drawMap(earthquakes);
 };

 function drawMap(earthquakes) {

     // Define lightmap, outdoorsmap, and satelliemap layers
     let mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
     let accessToken = 'pk.eyJ1Ijoib21rYXJpeWVyIiwiYSI6ImNqd2swYnFxNDBrYjgzem4wOWp0bTV6NDUifQ.eaivvemLUJrh61xixW9qew';
     let lightmap = L.tileLayer(mapboxUrl, { id: 'mapbox.light', maxZoom: 20, accessToken: accessToken });
     let outdoorsmap = L.tileLayer(mapboxUrl, { id: 'mapbox.run-bike-hike', maxZoom: 20, accessToken: accessToken });
     let satellitemap = L.tileLayer(mapboxUrl, { id: 'mapbox.streets-satellite', maxZoom: 20, accessToken: accessToken });


     var tectonicPlates = new L.LayerGroup();
     d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(plateData) {
         L.geoJSON(plateData, {
                 color: 'orange',
                 weight: 2
             })
             .addTo(tectonicPlates);
     });

     // Define a baseMaps object to hold our base layers
     var baseMaps = {
         "Grayscle": lightmap,
         "Outdoors": outdoorsmap,
         "Satellite Map": satellitemap
     };

     // Create overlay object to hold our overlay layer
     var overlayMaps = {
         "Earthquakes": earthquakes,
         "Tectonic Plates": tectonicPlates
     };

     // Create our map, giving it the lightmap and earthquakes layers to display on load
     var myMap = L.map("map", {
         center: [39.8283, -98.5795],
         zoom: 3,
         layers: [lightmap, earthquakes]
     });

     L.control.layers(baseMaps, overlayMaps, {
         collapsed: false
     }).addTo(myMap);

     // Create a legend to display information in the bottom right
     var legend = L.control({ position: 'bottomright' });

     legend.onAdd = function(map) {

         var div = L.DomUtil.create('div', 'info legend'),
             magnitudes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
             labels = [];

         div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"
         for (var i = 0; i < magnitudes.length; i++) {
             div.innerHTML +=
                 '<i style="background:' + color(magnitudes[i] + 1) + '"></i> ' +
                 magnitudes[i] + (magnitudes[i + 1] ? '&ndash;' + magnitudes[i + 1] + '<br>' : '+');
         }
         return div;
     };
     legend.addTo(myMap);
 }