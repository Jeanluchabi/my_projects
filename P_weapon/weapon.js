// Create a new scene
let gameScene = new Phaser.Scene('Game');

// Variables to store sprites and dragon fire timer
let bg, player, enemy, dragonFireTimer, scoreText, playButton;
let cursors;
let defeated = false;
let score = 0;
let music; // Variable to store music

// Load images and music
gameScene.preload = function(){
    // Load images
    this.load.image('background', 'image/landscape-background.jpg');
    this.load.spritesheet('player', 'image/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('enemy', 'image/real_dragon.png', { frameWidth: 96, frameHeight: 96 });
    this.load.image('dragonFire', 'image/dragon_fire.png');
    this.load.image('playButton', 'image/button.jpg');

    // Load music
    this.load.audio('backgroundMusic', ['audio/background-music.mp3']);
};

// Called once after the preload ends
gameScene.create = function(){
    // Create bg sprite to accommodate the entire gameplay area
    bg = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'background').setScale(0.7);

    // Create player sprite at the bottom left of the background
    player = this.add.sprite(bg.x - bg.displayWidth / 2 + 20, bg.y + bg.displayHeight / 2 - 20, 'player').setScale(0.3);
    player.setOrigin(0, 1); // Set origin to bottom left corner of the player

    // Create enemy sprite at the top right of the background
    enemy = this.add.sprite(bg.x + bg.displayWidth / 2 - 20, bg.y - bg.displayHeight / 2 + 20, 'enemy').setScale(0.3);
    enemy.setOrigin(1, 0); // Set origin to top right corner of the enemy

    // Create score text
    scoreText = this.add.text(this.sys.game.config.width / 2, 20, 'Score: 0', { fontFamily: 'Arial', fontSize: 24, color: '#ffffff' }).setOrigin(0.5);

    // Enable cursor keys for player movement
    cursors = this.input.keyboard.createCursorKeys();

    // Hide player, enemy, and score initially
    player.setVisible(false);
    enemy.setVisible(false);
    scoreText.setVisible(false);

    // Create play button
    playButton = this.add.sprite(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'playButton').setInteractive().setScale(0.2); // Set scale to make it smaller
    playButton.on('pointerdown', startGame, this);

    // Load and play background music
    music = this.sound.add('backgroundMusic', { loop: true });
    music.play();
};

// Function to start the game
function startGame() {
    // Show player, enemy, and score
    player.setVisible(true);
    enemy.setVisible(true);
    scoreText.setVisible(true);

    // Show the play button
    playButton.setVisible(false);

    // Start timer for dragon fire
    dragonFireTimer = gameScene.time.addEvent({
        delay: 500, // Decrease the delay to increase the frequency of drops
        callback: dropDragonFire, // Callback function to drop dragon fire
        callbackScope: this, // Scope of the callback function
        loop: true // Repeat the timer indefinitely
    });

    // Start timer for scoring
    this.time.addEvent({
        delay: 1000, // Score every second
        callback: increaseScore, // Callback function to increase the score
        callbackScope: this, // Scope of the callback function
        loop: true // Repeat the timer indefinitely
    });
}

// Called every frame
gameScene.update = function(){
    // Check for cursor keys input to control player movement
    if (!defeated) {
        if (cursors.up.isDown && player.y > bg.y - bg.displayHeight / 2) {
            // Move player upward within the background boundaries
            player.y -= 5;
        }
        if (cursors.down.isDown && player.y < bg.y + bg.displayHeight / 2) {
            // Move player downward within the background boundaries
            player.y += 5;
        }
        if (cursors.left.isDown && player.x > bg.x - bg.displayWidth / 2) {
            // Move player leftward within the background boundaries
            player.x -= 5;
        }
        if (cursors.right.isDown && player.x < bg.x + bg.displayWidth / 2) {
            // Move player rightward within the background boundaries
            player.x += 5;
        }
    }
}

// Function to increase the score
function increaseScore() {
    // Increase score by 30 every second
    score += 30;
    scoreText.setText('Score: ' + score);

    // Check if the player has won
    if (score >= 500) {
        endGame(true); // Display victory message
    }
}

// Function to drop dragon fire
function dropDragonFire() {
    // Create dragon fire sprite at the enemy's position
    let dragonFire = gameScene.add.sprite(enemy.x, enemy.y, 'dragonFire').setScale(0.1);
    dragonFire.setOrigin(1, 0); // Set origin to top right corner of the dragon fire

    // Calculate the distance between the enemy and the player
    let distance = Phaser.Math.Distance.BetweenPoints(enemy, player);

    // Calculate the duration of the dragon fire drop based on the distance
    let duration = distance * 10; // Adjust the factor to control the speed

    // Tween to move the dragon fire towards the player
    gameScene.tweens.add({
        targets: dragonFire,
        x: player.x,
        y: player.y, // Move directly to player's position
        duration: duration, // Duration of the tween in milliseconds
        ease: 'Linear', // Use linear easing
        onComplete: function () {
            // Remove the dragon fire sprite when it reaches the player
            dragonFire.destroy();
            // Check if the player is hit by the dragon fire
            if (!defeated && Phaser.Math.Distance.Between(player.x, player.y, dragonFire.x, dragonFire.y) < 30) {
                // Player hit by fire
                endGame(false); // Display defeat message
            }
        }
    });
}

// Function to end the game
function endGame(victory) {
    // Update the defeated flag
    defeated = true;

    // Pause the game
    gameScene.scene.pause();

    // Stop the background music
    music.stop();

    // Display the defeat or victory message
    let message = victory ? 'You won 🤓' : 'You dead😔';
    let messageColor = victory ? '#00ff00' : '#ff0000';
    gameScene.add.text(player.x, player.y - 50, message + '\nFinal Score: ' + score, { fontFamily: 'Arial', fontSize: 24, color: messageColor }).setOrigin(0.5);
}

// Set the configuration of the game
let config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 576,
    scene: gameScene
};

// Create a new game, pass the configuration
let game = new Phaser.Game(config);
