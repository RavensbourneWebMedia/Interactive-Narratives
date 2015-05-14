console.log(Phaser);

var game = new Phaser.Game(500, 400, Phaser.AUTO, 'game', {
	preload: preload,
	create: create,
	update: update
}, true) // true here means that the game background is going to be transparent

// make these variables accessible outside of functions
var player,
	cursors,
	platforms, // to group all platforms
	playerSpeed = 300,
	jumpSpeed = 500

function preload() {
	
	// load a sprite, for the player, a pig/cow
	game.load.spritesheet('pow', 'assets/cowthing.png', 64, 72)
	// load an image
	game.load.image('grass', 'assets/grass.png')
}

// set up the game
function create() {

	// give the game canvas an ID so that we can style it with CSS
	game.canvas.id = 'game'

	game.physics.startSystem(Phaser.Physics.ARCADE)

	game.world.setBounds(0, 0, 2000, game.world.height)

	// create the player
	player = game.add.sprite(200, 0, 'pow')
	game.physics.arcade.enable(player); // give it some gravity
	player.body.gravity.y = 600; // vertical acceleration, the higher the faster it falls
	player.body.collideWorldBounds = true; // so that player doesn't fall off the screen

	// get the camera to follow the player
	game.camera.follow(player)

	// animations
	player.animations.add('left',[0,1,2,3], 10, true)
	player.animations.add('right',[5,6,7,8], 10, true)

	// create the controls
	cursors = game.input.keyboard.createCursorKeys()

	platforms = game.add.group()
	platforms.enableBody = true

	// add a floor
	platform(0, game.world.height - 32, game.world.width, 32)
	// and some platforms
	platform(100, 100, 100, 10)
	platform(200, 200, 100, 10)
	platform(300, 300, 100, 10)
	platform(400, 400, 100, 10)

	// broadcast a "message" to whoever is listening..
	// "The game is ready!"
	document.dispatchEvent(gameReadyEvent)
}

// function to create a 'grass platform'
function platform(x, y, width, height) {
	var ledge = new Phaser.TileSprite(game, x, y, width, height, 'grass')
	platforms.add(ledge)
	ledge.body.immovable = true // so that when th
}

// called every single frame
function update() {
	 
	game.physics.arcade.collide(player, platforms)

	// preventing the player to move perpetually
	player.body.velocity.x = 0;

	// make the player move left and right
	if (cursors.right.isDown) {
		player.body.velocity.x = playerSpeed
		player.animations.play('right')
	} else if (cursors.left.isDown) {
		player.body.velocity.x = -playerSpeed
		player.animations.play('left')
	} else {
		player.animations.stop()
		player.frame = 4
	}

	// make the player jump
	// if (cursors.up.isDown) { // jetpack
	if (cursors.up.isDown && player.body.touching.down) {	
		player.body.velocity.y = -jumpSpeed
	}

	// send out a custom "message" with data about the camera
	// leaflet will pick this data up and move the map accordingly
	var cameraEvent = new CustomEvent('Camera', { detail: {x: game.camera.x, y:game.camera.y} })
	document.dispatchEvent(cameraEvent)
}