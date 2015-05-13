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

// get your tiles at https://www.mapbox.com
var mapTiles = '//{s}.tiles.mapbox.com/v3/baddeo.map-ad3lxx2v/{z}/{x}/{y}.png'

map = L.map('map').setView(raveCoordinates, initialZoom)

L.tileLayer(mapTiles, mapOptions).addTo(map)