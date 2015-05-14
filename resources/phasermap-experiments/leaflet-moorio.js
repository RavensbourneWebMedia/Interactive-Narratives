// when we receive the 'GameReady' event..
// create the map
document.addEventListener('GameReady', function()
{
	console.log('GameReady')

	map = L.map('map').setView([51.505, -0.09], 14)

	// more options TODO
	var mapOptions = 
	{
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
		maxZoom: 18
	}

	// get your tiles at https://www.mapbox.com
	var mapTiles = '//{s}.tiles.mapbox.com/v3/baddeo.map-ad3lxx2v/{z}/{x}/{y}.png'

	L.tileLayer(mapTiles, mapOptions).addTo(map)
})

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