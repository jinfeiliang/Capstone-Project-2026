mapboxgl.accessToken =
  "pk.eyJ1IjoiamlubDMzIiwiYSI6ImNtbDFrdDF2dDA4eG8za3B1dGZ5OWg3MGoifQ.ZLOrBAMhK6onNUxia_NyzQ";
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: [-74.5, 40], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 9, // starting zoom
});

let Directory_Of_Homeless_Drop_In_Centers_Link_API =
  "https://data.cityofnewyork.us/resource/bmxf-3rd4.json";

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

    result.forEach((place) => {
      const marker1 = new mapboxgl.Marker()
        .setLngLat([place.longitude, place.latitude])
        .addTo(map);
    });
  } catch (error) {
    console.log(error.message);
  }
}
loadAllGeolocation();
