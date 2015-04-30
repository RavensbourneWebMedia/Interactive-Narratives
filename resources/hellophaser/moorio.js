console.log(Phaser);

var game = new Phaser.Game(960,600, Phaser.AUTO, '', {
	preload: preload,
	create: create,
	update: update
})

// make these variables accessible outside of functions
var player,
	cursors,
	platforms, // to group all platforms
	playerSpeed = 300,
	jumpSpeed = 500


function preload() {
	// load an image
	game.load.image('sky', 'assets/sky.png')
	// load a sprite, for the player, a pig/cow
	game.load.spritesheet('pow', 'assets/cowthing.png', 64, 72)
	game.load.image('grass', 'assets/grass.png')
}

// set up the game
function create() {

	game.physics.startSystem(Phaser.Physics.ARCADE)

	game.world.setBounds(0, 0, 2000, game.world.height)
	game.add.tileSprite(0, 0, 2000, game.world.height, 'sky')

	// create the player
	player = game.add.sprite(32, 0, 'pow')
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

}

// function to create a 'grass platform'
function platform(x, y, width, height) {
	var ledge = new Phaser.TileSprite(game, x, y, width, height, 'grass')
	platforms.add(ledge)
	ledge.body.immovable = true // so that when th
}

// called every single frame
function update() {
	
	// 
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

}