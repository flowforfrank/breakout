let ball;
let paddle;
let bricks;
let scoreText;
let livesText;
let startButton;
let rotation;
let gameOverText;
let wonTheGameText;

let score = 0;
let lives = 3;

const textStyle = { 
    font: 'bold 18px Arial', 
    fill: '#FFF' 
};

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    physics: {
        default: 'arcade',
        arcade: {
            // debug: true,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload,
        create,
        update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('paddle', 'img/paddle.png');
    this.load.image('brick', 'img/brick.png');
    this.load.image('destroyed', 'img/destroyed.png');
    this.load.image('ball', 'img/ball.png');
}

function create() {
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.cameras.main.setBackgroundColor('#222');

    paddle = this.physics.add.image(this.cameras.main.centerX, this.game.config.height - 50, 'paddle')
        .setOrigin(0.5)
        .setImmovable();

    ball = this.physics.add.image(this.cameras.main.centerX, this.game.config.height - 100, 'ball')
        .setOrigin(0.5)
        .setCollideWorldBounds(true)
        .setBounce(1);

    bricks = this.physics.add.staticGroup({
        key: 'brick',
        frameQuantity: 20,
        gridAlign: { width: 10, cellWidth: 60, cellHeight: 60, x: this.cameras.main.centerX - 280, y: 100 }
    });

    scoreText = this.add.text(20, 20, 'Score: 0', textStyle);
    livesText = this.add.text(this.game.config.width - 20, 20, 'Lives: '+lives, textStyle).setOrigin(1, 0);
    
    gameOverText = this.add.text(this.game.config.width * 0.5, this.game.config.height *0.5, 'Game over!', textStyle)
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#111', fill: '#e74c3c' })
        .setVisible(false);

    wonTheGameText = this.add.text(this.game.config.width * 0.5, this.game.config.height *0.5, 'You won the game!', textStyle)
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#111', fill: '#27ae60' })
        .setVisible(false);

    startButton = this.add.text(this.game.config.width * 0.5, this.game.config.height *0.5, 'Start game', textStyle)
        .setOrigin(0.5)
        .setPadding(10)
        .setStyle({ backgroundColor: '#111' })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => startGame.call(this))
        .on('pointerover', () => startButton.setStyle({ fill: '#f39c12' }))
        .on('pointerout', () => startButton.setStyle({ fill: '#FFF' }));

    this.physics.add.collider(ball, bricks, hitBrick, null, this);
    this.physics.add.collider(ball, paddle, hitPaddle, null, this);
}

function update() {
    if (rotation) {
        ball.rotation = rotation === 'left' ?  ball.rotation - .05 : ball.rotation + .05;
    }

    if (ball.y > paddle.y) {
        lives--;

        if (lives > 0) {
            livesText.setText(`Lives: ${lives}`);

            ball.setPosition(this.cameras.main.centerX, this.game.config.height - 100)
                .setVelocity(300, -150);
        } else {
            ball.destroy();

            gameOverText.setVisible(true);
        }
    }
}


function hitPaddle(ball, paddle) {
    var diff = 0;

    if (ball.x < paddle.x) {
        diff = paddle.x - ball.x;
        ball.setVelocityX(-20 * diff);
        rotation = 'left';
    } else if (ball.x > paddle.x) {
        diff = ball.x - paddle.x;
        ball.setVelocityX(20 * diff);
        rotation = 'right';
    } else {
        ball.setVelocityX(2 + Math.random() * 10);
    }
}

function hitBrick(ball, brick) {
    brick.setTexture('destroyed');
   
    score += 5;
    scoreText.setText(`Score: ${score}`);

    this.tweens.add({
        targets: brick,
        scaleX: 0,
        scaleY: 0,
        ease: 'Power1',
        duration: 500,
        delay: 250,
        angle: 180,
        onComplete: () => { 
            brick.destroy();

            if (bricks.countActive() === 0) {
                ball.destroy();

                wonTheGameText.setVisible(true);
            }
        }
    });
}

function startGame() {
    this.input.on('pointermove', pointer => {
        paddle.x = Phaser.Math.Clamp(pointer.x, paddle.width / 2, this.game.config.width - paddle.width / 2);
    }, this);

    startButton.destroy();
    ball.setVelocity(-300, -150);
    rotation = 'left';
}