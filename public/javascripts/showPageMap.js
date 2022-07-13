const Campground = JSON.parse(campground);

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: goodCampground.geometry.coordinates, // starting position [lng, lat]
    zoom: 8, // starting zoom
});

const marker = new mapboxgl.Marker()
    .setLngLat(Campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${Campground.title}</h3> <p>${Campground.location}</p>`
            )
    )
    .addTo(map);