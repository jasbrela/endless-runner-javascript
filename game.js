window.onload = function () {
    // preload sprites
    const spritesUrl = "assets/sprites/";
    let imgURLs = [
        // player
        `${spritesUrl}player1_1.png`,
        `${spritesUrl}player1_2.png`,
        `${spritesUrl}player1_3.png`,
        `${spritesUrl}player1_4.png`,

        // obstacle
        `${spritesUrl}obstacle_1.png`,

        // ground
        `${spritesUrl}ground1_1.png`,
        `${spritesUrl}ground1_2.png`,
        `${spritesUrl}ground1_3.png`,
        `${spritesUrl}ground1_4.png`,
        `${spritesUrl}ground1_5.png`,
        `${spritesUrl}ground1_6.png`,
        `${spritesUrl}ground1_7.png`,
        `${spritesUrl}ground1_8.png`,

        // sky
        `${spritesUrl}sky1.png`,
        `${spritesUrl}sky2.png`,

    ]
    let images = [];

    const audiosUrl = "assets/audio/";
    let audioURLs = [
        `${audiosUrl}click.wav`,
        `${audiosUrl}hurt.wav`,
        `${audiosUrl}jump.wav`,
    ]
    let audios = [];

    let assetCounter = { imgCount: imgURLs.length, audioCount: audioURLs.length };

    preloadSprites(imgURLs, assetCounter.imgCount);

    preloadAudios(audioURLs, assetCounter.audioCount);



    // event handler
    const button = document.getElementById('restart-button')
    button.addEventListener('click', () => {
        audios[0].play()
        gameSetup();
        button.style.display = 'none';
    })

    const handler = new EventHandler();
    handler.on('game:lose', () => {
        // show restart button
        button.style.display = 'block';
    });

    // canvas
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // setting up sprites
    const player = new Image(), obstacle = new Image(), ground = new Image(), sky = new Image();

    obstacle.src = `${spritesUrl}obstacle_1.png`;
    player.src = `${spritesUrl}player1_1.png`;
    ground.src = `${spritesUrl}ground1_1.png`;
    sky.src = `${spritesUrl}sky1.png`;


    // sprite counters
    let playerSpriteCounter = 1;
    let groundSpriteCounter = 1;
    let skySpriteChange = false;

    // jumping
    let limit = 80;
    let goingDown = false;
    let isJumping = false;
    let jumpSpeed = 1;

    // texts
    const textColor = "white"

    // player & obstacle start position
    const playerX = canvas.width / 11, obstacleY = canvas.height - 180;
    let playerY = canvas.height - 150, obstacleX = canvas.width + 10;
    const initialY = playerY;

    // obstacle
    let obstacleSpeed = 1;

    // counters
    let playerScoreTimer = setInterval(scoreTimer, 1000);
    let playerSpriteTimer = setInterval(spriteTimer, 300);
    let difficultyTimer = setInterval(updateGameVariables, 1000);

    // game
    let score = 0;
    let timeout = 5;
    let game = setInterval(gameLoop, timeout);

    // others
    let gameTime = 1;
    let showStartText = true;
    let showPlusText = false;
    let phase = 1;

    // detect clicks and call MovePlayer()
    window.onkeydown = movePlayerUsingKeyboard;
    window.ontouchstart = movePlayerUsingTouch;

    const gameSetup = () => {
        // sprite counters
        playerSpriteCounter = 1;
        skySpriteCounter = 1;
        groundSpriteCounter = 1;
        skySpriteChange = false;

        // jumping
        limit = 80;
        goingDown = false;
        isJumping = false;
        jumpSpeed = 1;

        // player & obstacle start position
        playerY = canvas.height - 150, obstacleX = canvas.width + 10;

        // obstacle
        obstacleSpeed = 1;

        // counters
        playerScoreTimer = setInterval(scoreTimer, 1000);
        playerSpriteTimer = setInterval(spriteTimer, 300);
        difficultyTimer = setInterval(updateGameVariables, 1000);

        // game
        score = 0;
        timeout = 5;
        game = setInterval(gameLoop, timeout);

        // others
        gameTime = 0;
        showStartText = true;
        showPlusText = false;
        phase = 1;

    }

    // functions
    function gameLoop() {
        ctx.clearRect(0, 0, 800, 400);

        changeSprites();
        drawEverything(playerX, playerY);
        checkForBoundaries();
        detectCollisions(obstacleX, obstacleY);
        writeAllTexts();
    }

    //#region Functions related to Movement
    function movePlayerUsingKeyboard(keycode) {
        if (!isJumping) {
            audios[2].play();
            switch (keycode.keyCode) {
                case 32:
                case 38:
                    jumpInterval = setInterval(jump, 2);
                    break;
            }
        }
    }

    function movePlayerUsingTouch() {
        if (!isJumping) {
            jumpInterval = setInterval(jump, 2);
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
        const tolerance = 60;
        if (((playerX + player.width - tolerance) > obstacleX && playerX < (obstacleX + obstacle.width - tolerance)) &&
            ((playerY + player.width - tolerance) > obstacleY) && (playerY < (obstacleY + obstacle.height - tolerance))) {
            window.clearInterval(game);
            window.clearInterval(playerScoreTimer);
            window.clearInterval(playerSpriteTimer);
            window.clearInterval(difficultyTimer);

            audios[1].play();
            writeGameOverText();
            handler.emit('game:lose');
        }
    }

    function checkForBoundaries() {
        if (obstacleX < -obstacle.width) {
            obstacleX = canvas.width + obstacle.width;
        }
    }
    //#endregion

    //#region Functions related to Sprite

    function changeSprites() {

        changePlayerSprite();
        changeGroundSprite();
        changeSkySprite();
    }

    function changePlayerSprite() {
        player.src = `${spritesUrl}player1_${playerSpriteCounter}.png`;
    }

    function changeGroundSprite() {
        ground.src = `${spritesUrl}ground1_${groundSpriteCounter}.png`;
    }

    function changeSkySprite() {
        skySpriteChange ? sky.src = `${spritesUrl}sky2.png` : sky.src = `${spritesUrl}sky1.png`
    }

    function spriteTimer() {
        playerSpriteCounter++
        groundSpriteCounter++;

        if (playerSpriteCounter > 4) {
            playerSpriteCounter = 1;
        }

        if (groundSpriteCounter > 2) {
            groundSpriteCounter = 1;
        }
    }

    function drawEverything(x, y) {
        drawSky();
        drawGround();
        drawPlayer(x, y);
        drawObstacle();
    }

    function drawPlayer(x, y) {
        ctx.drawImage(player, x, y);
    }

    function drawGround() {
        ctx.drawImage(ground, 0, 0);
    }

    function drawSky() {
        ctx.drawImage(sky, 0, 0);
    }

    function drawObstacle() {
        ctx.drawImage(obstacle, obstacleX, obstacleY);
        obstacleX -= obstacleSpeed;
    }

    //#endregion

    function updateGameVariables() {
        gameTime++;

        // hide tutorial text
        if (gameTime == 15) {
            showStartText = false;
        }

        // change sky sprite
        if (gameTime % 30 == 0) {
            showPlusText = true;
            phase++;
            skySpriteChange ? skySpriteChange = false : skySpriteChange = true;
        } else {
            showPlusText = false;
        }

        // adds difficulty
        const multiplier = 0.015;
        obstacleSpeed += multiplier;
        jumpSpeed += multiplier;
    }

    //#region Functions related to Text
    function scoreTimer() {
        score = score + 10 // to update score every second, as a timer
    }

    function writeAllTexts() {
        writeScoreText();
        writeStartText();
        writePhaseText();
        writePlusText();

    }
    function writeScoreText() {
        ctx.font = "24px Verdana";
        ctx.fillStyle = textColor;
        ctx.textAlign = "left";
        ctx.fillText("Pontuação: " + score, 20, 40);
    }

    function writePhaseText() {
        ctx.font = "24px Verdana";
        ctx.fillStyle = textColor;
        ctx.textAlign = "left";
        ctx.fillText("Fase: " + phase, 20, 80);
    }

    function writePlusText() {
        if (showPlusText) {
            ctx.font = "24px Verdana";
            ctx.fillStyle = textColor;
            ctx.textAlign = "left";
            ctx.fillText("+", 0, 80);
        }
    }

    function writeGameOverText() {
        ctx.font = "72px Verdana";
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText("Fim de Jogo!", canvas.width / 2, canvas.height / 2);
    }

    function writeStartText() {
        if (showStartText) {
            ctx.font = "20px Verdana";
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.fillText("Toque na tela para pular", 650, 40);
        }
    }
    //#endregion

    //#region Functions related to Tools
    function randomizer(max) {
        return Math.floor(Math.random() * max) + 1;
    }

    function preloadSprites(imgURLs, count) {
        for (let i = 0; i < count; i++) {
            let img = new Image();
            images.push(img);

            img.onload = onLoadHandler("img");
            img.src = imgURLs[i];

            if (img.complete) onLoadHandler.bind(img);
        }
    }

    function onLoadHandler(type) {
        if (type === "img") {
            assetCounter.imgCount--;
        } else if (type === "audio") {
            assetCounter.audioCount--;
        }

        if (assetCounter.audioCount === 0 && assetCounter.imgCount === 0) {
            console.log(" Loading done!");
        }
    }

    function preloadAudios(audiosURLs, count) {
        for (let i = 0; i < count; i++) {
            let audio = new Audio();
            audios.push(audio);
            audio.addEventListener('canplaythrough', onLoadHandler("audio"), false)
            audio.src = audiosURLs[i];

        }
    }
    //#endregion
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