window.onload = function () {

    // TODO: Randomize obstacle Sprite

    // event handler
    const button = document.getElementById('restart-button')
    button.addEventListener('click', () => {
        gameSetup()
        button.style.display = 'none'
    })

    const handler = new EventHandler();
    handler.on('game:lose', () => {
        // show restart button
        button.style.display = 'block'  
    });

    // canvas
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // setting up sprites
    const player = new Image(), obstacle = new Image();
    obstacle.src = "images/obstacle-600.png";
    player.src = "images/player1-600.png";
    let changeSprite = false;

    // jumping
    let limit = 125;
    let goingDown = false;
    let isJumping = false;
    let jumpSpeed = 1;

    // texts
    const textColor = "black"

    // player & obstacle start position
    const yDivisor = 1.5;
    const playerX = canvas.width / 11, obstacleY = (canvas.height / yDivisor) + 40;
    let playerY = canvas.height / yDivisor, obstacleX = canvas.width + 10;
    const initialY = playerY;

    // obstacle
    let obstacleSpeed = 1;

    // counters
    let playerScoreTimer = setInterval(scoreTimer, 1000);
    let playerSpriteTimer = setInterval(spriteTimer, 300);

    // game
    let score = 0;
    let timeout = 5;
    let game = setInterval(gameLoop, timeout);

    // detect clicks and call MovePlayer()
    window.onkeydown = movePlayer;

    const gameSetup = () => {
        changeSprite = false;

        // jumping
        limit = 125;
        goingDown = false;
        isJumping = false;
        jumpSpeed = 1;

        // player & obstacle start position
        playerY = canvas.height / yDivisor, obstacleX = canvas.width + 10;

        // obstacle
        obstacleSpeed = 1;

        // counters
        playerScoreTimer = setInterval(scoreTimer, 1000);
        playerSpriteTimer = setInterval(spriteTimer, 300);

        // game
        score = 0;
        timeout = 5;
        game = setInterval(gameLoop, timeout);
    }

    // functions
    function gameLoop() {
        ctx.clearRect(0, 0, 800, 400);

        drawGround();
        changePlayerSprite();
        drawPlayer(playerX, playerY);
        writeStartMessage();
        controlObstacle();
        checkForBoundaries();
        detectCollisions(obstacleX, obstacleY);
        updateDifficulty();
        writeScoreText();
    }

    function movePlayer(keycode) {
        if (!isJumping)
            switch (keycode.keyCode) {
                case 32:
                case 38:
                    jumpInterval = setInterval(jump, 2);
                    break;
            }
    }

    function jump() {
        isJumping = true;
        if (playerY > limit && !goingDown) {
            playerY -= jumpSpeed;
        } else {
            goingDown = true;
            playerY += jumpSpeed;

            if (Math.floor(playerY) >= Math.floor(initialY)) {
                isJumping = false;
                goingDown = false;
                clearInterval(jumpInterval);
            }

        }
    }

    function detectCollisions(obstacleX, obstacleY) {
        if (((playerX + player.width - 25) > obstacleX && playerX < (obstacleX + obstacle.width - 25)) &&
            ((playerY + player.width - 25) > obstacleY) && (playerY < (obstacleY + obstacle.height - 25))) {
            window.clearInterval(game);
            window.clearInterval(playerScoreTimer);
            window.clearInterval(playerSpriteTimer);


            writeGameOverMessage();
            handler.emit('game:lose');
        }
    }

    function drawPlayer(x, y) {
        changePlayerSprite();
        ctx.drawImage(player, x, y);
    }


    function changePlayerSprite() {
        if (changeSprite) {
            player.src = "images/player1-600.png";
        } else {
            player.src = "images/player2-600.png";
        }
    }

    function drawGround() {
        ctx.fillStyle = "#d77bba";
        ctx.fillRect(0, canvas.height / 1.2, canvas.width, canvas.height);
    }

    function randomizer(max) {
        return Math.floor(Math.random() * max) + 1;
    }


    function controlObstacle() {
        ctx.drawImage(obstacle, obstacleX, obstacleY);
        obstacleX -= obstacleSpeed;
    }

    function spriteTimer() {
        changeSprite ? changeSprite = false : changeSprite = true;
    }

    function scoreTimer() {
        score = score + 10 // to update score every second, as a timer
    }

    function writeScoreText() {
        ctx.font = "30px Verdana";
        ctx.fillStyle = textColor;
        ctx.textAlign = "right";
        ctx.fillText("Score: " + score, canvas.width / 5, canvas.height / 10);
    }

    function updateDifficulty() {
        const multiplier = score * 0.00000001;
        obstacleSpeed += multiplier;
        jumpSpeed += multiplier;
    }

    function writeGameOverMessage() {
        ctx.font = "72px Verdana";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    }

    function writeStartMessage() {
        ctx.font = "16px Verdana";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText("Pressione 'Espaço' ou 'Seta para cima' para pular", canvas.width / 1.6, canvas.height / 11.5);
    }

    function checkForBoundaries() {
        if (obstacleX < -obstacle.width) {
            obstacleX = canvas.width + obstacle.width;
        }

    }
}


class EventHandler {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(...args));
        }
    }
}
