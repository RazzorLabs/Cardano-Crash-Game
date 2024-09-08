const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const messageElement = document.getElementById('message');
const cashoutButton = document.getElementById('cashoutButton');
const startButton = document.getElementById('startButton');
const carGif = document.getElementById('carGif');
const crashGif = document.getElementById('crashGif');
const winGif = document.getElementById('winGif');
const winGif2 = document.getElementById('winGif2');
const winGif3 = document.getElementById('winGif3');

let multiplier = 1.00;
let crashPoint;
let bet;
let stopGame = false;
let crashed = false;
let carPosition = { x: canvas.width - 100, y: canvas.height - 120 };
let backgroundOffset = 0;
let animationFrameId;
let gameStarted = false;

// Load Cardano logo image
const cardanoLogo = new Image();
cardanoLogo.src = 'cardano_logo.png';

// Building colors
const buildingColors = [
    '#000000', '#000000'
];

// Configuration for rotating buildings
const numBuildings = 2;
const buildingWidth = 100;
const buildingHeightMap = [];
const buildingColorMap = [];

// Generate building heights and colors
for (let i = 0; i < numBuildings; i++) {
    buildingHeightMap.push(Math.floor(Math.random() * (150 - 50 + 1)) + 50); // Random height between 50 and 150
    buildingColorMap.push(buildingColors[i % buildingColors.length]); // Cycle through colors
}

function getCrashPoint() {
    const lowerBound = 1.1;
    const upperBound = 3;

    const crashRange = Math.random() * (upperBound - lowerBound) + lowerBound;

    if (crashRange <= 2) {
        return (Math.random() * (1.2 - lowerBound) + lowerBound).toFixed(2);
    } else if (crashRange <= 5) {
        return (Math.random() * (5 - 1.2) + 1.2).toFixed(2);
    } else {
        return (Math.random() * (upperBound - 5) + 5).toFixed(2);
    }
}

function increaseMultiplier() {
    const interval = setInterval(() => {
        if (multiplier >= crashPoint || stopGame) {
            clearInterval(interval);

            if (multiplier < 1.10 && Math.random() <= 0.2) {
                crashed = true;
                crashPoint = 1.0;
            }

            if (multiplier >= crashPoint) {
                crashed = true;
                stopAnimation();
                messageElement.innerText = `Game crashed at ${crashPoint}x. You lost your bet of $${bet.toFixed(2)}.`;
            }
        } else {
            multiplier += 0.10;
            multiplier = Math.round(multiplier * 100) / 100;
            messageElement.innerText = `Multiplier: ${multiplier}x`;
        }
    }, 500);
}

function startGame() {
    bet = parseFloat(document.getElementById('bet').value);
    if (isNaN(bet) || bet <= 0) {
        alert('Please enter a valid bet amount.');
        return;
    }

    crashPoint = getCrashPoint();
    multiplier = 1.00;
    stopGame = false;
    crashed = false;
    messageElement.innerText = `Multiplier: ${multiplier}x`;

    cashoutButton.disabled = false;
    startButton.disabled = true;

    backgroundOffset = 0;

    gameStarted = true;
    carGif.style.display = 'block';
    crashGif.style.display = 'none';
    winGif.style.display = 'none';
    winGif2.style.display = 'none';
    winGif3.style.display = 'none';
    carGif.style.left = `${carPosition.x}px`;
    carGif.style.top = `${canvas.height - 75}px`;
    requestAnimationFrame(animateScene);
    increaseMultiplier();
}

function cashOut() {
    stopGame = true;
    if (!crashed) {
        const winnings = bet * multiplier;
        if (multiplier >= 1.05) {
            messageElement.innerText = `You cashed out at ${multiplier}x. You win $${winnings.toFixed(2)}!`;
        } else {
            crashed = true;
            crashPoint = 1.00;
            messageElement.innerText = `Game crashed at ${crashPoint}x. You lost your bet of $${bet.toFixed(2)}.`;
        }
    } else {
        messageElement.innerText = `Game crashed at ${crashPoint}x. You lost your bet of $${bet.toFixed(2)}.`;
    }
    cashoutButton.disabled = true;
    stopAnimation();
}

function stopAnimation() {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    startButton.disabled = false;
    carGif.style.display = 'block';

    if (crashed) {
        crashGif.style.display = 'block';
        crashGif.style.position = 'absolute';
        crashGif.style.left = `${carPosition.x}px`;
        crashGif.style.top = `${canvas.height - 120}px`;
    } else {
        winGif.style.display = 'block';
        winGif.style.position = 'absolute';
        winGif.style.left = `${carPosition.x - 200}px`;
        winGif.style.top = `${canvas.height - 480}px`;

        winGif2.style.display = 'block';
        winGif2.style.position = 'absolute';
        winGif2.style.left = `${carPosition.x}px`;
        winGif2.style.top = `${canvas.height - 480}px`;

        winGif3.style.display = 'block';
        winGif3.style.position = 'absolute';
        winGif3.style.left = `${carPosition.x + 200}px`;
        winGif3.style.top = `${canvas.height - 480}px`;
    }
}

function drawRoad() {
    const roadGradient = ctx.createLinearGradient(0, canvas.height - 100, 0, canvas.height);
    roadGradient.addColorStop(0, '#444');
    roadGradient.addColorStop(1, '#666');

    ctx.fillStyle = roadGradient;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
}

function drawBuilding(x, y, index) {
    const windowSize = 15;
    const buildingWidth = 80;
    const windowSpacing = 10;

    const color = buildingColorMap[index];
    const height = buildingHeightMap[index];

    ctx.fillStyle = color;
    ctx.fillRect(x, y - height, buildingWidth, height);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + buildingWidth / 2, y - height - 30);
    ctx.lineTo(x + buildingWidth, y - height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'white';
    const numWindowsX = Math.floor(buildingWidth / (windowSize + windowSpacing));
    const numWindowsY = Math.floor(height / (windowSize + windowSpacing));
    for (let i = 0; i < numWindowsX; i++) {
        for (let j = 0; j < numWindowsY; j++) {
            const windowX = x + i * (windowSize + windowSpacing) + 5;
            const windowY = y - height + j * (windowSize + windowSpacing) + 5;
            ctx.fillRect(windowX, windowY, windowSize, windowSize);
        }
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x + 5, y - height + 10, 20, 10);
    ctx.fillRect(x + buildingWidth - 25, y - height + 10, 20, 10);
}

function drawBackground() {
    // Create a gradient for the sky that transitions from black to dark grey to grey
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, '#000000'); // Black at the top
    skyGradient.addColorStop(0.5, '#000000'); // Dark grey in the middle
    skyGradient.addColorStop(1, '#87CEFA'); // Grey at the bottom

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    drawStars();

    // Draw the road
    const roadHeight = 100;
    ctx.fillStyle = '#666666'; // Black road color
    ctx.fillRect(0, canvas.height - roadHeight, canvas.width, roadHeight);

    // Draw buildings
    const startX = -backgroundOffset % buildingWidth;
    for (let i = startX; i < canvas.width + buildingWidth; i += buildingWidth) {
        const index = Math.floor((i + backgroundOffset) / buildingWidth) % numBuildings;
        drawBuilding(i, canvas.height - roadHeight, index);
    }
}

function drawStars() {
    const starCount = 50; // Number of snowflakes
    ctx.fillStyle = '#ffffff'; // White snow

    for (let i = 0; i < starCount; i++) {
        // Random position for each star
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height / 2); // Stars only in the upper half

        // Draw star as a small filled circle
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}



function drawCardanoLogo(x, y) {
    if (cardanoLogo.complete) {
        ctx.drawImage(cardanoLogo, x, y, 100, 100);
    }
}

function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Cardano Crash Game', canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = '24px Arial';
    ctx.fillText('Enter your Bet and Press Start to Play', canvas.width / 2, canvas.height / 2);

    drawCardanoLogo(canvas.width / 2 - 50, canvas.height / 2 + 20);
}

function animateScene() {
    if (!gameStarted) {
        drawStartScreen();
        animationFrameId = requestAnimationFrame(animateScene);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoad();
    drawBackground();

    drawCardanoLogo(canvas.width - 120, 10);

    if (!crashed) {
        carGif.style.display = 'block';
        crashGif.style.display = 'none';
        winGif.style.display = 'none';
        winGif2.style.display = 'none';
        winGif3.style.display = 'none';
    } else {
        carGif.style.display = 'none';
        stopAnimation();
    }

    backgroundOffset += 0.5;
    if (backgroundOffset >= buildingWidth) {
        backgroundOffset = 0; // Reset offset to loop the background
    }

    animationFrameId = requestAnimationFrame(animateScene);
}

startButton.addEventListener('click', startGame);
cashoutButton.addEventListener('click', cashOut);

drawStartScreen();
