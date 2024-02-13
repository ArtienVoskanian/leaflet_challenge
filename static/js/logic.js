// Create our variable to store the link to the API call
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Create the initial function to create the map, calling on functions and variables that will be defined later
function createMap(earthquakes){

    // Create the tile layer 
    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Create an object to hold the base map
    let baseMap = {
        View : streetmap
    };

    // Create the overlay map object
    let overlayMap = {
        "Earthquake": earthquakes
    };

    // Create the map object
    let myMap = L.map("map", {
        center: [39.106667,-94.676392],
        zoom: 5,
        layers: [streetmap,earthquakes]
    });

    // Create the layer control and pass the base and overlay maps
    L.control.layers(baseMap, overlayMap, {
        collapsed: false
    }).addTo(myMap);

    // Define the legend variable
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    let depths = [-10, 10, 30, 50, 70, 90];
    let colors = ["cyan", "violet", "magenta", "purple", "blue", "navy"];
    let labels = [];

    // Loop through depths and colors to generate legend labels
    for (let i = 0; i < depths.length; i++) {
        let from = depths[i];
        let to = depths[i + 1];

        labels.push('<i style="background:' + colors[i] + '"></i> ' +from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = '<h4>Depths Legend</h4>' + labels.join('<br>');
    return div;
};

    // Add legend to map
    legend.addTo(myMap);       
};

// Create a color function so that, when called, it will change the color of the marker based on depth
function markerColor(depth){

    if (depth>=-10 && depth<=10){
        return "cyan"
    }
    else if (depth>10 && depth<=30){
        return "violet"
    }
    else if (depth>30 && depth<=50){
        return "magenta"
    }
    else if (depth>50 && depth<=70){
        return "purple"
    }
    else if (depth>70 && depth<=90){
        return "blue"
    }
    else{
        return "navy"
    }
};

// Create a radius function so that, when called, it will change the markers size based on the earthquake's magnitude
function markerSize(magnitude){
    let size = (magnitude * 10000);
    return size;
};
// Now set up the function to loop through the JSON and create markers + pop ups for the relevant data

function earthquakeMarkers(response){
    
    // Store the part of the JSON we are interest in into a variable
    let query = response.features;

    // Create an empty array to push the circle markers too
    let circleMarkers = [];

    // Set up the for loop
    for (let i = 0; i < query.length; i++){  
 
        // Create several variables that parse into the specific data we need for the function
        let coords = query[i].geometry.coordinates;
        let mag = query[i].properties.mag;
        let place = query[i].properties.place;

        // Create the markers and push them to the empty array
        let markers = L.circle([coords[1],coords[0]],{
                color: "black",
                fillColor: markerColor(coords[2]),
                fillOpacity: 0.8,
                radius: markerSize(mag),
                weight: 0.5
            }).bindPopup("<h3>Location: "+ place + "</h3><h3>Magnitude: " + mag + "</h3><h3>Depth: " + coords[2] + "</h3>");
        
        circleMarkers.push(markers);
    }
    // Create a layer group from the markers
    createMap(L.layerGroup(circleMarkers));

};

d3.json(url).then(earthquakeMarkers);