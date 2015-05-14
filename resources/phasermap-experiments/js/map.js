/*  Slippy Map on Canvas - HTML5
 *
 *  Copyright 2010 dFacts Network
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *
 *  TODO:
 */
(function (window) {
    "use strict";
    if (typeof window.slippymap === 'undefined') {
        var slippymap = function (options) {
            var $, map, defaults, property;
            $ = window;
            defaults = {
                div: "map",
                fullscreen : true,
                zoom: 1,
                lon: 0,
                lat: 0,
                markers: {},
                tracks: {},
                tileprovider: function (x, y, z) {
                    var rand, sub, url;
                    rand = function (n) {
                        return $.Math.floor($.Math.random() * n);
                    };
                    sub = ["a", "b", "c"];
                    url = "http://" + sub[rand(3)] + ".tile.openstreetmap.org/" + z + "/" + x + "/" + y + ".png";
                    return url;
                },
                useFractionalZoom: true,
                scrollMomentum: true,
                zMin: 0,
                zMax: 18,
                cacheValues: true,
                preloadMargin: 1
            };
            /* merge defaults and options */
            if (typeof options === "object") {
                for (property in defaults) {
                    if (defaults.hasOwnProperty(property)) {
                        if (typeof options[property] !== "undefined") {
                            defaults[property] = options[property];
                        }
                    }
                }
            }
            options = defaults;
            map = {
                markers: options.markers,
                tracks: options.tracks,
                tileprovider: options.tileprovider,
                useFractionalZoom: options.useFractionalZoom,
                scrollMomentum: options.scrollMomentum,
                cache: {},
                cacheValues: options.cacheValues,
                preloadMargin: options.preloadMargin,
                zMin : options.zMin,
                zMax : options.zMax,
                maxImageLoadingCount : 10,
                init: function () {
                    var coords;
                    if ($.document.getElementById(options.div)) {
                        map.renderer.canvas = $.document.getElementById(options.div);
                        if (options.fullscreen === true) {
                            map.renderer.canvas.width = $.innerWidth;
                            map.renderer.canvas.height = $.innerHeight;
                        }
                        map.renderer.context = map.renderer.canvas.getContext("2d");
                        map.renderer.sortLayers();
                        map.events.init();
                    } else {
                        $.slippymap.debug("canvas not found");
                    }
                },
                /* events */
                events: {
                    lastMouseX: 0,
                    lastMouseY: 0,
                    dragging: false,
                    lastTouchEvent: {},
                    lastTouchEventBeforeLast: {},
                    momentum: {
                        index: 0,
                        history: [],
                        amplifier: {s: 20, xy: 1},
                        duration: function () {
                            var average = 0, i;
                            for (i = 0; i < this.history.length; i = i + 1) {
                                average = average + Math.sqrt(Math.pow(this.history[i][0], 2) + Math.pow(this.history[i][1], 2));
                            }
                            return this.amplifier.s * (average / this.history.length);
                        },
                        x: function () {
                            var average = 0, i;
                            for (i = 0; i < this.history.length; i = i + 1) {
                                average = average + this.history[i][0];
                            }
                            return this.amplifier.xy * (average / this.history.length);
                        },
                        y: function () {
                            var average = 0, i;
                            for (i = 0; i < this.history.length; i = i + 1) {
                                average = average + this.history[i][1];
                            }
                            return this.amplifier.xy * (average / this.history.length);
                        },
                        clear: function () {
                            this.history = [];
                        }

                    },
                    update : function (event) {
                        $.clearTimeout(map.renderer.refreshTimeout);
                        map.renderer.refreshTimeout = $.setTimeout(map.renderer.refresh, 0);
                        map.events.preventDefault(event);
                    },
                    preventDefault: function (event) {
                        if (typeof event.preventDefault !== 'undefined') {
                            event.preventDefault();
                        }
                        if (typeof event.stopPropagation !== 'undefined') {
                            event.stopPropagation();
                        }
                    },
                    resized: function (event) {
                        if (options.fullscreen !== true) {
                            return;
                        }
                        map.renderer.canvas.width = $.innerWidth;
                        map.renderer.canvas.height = $.innerHeight;
                        map.renderer.update();
                        map.events.preventDefault(event);
                        return true;
                    },
                    mouseDown: function (event) {
                        var x, y;
                        map.position.animation.stop();
                        if (!event) {
                            event = $.event;
                        }
                        x = event.clientX - map.renderer.canvas.offsetLeft;
                        y = event.clientY - map.renderer.canvas.offsetTop;
                        if (event.button === 0) {
                            map.events.dragging = true;
                        }
                        map.events.lastMouseX = x;
                        map.events.lastMouseY = y;
                        map.events.preventDefault(event);
                        return true;
                    },
                    mouseMove: function (event) {
                        var x, y, dX, dY;
                        x = event.clientX - map.renderer.canvas.offsetLeft;
                        y = event.clientY - map.renderer.canvas.offsetTop;
                        if (map.events.dragging === true) {
                            dX = x - map.events.lastMouseX;
                            dY = y - map.events.lastMouseY;
                            if (map.scrollMomentum) {
                                map.events.momentum.history[map.events.momentum.index] = [dX, dY];
                                map.events.momentum.index = (map.events.momentum.index + 1) % 5;
                            }
                            map.position.move(-dX * map.pow(2, map.zMax - map.position.z), -dY * map.pow(2, map.zMax - map.position.z));
                        }
                        map.events.lastMouseX = x;
                        map.events.lastMouseY = y;
                        map.events.preventDefault(event);
                        return true;
                    },
                    mouseUp: function (event) {
                        var duration = map.events.momentum.duration();
                        if (map.events.dragging && map.scrollMomentum && duration !== 0) {
                            map.events.dragging = false;
                            map.position.move(
                                -map.events.momentum.x() * map.pow(2, map.zMax - map.position.z),
                                -map.events.momentum.y() * map.pow(2, map.zMax - map.position.z),
                                {animated: true, duration: duration}
                            );
                            map.events.momentum.clear();
                        } else {
                            map.events.dragging = false;
                            map.position.moveend();
                        }
                        map.events.preventDefault(event);
                        return true;
                    },
                    mouseOut: function (event) {
                        map.events.dragging = false;
                        map.position.moveend();
                        map.events.preventDefault(event);
                        return true;
                    },
                    mouseWheel: function (event) {
                        var delta = 0;
                        map.position.animation.stop();
                        if (!event) {
                            event = $.event;
                        }
                        if (event.wheelDelta) {
                            delta = event.wheelDelta / 120;
                            if ($.opera) {
                                delta = -delta;
                            }
                        } else if (event.detail) {
                            delta = -event.detail / 3;
                        }
                        if (delta > 0) {
                            map.position.zoomIn({
                                step: delta / 10,
                                mouseWheel: true,
                                animated: true
                            });
                        } else if (delta < 0) {
                            map.position.zoomOut({
                                step: -delta / 10,
                                mouseWheel: true,
                                animated: true
                            });
                        }
                        map.events.preventDefault(event);
                        return true;
                    },
                    doubleClick: function (event) {
                        var x, y, dX, dY, center;
                        center = event.simulated || false;
                        map.position.animation.stop();
                        if (!event) {
                            event = $.event;
                        }
                        x = event.clientX - map.renderer.canvas.offsetLeft;
                        y = event.clientY - map.renderer.canvas.offsetTop;
                        if (center) {
                        // center double touch taps
                            dX = (x - map.renderer.canvas.width / 2);
                            dY = (y - map.renderer.canvas.height / 2);
                        } else {
                        // 
                            dX = (x - map.renderer.canvas.width / 2) / 2;
                            dY = (y - map.renderer.canvas.height / 2) / 2;
                        }

                        map.position.center({
                            x: map.position.x + dX * map.pow(2, map.zMax - map.position.z),
                            y: map.position.y + dY * map.pow(2, map.zMax - map.position.z),
                            z: $.Math.round(map.position.z + 1)
                        }, {
                            animated: true
                        });

                        map.events.lastMouseX = x;
                        map.events.lastMouseY = y;
                        map.events.preventDefault(event);
                        return true;
                    },
                    /* maps touch events to mouse events */
                    touch: function (event) {
                        var now, touches, type, first, simulatedEvent, distance;

                        map.position.animation.stop();
                        now = function () {
                            return (new $.Date()).getTime();
                        };
                        if (event.type !== 'touchend') {
                            touches = event.targetTouches;
                        } else {
                            touches = event.changedTouches;
                        }
                        if (touches.length === 1) {
                            switch (event.type) {
                            case 'touchstart':
                                type = 'mousedown';
                                break;
                            case 'touchmove':
                                type = 'mousemove';
                                break;
                            case 'touchcancel':
                            case 'touchend':
                                type = 'mouseup';
                                break;
                            default:
                                return;
                            }
                            first = touches[0];
                            if (map.events.lastTouchEventBeforeLast && event.type === 'touchend' && map.events.lastTouchEvent.type === 'touchstart' && map.events.lastTouchEventBeforeLast.type === 'touchend' && event.x === map.events.lastTouchEventBeforeLast.x && event.y === map.events.lastTouchEventBeforeLast.y && now() - map.events.lastTouchEventBeforeLast.timeStamp < 500) {
                                map.events.lastTouchEventBeforeLast = false;
                                map.events.lastTouchEvent.timeStamp = now();
                                type = 'dblclick';
                            }
                            simulatedEvent = $.document.createEvent('MouseEvent');
                            simulatedEvent.simulated = true;
                            simulatedEvent.initMouseEvent(type, true, true, $, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0, null);
                            first.target.dispatchEvent(simulatedEvent);
                            map.events.lastTouchEventBeforeLast = map.events.lastTouchEvent;
                            map.events.lastTouchEvent = event;
                            map.events.preventDefault(event);
                            return true;
                        }
                        if (touches.length === 2 && event.type === 'touchstart') {
                            map.events.lastTouchEvent.distance = 0;
                        }
                        if (touches.length === 2 && event.type === 'touchmove') {
                            distance = $.Math.sqrt(
                                $.Math.pow(event.targetTouches[0].clientX - event.targetTouches[1].clientX, 2) +
                                    $.Math.pow(event.targetTouches[0].clientY - event.targetTouches[1].clientY, 2)
                            );
                            if (map.events.lastTouchEvent.distance) {
                                simulatedEvent = $.document.createEvent('Event');
                                simulatedEvent.initEvent('gesturechange', false, false);
                                simulatedEvent.scale = 1 + ((distance - map.events.lastTouchEvent.distance) / 10);
                                simulatedEvent.simulated = true;
                                map.renderer.canvas.dispatchEvent(simulatedEvent);
                                map.events.preventDefault(event);
                            }
                            map.events.lastTouchEvent.distance = distance;
                            return true;
                        }
                        map.events.preventDefault(event);
                        return false;
                    },
                    /* minimal pinch support */
                    gesture: function (event) {
                        map.position.animation.stop();
                        if (event.scale) {
                            if (event.scale > 1) {
                                map.position.zoomIn({
                                    step: (event.scale - 1) / 10,
                                    round: false,
                                    animated: false,
                                    gesture: true
                                });
                                return true;
                            }
                            if (event.scale < 1) {
                                map.position.zoomOut({
                                    step: event.scale / 10,
                                    round: false,
                                    animated: false,
                                    gesture: true
                                });
                                return true;
                            }
                        }
                        map.events.preventDefault(event);
                        return false;
                    },
                    /* attaches events to map + window */
                    init: function () {
                        $.addEventListener('resize', map.events.resized, false);
                        map.renderer.canvas.addEventListener('DOMMouseScroll', map.events.mouseWheel, false);
                        map.renderer.canvas.addEventListener('mousewheel', map.events.mouseWheel, false);
                        map.renderer.canvas.addEventListener('mousedown', map.events.mouseDown, false);
                        map.renderer.canvas.addEventListener('mousemove', map.events.mouseMove, false);
                        map.renderer.canvas.addEventListener('mouseup', map.events.mouseUp, false);
                        map.renderer.canvas.addEventListener('mouseout', map.events.mouseOut, false);
                        map.renderer.canvas.addEventListener('dblclick', map.events.doubleClick, false);
                        map.renderer.canvas.addEventListener('touchstart', map.events.touch, false);
                        map.renderer.canvas.addEventListener('touchmove', map.events.touch, false);
                        map.renderer.canvas.addEventListener('touchend', map.events.touch, false);
                        map.renderer.canvas.addEventListener('touchcancel', map.events.touch, false);
                        map.renderer.canvas.addEventListener('gesturestart', map.events.gesture, false);
                        map.renderer.canvas.addEventListener('gesturechange', map.events.gesture, false);
                        map.renderer.canvas.addEventListener('gestureend', map.events.gesture, false);
                        // custom events
                        map.renderer.canvas.addEventListener('update', map.events.update, false);
                        map.renderer.canvas.addEventListener('zoomed', map.events.zoomed, false);
                        map.renderer.canvas.addEventListener('moved', map.events.moved, false);
                        map.renderer.canvas.addEventListener('moveend', map.events.moveend, false);
                        // garbage collector
                        map.renderer.canvas.addEventListener('moveend', map.renderer.garbage, false);
                    }
                },
                /* renderer */
                renderer: {
                    canvas: {},
                    context: {},
                    lastRenderTime: 0,
                    tiles: [],
                    tilecount: 0,
                    tilesize: 256,
                    refreshCounter: 0,
                    refreshLastStart: 0,
                    refreshTimeout: 0,
                    refreshFPS: 50,
                    roundToPixel : false,
                    loadingCue : 0,
                    blank : function (color, x, y, width, height) {
                        // map.renderer.context.fillStyle = color;
                        // map.renderer.context.fillRect(x, y, width, height);
                    },
                    drawImage : function (image, fallbackColor, sx, sy, sw, sh, dx, dy, dw, dh) {
                        if (map.renderer.roundToPixel) {
                            sx = Math.round(sx);
                            sy = Math.round(sy);
                            sw = Math.round(sw);
                            sh = Math.round(sh);
                            dx = Math.round(dx);
                            dy = Math.round(dy);
                            dw = Math.round(dw);
                            dh = Math.round(dh);
                        }
                        try {
                            map.renderer.context.drawImage(
                                image,
                                sx,
                                sy,
                                sw,
                                sh,
                                dx,
                                dy,
                                dw,
                                dh
                            );
                            return true;
                        } catch (e) {
                            map.renderer.blank(
                                fallbackColor,
                                dx,
                                dy,
                                dw,
                                dh
                            );
                            return false;
                        }
                    },
                    loadImage : function (id, x, y, z, t, tileprovider) {
                        if (typeof map.renderer.tiles[t] === 'undefined') {
                            map.renderer.tiles[t] = [];
                        }
                        if (map.renderer.loadingCue > map.maxImageLoadingCount && z !== map.position.z) {
                            //skipping
                            return;
                        }
                        map.renderer.loadingCue = map.renderer.loadingCue + 1;
                        map.renderer.tiles[t][id] = new $.Image();
                        map.renderer.tiles[t][id].lastDrawnId = 0;
                        map.renderer.tilecount = map.renderer.tilecount + 1;
                        map.renderer.tiles[t][id].src = tileprovider(x, y, z, id);
                        map.renderer.tiles[t][id].onload = function () {
	                        map.renderer.loadingCue = map.renderer.loadingCue - 1;
                            map.renderer.update();
                        };
                        map.renderer.tiles[t][id].onerror = function () {
	                        map.renderer.loadingCue = map.renderer.loadingCue - 1;
                            this.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
                            this.onload = function () {};
                        };
                    },
                    addLayer: function (layer) {
                        map.renderer.layers.push(layer);
                        map.renderer.sortLayers();
                    },
                    sortObject: function (o) {
                        var sorted = {},
                            key,
                            a = [];
                        for (key in o) {
                            if (o.hasOwnProperty(key)) {
                                a.push(key);
                            }
                        }
                        a.sort();
                        for (key = 0; key < a.length; key = key + 1) {
                            sorted[a[key]] = o[a[key]];
                        }
                        return sorted;
                    },
                    sortLayers: function () {
                        function sortZIndex(a, b) {
                            var x, y;
                            x = a.zindex;
                            y = b.zindex;
                            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                        }
                        map.renderer.layers.sort(sortZIndex);
                    },
                    layers: [
                        {
                            id: 'base',
                            zindex: 0,
                            visible: function () {
                                return true;
                            },
                            alpha: 1,

                            callback: function (id, viewport, alpha) {
                                // map.renderer.context.globalAlpha = alpha;
                                map.renderer.blank("#dddddd", 0, 0, viewport.w, viewport.h);
                            }
                        },
                        { /* repaint canvas, load missing images */
                            id: 'tiles',
                            zindex: 1,
                            visible: function () {
                                return true;
                            },
                            alpha: 1,
                            callback: function (id, viewport, alpha) {
                                var tileprovider, tileLayers, maxTileNumber, tileDone, preload,
                                    t, x, y, xoff, yoff, tileKey,
                                    tileAboveX, tileAboveY, tileAboveZ, tileKeyAbove,
                                    tilePartOffsetX, tilePartOffsetY, tilePartSize,
                                    tileZdiff,
                                    encodeIndex,
                                    tileLoadingCue = [],
                                    tileLoading, tileLoadingKey;
                                encodeIndex = function (x, y, z) {
                                    return x + "-" + y + "-" + z;
                                };
                                maxTileNumber = map.pow(2, viewport.zi) - 1;
                                preload = map.preloadMargin;
                                if (typeof map.tileprovider === 'function') {
                                    tileLayers = {
                                        base: {
                                            url: map.tileprovider
                                        }
                                    };
                                } else {
                                    tileLayers = map.tileprovider;
                                }

                                for (t in tileLayers) {
                                    if (tileLayers.hasOwnProperty(t)) {
                                        tileprovider = tileLayers[t].url;
                                        // map.renderer.context.globalAlpha = tileLayers[t].alpha || alpha;
                                        map.renderer.tiles[t] = map.renderer.tiles[t] || {};
                                        tileDone = [];
                                        for (x = $.Math.floor(viewport.xMin / viewport.sz) - preload; !map.renderer.skip && x < $.Math.ceil(viewport.xMax / viewport.sz) + preload; x = x + 1) {
                                            tileDone[x] = [];
                                            xoff = (((x * viewport.sz - viewport.xMin) / viewport.zp) * viewport.zf) - viewport.offsetX;
                                            for (y = $.Math.floor(viewport.yMin / viewport.sz) - preload; !map.renderer.skip &&  y < $.Math.ceil(viewport.yMax / viewport.sz) + preload; y = y + 1) {
                                                yoff = (((y * viewport.sz - viewport.yMin) / viewport.zp) * viewport.zf) - viewport.offsetY;
                                                tileKey = encodeIndex(x, y, viewport.zi);
                                                tileDone[tileKey] = false;
                                                if (x > maxTileNumber || y > maxTileNumber || x < 0 || y < 0) {
                                                    // out of xyz bounds
                                                    map.renderer.blank(
                                                        "#dddddd",
                                                        xoff,
                                                        yoff,
                                                        viewport.tilesize,
                                                        viewport.tilesize
                                                    );
                                                    tileDone[tileKey] = true;
                                                } else {
                                                    if (map.renderer.tiles[t][tileKey] && map.renderer.tiles[t][tileKey].complete) {
                                                        // draw tile
                                                        if (map.renderer.drawImage(
                                                                map.renderer.tiles[t][tileKey],
                                                                "#dddddd",
                                                                0,
                                                                0,
                                                                map.renderer.tilesize,
                                                                map.renderer.tilesize,
                                                                xoff,
                                                                yoff,
                                                                viewport.tilesize,
                                                                viewport.tilesize
                                                            )) {
                                                            map.renderer.tiles[t][tileKey].lastDrawnId = id;
                                                        }
                                                        tileDone[tileKey] = true;
                                                    } else {
                                                        if (typeof map.renderer.tiles[t][tileKey] === 'undefined' &&
                                                                typeof tileLoadingCue[tileKey] === 'undefined') {
                                                            tileLoadingCue[tileKey] = {id: tileKey, x: x, y: y, z: viewport.zi};
                                                        }
                                                        // try tile preview with tile from lower z level
                                                        for (tileAboveZ = viewport.zi - 1; !tileDone[tileKey] && (tileAboveZ > map.zMin); tileAboveZ = tileAboveZ - 1) {
                                                            tileZdiff = viewport.zi - tileAboveZ;
                                                            tileAboveX = $.Math.floor(x / map.pow(2, tileZdiff));
                                                            tileAboveY = $.Math.floor(y / map.pow(2, tileZdiff));
                                                            tileKeyAbove = encodeIndex(tileAboveX, tileAboveY, tileAboveZ);
                                                            if (!tileDone[tileKey] && map.renderer.tiles[t][tileKeyAbove] && map.renderer.tiles[t][tileKeyAbove].complete) {
                                                                // we have a tile from previous z level loaded, let draw it
                                                                tilePartOffsetX = (x - tileAboveX * map.pow(2, tileZdiff));
                                                                tilePartOffsetY = (y - tileAboveY * map.pow(2, tileZdiff));
                                                                tilePartSize = (map.renderer.tilesize / map.pow(2, tileZdiff));
                                                                if (map.renderer.drawImage(
                                                                        map.renderer.tiles[t][tileKeyAbove],
                                                                        "#dddddd",
                                                                        tilePartOffsetX * tilePartSize,
                                                                        tilePartOffsetY * tilePartSize,
                                                                        tilePartSize,
                                                                        tilePartSize,
                                                                        xoff,
                                                                        yoff,
                                                                        viewport.tilesize,
                                                                        viewport.tilesize
                                                                    )) {
                                                                    map.renderer.tiles[t][tileKeyAbove].lastDrawnId = id;
                                                                }
                                                                tileDone[tileKey] = true;
                                                                break;
                                                            }
                                                        }
                                                        if (tileDone[tileKey] === false) {
                                                            map.renderer.blank(
                                                                "#dddddd",
                                                                xoff,
                                                                yoff,
                                                                viewport.tilesize,
                                                                viewport.tilesize
                                                            );
                                                            tileDone[tileKey] = true;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        for (tileLoadingKey in tileLoadingCue) {
                                            if (tileLoadingCue.hasOwnProperty(tileLoadingKey)) {
                                                tileLoading = tileLoadingCue[tileLoadingKey];
                                                // get tile above
                                                tileAboveX = $.Math.floor(tileLoading.x / 2);
                                                tileAboveY = $.Math.floor(tileLoading.y / 2);
                                                tileAboveZ = tileLoading.z - 1;
                                                tileKeyAbove = encodeIndex(tileAboveX, tileAboveY, tileAboveZ);
                                                if (typeof map.renderer.tiles[t][tileKeyAbove] === 'undefined' &&
                                                        typeof tileLoadingCue[tileKeyAbove] === 'undefined') {
                                                    tileLoadingCue[tileKeyAbove] = {id: tileKeyAbove, x: tileAboveX, y: tileAboveY, z: tileAboveZ};
                                                }
                                            }
                                        }
                                        tileLoadingCue = map.renderer.sortObject(tileLoadingCue);
                                        for (tileLoadingKey in tileLoadingCue) {
                                            if (tileLoadingCue.hasOwnProperty(tileLoadingKey)) {
                                                tileLoading = tileLoadingCue[tileLoadingKey];
                                                if (!map.renderer.tiles[t][tileLoading.id]) {
                                                    // request tile and dispatch refresh
                                                    map.renderer.loadImage(
                                                        tileLoading.id,
                                                        tileLoading.x,
                                                        tileLoading.y,
                                                        tileLoading.z,
                                                        t,
                                                        tileprovider
                                                    );
                                                }
                                            }
                                        }

                                    }
                                }
                            }
                        },
                        {
                            id: 'markers',
                            zindex: 99,
                            visible: function () {
                                if (map.markers) {
                                    return true;
                                }
                                return false;
                            },
                            alpha: 1,
                            callback: function (id, viewport, alpha) {
                                var marker, x, y;
                                for (marker in map.markers) {
                                    if (map.markers.hasOwnProperty(marker)) {
                                        if (map.markers[marker].img && map.markers[marker].img.complete) {
                                            x = $.Math.round((map.position.lon2posX(map.markers[marker].lon) - viewport.xMin) / viewport.zp * viewport.zf) + map.markers[marker].offsetX - viewport.offsetX;
                                            y = $.Math.round((map.position.lat2posY(map.markers[marker].lat) - viewport.yMin) / viewport.zp * viewport.zf) + map.markers[marker].offsetY - viewport.offsetY;
                                            if (x > -50 && x < viewport.w + 50 && y > -50 && y < viewport.h + 50) {
                                                try {
                                                    map.renderer.context.globalAlpha = map.markers[marker].alpha || alpha;
                                                    map.renderer.context.drawImage(map.markers[marker].img, x, y);
                                                    map.markers[marker].bbox = [x, y + map.markers[marker].img.height, x + map.markers[marker].img.width, y];
                                                } catch (e) {}
                                            }
                                        } else {
                                            map.markers[marker].img = new $.Image();
                                            map.markers[marker].img.src = map.markers[marker].src;
                                            map.markers[marker].img.onload = map.renderer.update;
                                        }
                                    }
                                }
                            }
                        },
                        {
                            id: 'tracks',
                            zindex: 1,
                            visible: function () {
                                if (map.tracks) {
                                    return true;
                                }
                                return false;
                            },
                            alpha: 0.8,
                            callback: function (id, viewport, alpha) {
                                var t, track, i;

                                // map.renderer.context.globalAlpha = alpha;

                                function lon2x(lon) {
                                    return Math.round((map.position.lon2posX(lon) - viewport.xMin) / viewport.zp * viewport.zf) - viewport.offsetX;
                                }

                                function lat2y(lat) {
                                    return Math.round((map.position.lat2posY(lat) - viewport.yMin) / viewport.zp * viewport.zf) - viewport.offsetY;
                                }
                                for (t in map.tracks) {
                                    if (map.tracks.hasOwnProperty(t)) {
                                        track = map.tracks[t];
                                        map.renderer.context.globalAlpha = track.alpha || alpha;
                                        map.renderer.context.strokeStyle = track.strokeStyle;
                                        map.renderer.context.lineWidth = track.lineWidth;
                                        map.renderer.context.beginPath();
                                        map.renderer.context.moveTo(lon2x(track.points[0][0]), lat2y(track.points[0][1]));
                                        for (i = 1; i < track.points.length; i = i + 1) {
                                            map.renderer.context.lineTo(lon2x(track.points[i][0]), lat2y(track.points[i][1]));
                                        }
                                        map.renderer.context.stroke();
                                        map.renderer.context.closePath();
                                    }
                                }
                            }
                        }
                    ],
                    update: function () {
                        var event = $.document.createEvent('Event');
                        event.initEvent('update', false, false);
                        map.renderer.canvas.dispatchEvent(event);
                    },
                    refresh: function () {
                        var now = function () {
                                return (new $.Date()).getTime();
                            },
                            refreshId,
                            viewport,
                            layer,
                            i,
                            start,
                            event;

                        event = $.document.createEvent('Event');
                        event.initEvent('refresh', false, false);
                        map.renderer.canvas.dispatchEvent(event);

                        map.renderer.refreshLastStart = now();
                        refreshId = map.renderer.refreshCounter;
                        map.renderer.refreshCounter = map.renderer.refreshCounter + 1;
                        viewport = map.viewport();
                        for (layer in map.renderer.layers) {
                            if (map.renderer.layers.hasOwnProperty(layer)) {
                                if (map.renderer.layers[layer].visible()) {
                                    map.renderer.layers[layer].callback(refreshId, viewport, map.renderer.layers[layer].alpha);
                                }
                            }
                        }
                    },
                    /* garbage collector, purges tiles if more than 500 are loaded and tile is more than 100 refresh cycles old */
                    garbage: function () {
                        var remove, key, i;
                        if (map.renderer.tilecount > 500) {
                            if (map.renderer.tiles) {
                                remove = [];
                                for (key in map.renderer.tiles) {
                                    if (map.renderer.tiles.hasOwnProperty(key) && map.renderer.tiles[key] && map.renderer.tiles[key].complete && map.renderer.tiles[key].lastDrawnId < (map.renderer.refreshCounter - 100)) {
                                        remove.push(key);
                                    }
                                }
                                for (i = 0; i < remove.length; i = i + 1) {
                                    delete map.renderer.tiles[remove[i]];
                                }
                                map.renderer.tilecount = map.renderer.tilecount - i;
                            }
                        }
                    }
                },
                viewport: function () {
                    if (map.cacheValues && map.cache.viewport &&
                            map.cache.viewport.x === map.position.x  &&
                            map.cache.viewport.y === map.position.y  &&
                            map.cache.viewport.zoom === map.position.z  &&
                            map.cache.viewport.width === map.renderer.canvas.width &&
                            map.cache.viewport.height === map.renderer.canvas.height) {
                        return map.cache.viewport;
                    }
                    var viewport = {};

                    viewport.x = map.position.x;
                    viewport.y = map.position.y;
                    viewport.width =  map.renderer.canvas.width;
                    viewport.height =  map.renderer.canvas.height;
                    viewport.zoom = map.position.z;

                    viewport.zi = parseInt(map.position.z, 10);
                    viewport.zf = map.useFractionalZoom ? (1 + map.position.z - viewport.zi) : 1;
                    viewport.zp = map.pow(2, map.zMax - viewport.zi);

                    viewport.w = (map.renderer.canvas.width - map.renderer.canvas.width % 2) * viewport.zp;
                    viewport.h = (map.renderer.canvas.height - map.renderer.canvas.height % 2) * viewport.zp;
                    viewport.sz = map.renderer.tilesize * viewport.zp;
                    viewport.tilesize = (map.renderer.tilesize * viewport.zf);
                    viewport.xMin = (map.position.x - viewport.w / 2);
                    viewport.yMin = (map.position.y - viewport.h / 2);
                    viewport.xMax = (map.position.x + viewport.w / 2);
                    viewport.yMax = (map.position.y + viewport.h / 2);
                    viewport.offsetX = ((viewport.zf - 1) * (viewport.xMax - viewport.xMin) / viewport.zp / 2);
                    viewport.offsetY = ((viewport.zf - 1) * (viewport.yMax - viewport.yMin) / viewport.zp / 2);
                    map.cache.viewport = viewport;
                    return map.cache.viewport;
                },

                /* positioning, conversion between pixel + lon/lat */
                position: {
                    setX: function (x) {
                        var viewport, xMin, xMax;
                        if (map.position.minX && map.position.maxX) {
                            viewport =  map.viewport();
                            xMin = Math.floor(x - viewport.w / 2);
                            xMax = Math.ceil(x + viewport.w / 2);
                            if (xMin < map.position.minX) {
                                x = map.position.minX + viewport.w / 2;
                            } else if (xMax > map.position.maxX) {
                                x = map.position.maxX - viewport.w / 2;
                            }
                        }
                        map.position.x = Math.round(x);
                    },
                    setY: function (y) {
                        var viewport, yMin, yMax;
                        if (map.position.minY && map.position.maxY) {
                            viewport =  map.viewport();
                            yMin = Math.floor(y - viewport.h / 2);
                            yMax = Math.ceil(y + viewport.h / 2);
                            if (yMin < map.position.minY) {
                                y = map.position.minY + viewport.h / 2;
                            } else if (yMax > map.position.maxY) {
                                y = map.position.maxY - viewport.h / 2;
                            }
                        }
                        map.position.y = Math.round(y);
                    },
                    setZ: function (z, options) {
                        var animated;
                        options = options || {};

                        if (typeof z === 'undefined') {
                            return map.position.z;
                        }

                        if (typeof z !== 'number') {
                            z = map.position.z || map.zMin;
                        }
                        if (z < map.zMin) {
                            z = map.zMin;
                        }
                        if (z > map.zMax) {
                            z = map.zMax;
                        }
                        if (!options.animated) {
                            map.position.z = z;
                            map.renderer.update();
                            map.position.zoomed();
                        } else {
                            map.position.animation.start(false, false, z);
                        }
                        return map.position.z;
                    },
                    zoomIn: function (options) {
                        var step, round;
                        options = options || {};
                        step = options.step || 1;
                        round = options.round || false;
                        step = step || 1;
                        if (!map.useFractionalZoom) {
                            step = Math.round(step);
                            if (step < 1) {
                                step = 1;
                            }
                        }
                        if (round === false) {
                            map.position.setZ(map.position.z + step, options);
                        } else {
                            map.position.setZ($.Math.round(map.position.z + step), options);
                        }
                    },
                    zoomOut: function (options) {
                        var step, round;
                        options = options || {};
                        step = options.step || 1;
                        round = options.round || false;
                        step = step || 1;
                        if (!map.useFractionalZoom) {
                            step = Math.round(step);
                            if (step < 1) {
                                step = 1;
                            }
                        }
                        if (round === false) {
                            map.position.setZ(map.position.z - step, options);
                        } else {
                            map.position.setZ($.Math.round(map.position.z - step), options);
                        }
                    },
                    coords: function (coords, options) {
                        if (typeof coords !== "object") {
                            return {
                                lon: map.position.tile2lon(map.position.x / map.renderer.tilesize, map.zMax),
                                lat: map.position.tile2lat(map.position.y / map.renderer.tilesize, map.zMax),
                                z: map.position.z
                            };
                        }
                        coords = {
                            x: map.position.lon2posX(coords.lon),
                            y: map.position.lat2posY(coords.lat),
                            z: coords.zoom
                        };
                        map.position.center(coords, options);
                    },
                    center: function (coords, options) {
                        var animated, zoomChanged;
                        if (typeof coords === 'undefined') {
                            return {
                                x: map.position.x,
                                y: map.position.y,
                                z: map.position.z
                            };
                        }
                        options = options || {};
                        animated = options.animated || false;
                        zoomChanged = false;
                        if (!animated) {
                            map.position.setX(coords.x);
                            map.position.setY(coords.y);
                            if (coords.z && map.position.z !== coords.z) {
                                zoomChanged = true;
                            }
                            map.position.setZ(coords.z);
                            map.renderer.update();
                            if (map.events.dragging || options.animationStep) {
                                options.dragging = map.events.dragging;
                                map.position.moved();
                            } else {
                                map.position.moveend();
                            }
                            if (zoomChanged) {
                                map.position.zoomed();
                            }
                        } else {
                            map.position.animation.duration = options.duration || 750;
                            map.position.animation.start(coords.x, coords.y, coords.z);
                        }
                    },
                    move: function (dx, dy, options) {
                        map.position.center({
                            x: map.position.x + dx,
                            y: map.position.y + dy
                        }, options);
                    },
                    lat2posY: function (lat) {
                        return map.pow(2, map.zMax) * map.renderer.tilesize * (1 - $.Math.log($.Math.tan(lat * $.Math.PI / 180) + 1 / $.Math.cos(lat * $.Math.PI / 180)) / $.Math.PI) / 2;
                    },
                    lon2posX: function (lon) {
                        return map.pow(2, map.zMax) * map.renderer.tilesize * (lon + 180) / 360;
                    },
                    tile2lon: function (x, z) {
                        if (typeof z === 'undefined') {
                            z = map.position.z;
                        }
                        return (x / map.pow(2, z) * 360 - 180);
                    },
                    tile2lat: function (y, z) {
                        var n;
                        if (typeof z === 'undefined') {
                            z = map.position.z;
                        }
                        n = $.Math.PI - 2 * $.Math.PI * y / map.pow(2, z);
                        return (180 / $.Math.PI * $.Math.atan(0.5 * ($.Math.exp(n) - $.Math.exp(-n))));
                    },
                    zoomed: function (options) {
                        var event = $.document.createEvent('Event');
                        event.initEvent('zoomed', false, false);
                        map.renderer.canvas.dispatchEvent(event);
                    },
                    moved: function (options) {
                        var event = $.document.createEvent('Event');
                        event.initEvent('moved', false, false);
                        map.renderer.canvas.dispatchEvent(event);
                    },
                    moveend: function (options) {
                        var event = $.document.createEvent('Event');
                        event.initEvent('moveend', false, false);
                        map.renderer.canvas.dispatchEvent(event);
                    },
                    animation: {
                        now: function () {
                            return (new Date()).getTime();
                        },
                        timeoutId: 0,
                        interval: 0,
                        duration: 750,
                        descriptor: {},
                        ease: function (func) {
                            // use logic from jquery.easing
                            var t, b = 0, c = 1, d = 1;
                            if (map.position.animation.descriptor) {
                                t = ((map.position.animation.descriptor.end - map.position.animation.now()) / map.position.animation.descriptor.duration);
                                if (t < 0) {
                                    t = 0;
                                }
                                if (t > 1) {
                                    t = 1;
                                }
                                if (typeof func !== "function") {
                                    if (typeof func === "string") {
                                        switch (func) {
                                        case "easeInExpo":
                                            return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
                                        case "easeInSine":
                                            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
                                        case "easeInCubic":
                                            return c * (t /= d) * t * t + b;
                                        // case "easeInQuad":
                                        default:
                                            return c *  (t /= d) * t + b;
                                        }
                                    }
                                    return c *  (t /= d) * t + b;
                                }
                                return func(t);
                            }
                        },
                        start: function (x, y, z) {
                            map.position.animation.descriptor.duration = map.position.animation.duration;
                            map.position.animation.descriptor.start = map.position.animation.now();
                            map.position.animation.descriptor.end = map.position.animation.descriptor.start + map.position.animation.duration;
                            map.position.animation.descriptor.from = {
                                x: map.position.x,
                                y: map.position.y,
                                z: map.position.z
                            };
                            map.position.animation.descriptor.to = map.position.animation.descriptor.to || {};
                            if (typeof x !== 'undefined' && x !== false) {
                                map.position.animation.descriptor.to.x = x;
                            }
                            if (typeof y !== 'undefined' && y !== false) {
                                map.position.animation.descriptor.to.y = y;
                            }
                            if (typeof z !== 'undefined' && z !== false && z >= map.zMin && z <= map.zMax) {
                                map.position.animation.descriptor.to.z = z;
                            } else {
                                map.position.animation.descriptor.to.z = map.position.z;
                            }
                            map.position.animation.step();
                        },
                        step: function () {
                            var progressXY, progressZ, destX, destY, destZ;
                            if (map.position.animation.descriptor.end < map.position.animation.now()) {
                                map.position.center({
                                    x: map.position.animation.descriptor.to.x || map.position.x,
                                    y: map.position.animation.descriptor.to.y || map.position.y,
                                    z: map.position.animation.descriptor.to.z || map.position.z
                                }, {
                                    animationStep: false
                                });
                                map.position.animation.stop();
                            } else {
                                progressXY = map.position.animation.ease("easeInExpo");
                                progressZ = map.position.animation.ease("easeInCubic");

                                if (typeof map.position.animation.descriptor.to.x !== 'undefined' && map.position.animation.descriptor.to.x !== false) {
                                    destX = map.position.animation.descriptor.from.x * progressXY + map.position.animation.descriptor.to.x * (1 - progressXY);
                                }
                                if (typeof map.position.animation.descriptor.to.y !== 'undefined' && map.position.animation.descriptor.to.y !== false) {
                                    destY = map.position.animation.descriptor.from.y * progressXY + map.position.animation.descriptor.to.y * (1 - progressXY);
                                }
                                if (typeof map.position.animation.descriptor.to.z !== 'undefined' && map.position.animation.descriptor.to.z !== false) {
                                    destZ = map.position.animation.descriptor.from.z * progressZ + map.position.animation.descriptor.to.z * (1 - progressZ);
                                }
                                map.position.center({
                                    x: destX || map.position.x,
                                    y: destY || map.position.y,
                                    z: destZ || map.position.z
                                }, {
                                    animationStep: true
                                });
                                $.clearInterval(map.position.animation.timeoutId);
                                map.position.animation.timeoutId = $.setTimeout(map.position.animation.step, map.position.animation.interval);
                            }
                        },
                        stop: function () {
                            if (map.position.animation.timeoutId) {
                                $.clearTimeout(map.position.animation.timeoutId);
                                map.position.animation.timeoutId = 0;
                                map.position.animation.descriptor = {};
                            }
                        }
                    }
                },
                pow: function (base, exp) {
                    if (map.cacheValues) {
                        if (map.cache && map.cache.pow) {
                            if (map.cache.pow[base] && map.cache.pow[base][exp]) {
                                return map.cache.pow[base][exp];
                            }
                            if (!map.cache.pow) {
                                map.cache.pow = [];
                            }
                            if (!map.cache.pow[base]) {
                                map.cache.pow[base] = [];
                            }
                            map.cache.pow[base][exp] = $.Math.pow(base, exp);
                            return map.cache.pow[base][exp];
                        }
                    }
                    return $.Math.pow(base, exp);
                }
            };
            return { /* public functions */
                init: function (config) { /* init extensions first */
                    var e, sub, coords;
                    map.init();
                    for (e in slippymap.extension) {
                        if (slippymap.extension.hasOwnProperty(e)) {
                            if (typeof slippymap.extension[e] === 'function') {
                                this[e] = slippymap.extension[e](map);
                                if (typeof this[e].init === 'function') {
                                    this[e].init();
                                }
                            } else {
                                this[e] = {};
                                for (sub in slippymap.extension[e]) {
                                    if (slippymap.extension[e].hasOwnProperty(sub)) {
                                        this[e][sub] = slippymap.extension[e][sub](map);
                                        if (typeof this[e][sub].init === 'function') {
                                            this[e][sub].init();
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (typeof config === 'function') {
                        config(this);
                    }
                    coords = {
                        z:  (map.position && map.position.z) || options.zoom,
                        x: (map.position && map.position.x) || map.position.lon2posX(options.lon),
                        y: (map.position && map.position.y) || map.position.lat2posY(options.lat)
                    };
                    map.position.center(coords);

                    return this;
                },
                center: function (coords, options) {
                    if (typeof coords !== 'object') {
                        return {
                            x: map.position.x,
                            y: map.position.y,
                            z: map.position.z
                        };
                    }
                    map.position.center(coords, options);
                    return this;
                },
                coords: function (coords, options) {
                    if (typeof coords !== 'object') {
                        return map.position.coords();
                    }
                    map.position.coords(
                        {
                            lon: parseFloat(coords.lon),
                            lat: parseFloat(coords.lat),
                            zoom: parseFloat(coords.zoom)
                        },
                        options
                    );
                    return this;
                },
                zoom: function (z, options) {
                    if (typeof z !== 'number') {
                        return map.position.z;
                    }
                    map.position.setZ(z, options);
                    return this;
                },
                maxZ: function (z) {
                    if (typeof z !== 'number') {
                        return map.zMax;
                    }
                    if (z < map.zMin) {
                        map.zMax = map.zMin;
                    } else {
                        map.zMax = z;
                    }
                    return this;
                },
                minZ: function (z) {
                    if (typeof z !== 'number') {
                        return map.zMin;
                    }
                    if (z < 0) {
                        map.zMin = 0;
                    } else if (z > map.zMax) {
                        map.zMin = map.zMax;
                    } else {
                        map.zMin = z;
                    }
                    return this;
                },
                bounds: function (left, top, right, bottom) {
                    var viewport, bounds;
                    if (typeof left === 'number' && typeof top === 'number' &&
                            typeof right === 'number' && typeof bottom === 'number' &&
                            parseFloat(left) < parseFloat(right) &&
                            parseFloat(bottom) < parseFloat(top)) {
                        map.position.minX = map.position.lon2posX(parseFloat(left));
                        map.position.maxX = map.position.lon2posX(parseFloat(right));
                        map.position.minY = map.position.lat2posY(parseFloat(top));    // NB pixel origin is top left
                        map.position.maxY = map.position.lat2posY(parseFloat(bottom)); // NB pixel origin is top left
                        return this;
                    }
                    viewport =  map.viewport();
                    bounds = {};
                    bounds.left = map.position.tile2lon((map.position.x - viewport.w / 2) / map.renderer.tilesize, map.zMax);
                    bounds.right = map.position.tile2lon((map.position.x + viewport.w / 2) / map.renderer.tilesize, map.zMax);
                    bounds.top = map.position.tile2lat((map.position.y - viewport.h / 2) / map.renderer.tilesize, map.zMax);
                    bounds.bottom = map.position.tile2lat((map.position.y + viewport.h / 2) / map.renderer.tilesize, map.zMax);
                    return bounds;
                },
                refresh: function () {
                    map.renderer.update();
                    return this;
                },
                width: function (width) {
                    if (typeof width !== 'number') {
                        return map.renderer.canvas.width;
                    }
                    map.renderer.canvas.width = width;
                    return this;
                },
                height: function (height) {
                    if (typeof height !== 'number') {
                        return map.renderer.canvas.height;
                    }
                    map.renderer.canvas.height = height;
                    return this;
                },
                zoomIn: function (event, options) {
                    map.position.zoomIn(options);
                    if (event.preventDefault) {
                        map.events.preventDefault(event);
                    }
                    if (typeof event !== 'undefined') {
                        return this;
                    }
                    return false;
                },
                zoomOut: function (event, options) {
                    map.position.zoomOut(options);
                    if (event.preventDefault) {
                        map.events.preventDefault(event);
                    }
                    if (typeof event !== 'undefined') {
                        return this;
                    }
                    return false;
                },
                tileCache: function (tiles) {
                    if (typeof tiles !== 'undefined') {
                        map.renderer.tiles = tiles;
                    } else {
                        if (map.renderer.tiles.length === 1) {
                            return map.renderer.tiles[0];
                        }
                        return map.renderer.tiles;
                    }
                    return this;
                },
                tileProvider: function (provider) {
                    if (typeof provider !== 'function') {
                        return map.tileprovider;
                    }
                    map.tileprovider = provider;
                    delete map.renderer.tiles;
                    map.renderer.tiles = [];
                    map.renderer.update();
                    return this;
                },
                markers: function (markers) {
                    if (typeof markers !== 'object') {
                        return map.markers;
                    }
                    map.markers = markers;
                    map.renderer.update();
                    return this;
                },
                marker: function (id, marker, isUpdate) {
                    var property;
                    if (id && typeof marker !== 'object') {
                        return map.markers[id];
                    }
                    if (isUpdate === true) {
                        for (property in marker) {
                            if (marker.hasOwnProperty(property)) {
                                map.markers[id][property] = marker[property];
                            }
                        }
                    } else {
                        map.markers[id] = marker;
                    }
                    map.renderer.update();
                    return this;
                },
                tracks: function (tracks) {
                    if (typeof tracks !== 'object') {
                        return map.tracks;
                    }
                    map.tracks = tracks;
                    map.renderer.update();
                    return this;
                },
                tileSize: function (size) {
                    if (typeof size !== 'number') {
                        return map.renderer.tilesize;
                    }
                    map.renderer.tilesize = size;
                    return this;
                },
                fractionalZoom: function (state) {
                    if (state !== true && state !== false) {
                        return map.useFractionalZoom;
                    }
                    map.useFractionalZoom = state;
                    return this;
                },
                scrollMomentum: function (state) {
                    if (state !== true && state !== false) {
                        return map.scrollMomentum;
                    }
                    map.scrollMomentum = state;
                    return this;
                }
            };
        };
        slippymap.debug = function (params) {
            if (typeof window.console !== "undefined") {
                window.console.log(params);
            }
        };
        slippymap.extension = {};
        window.slippymap = slippymap;
    }
}(window));