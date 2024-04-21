// Canvas Related 
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const socket = io('/pong');
let paddleIndex = 0;
let isReferee = false;

let width = 500;
let height = 700;

// Paddle
let paddleHeight = 10;
let paddleWidth = 50;
let paddleDiff = 25;
let paddleX = [ 225, 225 ];
let trajectoryX = [ 0, 0 ];
let playerMoved = false;

// Ball
let ballX = 250;
let ballY = 350;
let ballRadius = 5;
let ballDirection = 1;

// Speed
let speedY = 2;
let speedX = 0;

// Score for Both Players
let score = [ 0, 0 ];

// Create Canvas Element
function createCanvas() {
  canvas.id = 'canvas';
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);
  renderCanvas();
}

// Wait for Opponents
function renderIntro() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Intro Text
  context.fillStyle = 'white';
  context.font = "32px Courier New";
  context.fillText("Waiting for opponent...", 20, (canvas.height / 2) - 30);
}

// Render Everything on Canvas
function renderCanvas() {
  // Canvas Background
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Paddle Color
  context.fillStyle = 'white';

  // Bottom Paddle
  context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

  // Top Paddle
  context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight);

  // Dashed Center Line
  context.beginPath();
  context.setLineDash([4]);
  context.moveTo(0, 350);
  context.lineTo(500, 350);
  context.strokeStyle = 'grey';
  context.stroke();

  // Ball
  context.beginPath();
  context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();

  // Score
  context.font = "32px Courier New";
  context.fillText(score[0], 20, (canvas.height / 2) + 50);
  context.fillText(score[1], 20, (canvas.height / 2) - 30);
}

// Reset Ball to Center
function ballReset() {
  ballX = width / 2;
  ballY = height / 2;
  speedY = 3;
  // 将球 ⚽️ 移动数据 传给 服务端
  socket.emit('ballMove', {
    ballX,
    ballY,
    score
  })
}

// Adjust Ball Movement
function ballMove() {
  // Vertical Speed
  ballY += speedY * ballDirection;
  // Horizontal Speed
  if (playerMoved) {
    ballX += speedX;
  }
  // 将球 ⚽️ 移动数据 传给 服务端
  socket.emit('ballMove', {
    ballX,
    ballY,
    score
  })
}

// Determine What Ball Bounces Off, Score Points, Reset Ball
function ballBoundaries() {
  // Bounce off Left Wall
  if (ballX < 0 && speedX < 0) {
    speedX = -speedX;
  }
  // Bounce off Right Wall
  if (ballX > width && speedX > 0) {
    speedX = -speedX;
  }
  // Bounce off player paddle (bottom)
  if (ballY > height - paddleDiff) {
    if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[0] = ballX - (paddleX[0] + paddleDiff);
      speedX = trajectoryX[0] * 0.3;
    } else {
      // Reset Ball, add to Computer Score
      ballReset();
      score[1]++;
    }
  }
  // Bounce off computer paddle (top)
  if (ballY < paddleDiff) {
    if (ballX >= paddleX[1] && ballX <= paddleX[1] + paddleWidth) {
      // Add Speed on Hit
      if (playerMoved) {
        speedY += 1;
        // Max Speed
        if (speedY > 5) {
          speedY = 5;
        }
      }
      ballDirection = -ballDirection;
      trajectoryX[1] = ballX - (paddleX[1] + paddleDiff);
      speedX = trajectoryX[1] * 0.3;
    } else {
      ballReset();
      score[0]++;
    }
  }
}

// Called Every Frame
function animate() {
    // client 区分 裁判/非裁判
    if(isReferee){
        ballMove();
        ballBoundaries();
    }
  renderCanvas();
  window.requestAnimationFrame(animate);
}

function loadGame(){
    createCanvas();
    renderIntro();
    socket.emit('ready')
}

// Start Game, Reset Everything
function startGame() {
  paddleIndex = isReferee ? 0 : 1; // 裁判用顶板 否则用底板
  window.requestAnimationFrame(animate);
  canvas.addEventListener('mousemove', (e) => {
    playerMoved = true;
    paddleX[paddleIndex] = e.offsetX;
    if (paddleX[paddleIndex] < 0) {
      paddleX[paddleIndex] = 0;
    }
    if (paddleX[paddleIndex] > (width - paddleWidth)) {
      paddleX[paddleIndex] = width - paddleWidth;
    }
    // 同步
    // 发送了一个包含当前玩家板横向位置 (xPosition) 的对象。
    //这样做的目的是让服务器能够将这个位置信息传递给其他玩家，从而实现玩家板的同步移动
    socket.emit('paddleMove', {
        xPosition: paddleX[paddleIndex],
    })
    // Hide Cursor
    canvas.style.cursor = 'none';
  });
}

// On Load
loadGame()

socket.on("connect", () => {
    console.log(socket.id); // "G5p5..."
  });

socket.on("startGame", (refereeId) => {
    console.log('Referee is', refereeId);

    isReferee = socket.id === refereeId

    startGame()
})

// 同步 
// 接收其他玩家板位置信息并更新本地的对手玩家板位置，以保持游戏的同步性
socket.on('paddleMove', (paddleData) => {
    // Toggle 1 into 0  and 0 into 1
    const opponentPaddleIndex = 1 - paddleIndex  
    paddleX[opponentPaddleIndex] = paddleData.xPosition;
})

socket.on('ballMove', (ballData) => {
    // 假设ballData对象中有ballX、ballY和score属性，直接将这些属性的值赋给对应的变量
    ({ ballX, ballY, score } = ballData);
  });

