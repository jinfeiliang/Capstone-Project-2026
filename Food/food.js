mapboxgl.accessToken =
  "pk.eyJ1IjoiamlubDMzIiwiYSI6ImNtbDFrdDF2dDA4eG8za3B1dGZ5OWg3MGoifQ.ZLOrBAMhK6onNUxia_NyzQ";
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: [-74.0038, 40.7533], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 10, // starting zoom
});

let Google_Maps_Search_Link = (address) => {
  return `https://maps.google.com/?q=${address}`;
}

let Directory_Of_Homeless_Drop_In_Centers_Link_API =
  "https://data.cityofnewyork.us/resource/bmxf-3rd4.json";

let Data = [];

async function loadAllGeolocation() {
  try {
    const response = await fetch(
      Directory_Of_Homeless_Drop_In_Centers_Link_API,
      { method: "GET" },
    );
    if (!response.ok) {
      throw new Error(`Reponse status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    Data = [];

    let Map_Marker_Data = [];

    result.forEach((place) => {
      Data.push(place);
      console.log(place);
      let Object_Marker_Data = {
          type: "Feature",
          properties: {
            description:
              `<p>${place.center_name}</p><a target="_blank" href="${Google_Maps_Search_Link(place.address)}">${place.address}</a><p>${place.comments}</p>`,
          },
          geometry: {
            type: "Point",
            coordinates: [place.longitude, place.latitude],
          },
        }
        Map_Marker_Data.push(Object_Marker_Data);
    });

    map.addSource("places", {
    type: "geojson",
    generateId: true,
    data: {
      type: "FeatureCollection",
      features: Map_Marker_Data,
    },
  });

  // Add a circle layer showing the places.
  map.addLayer({
    id: "places",
    type: "circle",
    source: "places",
    paint: {
      "circle-color": "#fc00e4",
      "circle-radius": 6,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.addInteraction("places-click-interaction", {
    type: "click",
    target: { layerId: "places" },
    handler: (e) => {
      // Copy coordinates array.
      const coordinates = e.feature.geometry.coordinates.slice();
      const description = e.feature.properties.description;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    },
  });

  // Change the cursor to a pointer when the mouse is over a POI.
  map.addInteraction("places-mouseenter-interaction", {
    type: "mouseenter",
    target: { layerId: "places" },
    handler: () => {
      map.getCanvas().style.cursor = "pointer";
    },
  });

  // Change the cursor back to a pointer when it stops hovering over a POI.
  map.addInteraction("places-mouseleave-interaction", {
    type: "mouseleave",
    target: { layerId: "places" },
    handler: () => {
      map.getCanvas().style.cursor = "";
    },
  });


  } catch (error) {
    console.log(error.message);
  }
}

map.on("load", loadAllGeolocation);

map.on("load", () => {
  
});
