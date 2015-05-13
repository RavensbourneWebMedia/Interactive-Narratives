console.log(Phaser)

// "global" variables, accessible outside of this JS file
var game

game = new Phaser.Game(500, 400, Phaser.AUTO, 'game', {
	preload: preload,
	create: create,
	update: update
}, true) // true here means that the game background is going to be transparent


function preload() {

	// load a sprite, for the player: a pig
	game.load.spritesheet('piggo', 'assets/pig-walk.png', 55, 55)

}

// set up the game
function create() {
}	

// called every single frame
function update() {
}	