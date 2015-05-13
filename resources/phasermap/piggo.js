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

	// give the game canvas an ID so that we can style it with CSS
	game.canvas.id = 'game'

	// give the game world some physics rules
	game.physics.startSystem(Phaser.Physics.ARCADE)

	// set the game world boundaries
	game.world.setBounds(0, 0, 2000, game.world.height)

	// create the player
	player = game.add.sprite(200, 0, 'piggo')
	game.physics.arcade.enable(player)
	player.body.collideWorldBounds = true // so that player doesn't fall off the screen

	// animations
	player.animations.add('up', [0,1,2,3], 10, true)
	player.animations.add('left', [4,5,6,7], 10, true)
	player.animations.add('right', [12,13,14,15], 10, true)
	player.animations.add('down', [8,9,10,11], 10, true)

	// create the controls
	cursors = game.input.keyboard.createCursorKeys()

}	

// called every single frame
function update() {

	// make the pig animate in four directions
	if (cursors.right.isDown) {
		player.animations.play('right')
	} else if (cursors.left.isDown) {
		player.animations.play('left')
	} else if (cursors.up.isDown) {
		player.animations.play('up')
	} else if (cursors.down.isDown) {
		player.animations.play('down')
	} else {
		player.animations.stop()
	}

}	