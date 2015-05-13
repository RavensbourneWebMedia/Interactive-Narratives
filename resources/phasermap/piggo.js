console.log(Phaser)

// "global" variables, accessible outside of this JS file
var game,
	player,
	playerSpeed = 53

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

	// give the game canvas an ID so that we can style it with CSS
	game.canvas.id = 'game'

	// give the game world some physics rules
	game.physics.startSystem(Phaser.Physics.ARCADE)

	// set the game world boundaries
	game.world.setBounds(0, 0, 2000, game.height)

	// create the player
	player = game.add.sprite(0, 0, 'piggo')
	player.x = (game.width - player.width) / 2
	player.y = (game.height - player.height) / 2
	game.physics.arcade.enable(player)
	player.body.collideWorldBounds = true // so that player doesn't fall off the screen

	// animations
	player.animations.add('up', [0,1,2,3], 10, true)
	player.animations.add('left', [4,5,6,7], 10, true)
	player.animations.add('right', [12,13,14,15], 10, true)
	player.animations.add('down', [8,9,10,11], 10, true)

	// create the controls
	cursors = game.input.keyboard.createCursorKeys()

	// get the camera to follow the player
	game.camera.follow(player)
}	

// called every single frame
function update() {

	// stop the pig by default
	player.body.velocity.x = 0
	player.body.velocity.y = 0

	// make the pig animate and move in four directions
	if (cursors.right.isDown) {
		player.animations.play('right')
		player.body.velocity.x = playerSpeed
	} else if (cursors.left.isDown) {
		player.animations.play('left')
		player.body.velocity.x = -playerSpeed
	} else if (cursors.up.isDown) {
		player.animations.play('up')
		player.body.velocity.y = -playerSpeed
	} else if (cursors.down.isDown) {
		player.animations.play('down')
		player.body.velocity.y = playerSpeed
	} else {
		player.animations.stop()
	}


	// broadcast a "message" to whoever is listening ...
	// ... with data about the camera
	var data = { x: game.camera.x, y:game.camera.y }
	document.dispatchEvent( new CustomEvent( 'Camera', { detail: data } ) )
	// we can use Custom Events to get Phaser (game) and Leaflet (map) to talk to each other
	// Leaflet will pick this data up and move the map accordingly
}	