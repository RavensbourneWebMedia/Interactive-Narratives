var game = new Phaser.Game(500, 400, Phaser.AUTO, 'game', {
	preload: preload,
	create: create,
	update: update
}, true) // true here means that the game background is going to be transparent


function preload() {

	// load the emojis
	game.load.spritesheet('emoji', 'assets/emoji_twitter_32.png', 32, 32)
}

var playerSpeed = 53

// set up the game
function create() {

	// give the game canvas an ID so that we can style it with CSS
	game.canvas.id = 'game'

	// give the game world some physics rules
	game.physics.startSystem(Phaser.Physics.ARCADE)

	// set the game world boundaries
	game.world.setBounds(0, 0, 2000, game.height)

	// create the player
	player = game.add.sprite(0, 0, 'emoji')
	player.x = (game.width - player.width) / 2
	player.y = (game.height - player.height) / 2
	game.physics.arcade.enable(player)
	player.body.collideWorldBounds = true // so that player doesn't fall off the screen

	// animations
	// doesn't have to be 4 frames per animation
	// you can repeat frames in different animations
	player.animations.add('up', [0,1,2,3], 10, true)
	player.animations.add('left', [4,5,6,7], 10, true)
	player.animations.add('right', [12,13,14,15], 10, true)
	player.animations.add('down', [8,9,10,11], 10, true)
	// player.frame = 1

	// create the controls
	cursors = game.input.keyboard.createCursorKeys()

	// get the camera to follow the player
	game.camera.follow(player)
}   

// called every single frame
function update() {

	// make the player animate in four directions
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

	// stop the player by default
	player.body.velocity.x = 0
	player.body.velocity.y = 0

	// make the player animate and move in four directions
	if (cursors.right.isDown) {
		player.body.velocity.x = playerSpeed
	} else if (cursors.left.isDown) {
		player.body.velocity.x = -playerSpeed
	} else if (cursors.up.isDown) {
		player.body.velocity.y = -playerSpeed
	} else if (cursors.down.isDown) {
		player.body.velocity.y = playerSpeed
	}

	 // let's store data about the camera position in a variable
	var data = { x: game.camera.x, y:game.camera.y }
	// dispatch a custom event with that data attached
	// the name of the event is up to us, as long as we call it consistently (including lowercase and UPPERCASE letters)
	document.dispatchEvent( new CustomEvent( 'Camera', { detail: data } ) )
}