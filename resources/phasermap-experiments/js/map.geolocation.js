(function (window) {
    if (typeof window.slippymap !== 'undefined') {
        window.slippymap.extension.geolocation = function (map) {
            var geo = {
                gl: {
                    getCurrentPosition: function () {
                        slippymap.debug("no supported geolocation services found");
                    }
                },
                lastUpdate: 0,
                init: function () {
                    try {
                        geo.gl = navigator.geolocation;
                        slippymap.debug("found native geolocation");
                    } catch (e_nogeolocation) {
                        slippymap.debug("no geolocation or gears plugin found");
                    }
                },
                location: function (success, error, options) {
                    slippymap.debug("dispatch getCurrentPosition");
                    geo.gl.getCurrentPosition(
                    success || geo.displayPosition, error || geo.displayError, options || {
                        maximumAge: 600,
                        timeout: 10000,
//                        enableHighAccuracy: false,
//                        responseTime: 2
                    });
                },
                watch: function (success, error, options) {
                    slippymap.debug("dispatch watchPosition");
                    return geo.gl.watchPosition(
                    success || geo.displayPosition, error || geo.displayError, options || {
                        maximumAge: 600000,
                        timeout: 3000,
                        enableHighAccuracy: false,
                        responseTime: 2
                    });
                },
                clearWatch: function (id){
                	geo.gl.clearWatch(id);
                },
                displayError: function (error) {
                    slippymap.debug("getCurrentPosition error: " + (error.message || " - "));
                },
                displayPosition: function (position) {
                    var now = function () {
                        return (new Date()).getTime();
                    }();
                    var metersPerPixel = [156412, 78206, 39103, 19551, 9776, 4888, 2444, 1222, 611, 305, 153, 76, 38, 19, 10, 5, 2, 1, 0.6];
                    if (!geo.lastUpdate && position.coords && position.coords.accuracy) {
                        for (var z = 0; z < 17 && metersPerPixel[z] * map.renderer.tilesize > position.coords.accuracy; z++) {}
                        if (z) {
                            map.position.coords({lon: position.coords.longitude, lat: position.coords.latitude, zoom: z});
                        } else {
                            map.position.coords({lon: position.coords.longitude, lat: position.coords.latitude});
                        }
                    } else {
                    	map.position.coords({lon: position.coords.longitude, lat: position.coords.latitude});
                    }
                    geo.lastUpdate = now;
                }
            };
            return geo;
        };
    }
}(window));