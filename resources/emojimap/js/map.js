// "global" variables, accessible outside of this JS file
var map

// create the map

var raveCoordinates = [51.501499, 0.005374]
var initialZoom = 17

var mapOptions = 
{
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	maxZoom: 18
	// for more options see http://leafletjs.com/reference.html#map-options
}

// get YOUR OWN MAP tiles at https://www.mapbox.com
var mapTiles = '//{s}.tiles.mapbox.com/v3/baddeo.map-ad3lxx2v/{z}/{x}/{y}.png'

map = L.map('map').setView(raveCoordinates, initialZoom)

L.tileLayer(mapTiles, mapOptions).addTo(map)


// we need to store the position of the game camera
// to pan the map around
var cameraPosition = 
{
	x: 0,
	y: 0
}

// when we receive the 'Camera' event..
// pan the map around
document.addEventListener('Camera', function(event)
{
	// console.log('Camera', event.detail)

	var newCameraPosition = event.detail

	// we only pan the map if the camera has moved
	// we check that by comparing the previous positions to the current positions
	if (cameraPosition.x !== newCameraPosition.x 
	 || cameraPosition.y !== newCameraPosition.y)
	{
		// work out the difference
		// how much has the camera actually moved since last update?
		var difference = 
		{
			x: newCameraPosition.x - cameraPosition.x,
			y: newCameraPosition.y - cameraPosition.y 
		}

		// move by that difference
		map.panBy([difference.x, difference.y], {animate:false})

		// update cameraPosition
		cameraPosition = newCameraPosition
	}
})