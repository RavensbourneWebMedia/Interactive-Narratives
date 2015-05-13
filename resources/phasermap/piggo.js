console.log(Phaser);

var game = new Phaser.Game(500, 400, Phaser.AUTO, 'game', {
	preload: preload,
	create: create,
	update: update
}, true) // true here means that the game background is going to be transparent


function preload() {
}

// set up the game
function create() {
}	

// called every single frame
function update() {
}	