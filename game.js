const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.querySelector('.game-over');
const mainMenu = document.getElementById('mainMenu');
const scoreElement = document.getElementById('score');
const optionsMenu = document.getElementById('optionsMenu');
const achievementsMenu = document.getElementById('achievementsMenu');
const currentScore = document.getElementById('currentScore');
const highScoreElement = document.getElementById('highScore');
const userBalanceElement = document.getElementById('userBalance');

const GRID_SIZE = 20;
const GAME_SIZE = 400;
const GRID_COUNT = GAME_SIZE / GRID_SIZE;
const INITIAL_SPEED = 200; 
const SPEED_INCREASE = 1; 
const MIN_SPEED = 80; 
let POINTS_PER_FOOD = 5;

let snake, direction, food, gameOver, score;
let lastUpdateTime = 0;
let gameSpeed = INITIAL_SPEED;
let gameActive = false;
let coins = [];
let treasures = [];

const COIN_REWARD = 10;
const ACHIEVEMENT_REWARD = 50;

let userBalance = parseInt(localStorage.getItem('userBalance')) || 0;

const achievements = [
  { id: 'beginner', score: 50, title: 'Rookie Snake', description: 'Score 50 points', icon: '<svg viewBox="0-0 24 24" width="24" height="24"><path fill="#FFD700" d="M12 2L8.5 8.5 2 9.8l5 4.9-1.2 6.9 6.2-3.3 6.2 3.3-1.2-6.9 5-4.9-6.5-1.3z"/></svg>' },
  { id: 'intermediate', score: 100, title: 'Growing Up', description: 'Score 100 points', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#C0C0C0" d="M12 2L9.1 8.6 2 9.2 7 14l-1.2 7L12 17.8l6.2 3.2L17 14l5-4.8-7.1-.6z"/></svg>' },
  { id: 'advanced', score: 200, title: 'Snake Master', description: 'Score 200 points', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#CD7F32" d="M12 1L9 7.5l-6.5.5 4.7 4.6L5.5 19 12 16l6.5 3-1.7-6.4L21.5 8 15 7.5z"/></svg>' },
  { id: 'expert', score: 300, title: 'Snake Champion', description: 'Score 300 points', icon: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="#4CAF50" d="M12 1L8.2 8.8 0 10.3l6 5.8-1.4 8.3 7.4-3.9 7.4 3.9-1.4-8.3 6-5.8-8.2-1.5z"/></svg>' }
];

let matchEvents = [
  {
    triggered: false,
    score: 25,
    message: "Speed Boost Activated!",
    effect: () => { 
      gameSpeed = Math.max(MIN_SPEED - 10, gameSpeed - 10); 
    }
  },
  {
    triggered: false,
    score: 50,
    message: "Extreme Speed Challenge!",
    effect: () => { 
      gameSpeed = Math.max(MIN_SPEED - 20, gameSpeed - 20);
      createBarriers();
    }
  },
  {
    triggered: false,
    score: 75,
    message: "Double Points + Maze Challenge!",
    effect: () => { 
      POINTS_PER_FOOD = 10;
      createComplexBarriers();
    }
  },
  {
    triggered: false,
    score: 100,
    message: "Ultimate Challenge: Speed + Maze!",
    effect: () => {
      gameSpeed = Math.max(MIN_SPEED - 30, gameSpeed - 30);
      createMovingBarriers();
    }
  },
  {
    triggered: false,
    score: 150,
    message: "Chaos Mode Activated!",
    effect: () => {
      POINTS_PER_FOOD = 15;
      gameSpeed = Math.max(MIN_SPEED - 40, gameSpeed - 40);
      createRandomBarriers();
      spawnMultipleCoins();
    }
  },
  {
    triggered: false,
    score: 200,
    message: "Final Challenge: Survival Mode!",
    effect: () => {
      gameSpeed = Math.max(MIN_SPEED - 50, gameSpeed - 50);
      POINTS_PER_FOOD = 20;
      createMazeBarriers();
      spawnSpecialTreasures();
    }
  },
  {
    triggered: false,
    score: 250,
    message: "Ultimate Test: Master Challenge!",
    effect: () => {
      gameSpeed = Math.max(MIN_SPEED - 60, gameSpeed - 60);
      POINTS_PER_FOOD = 25;
      createDynamicBarriers();
      spawnRareItems();
    }
  }
];

let barriers = [];

function createBarriers() {
  barriers = [
    { x: 5, y: 5, width: 10, height: 1 },
    { x: 5, y: 15, width: 10, height: 1 }
  ];
}

function createComplexBarriers() {
  barriers = [
    { x: 5, y: 5, width: 10, height: 1 },
    { x: 5, y: 15, width: 10, height: 1 },
    { x: 5, y: 5, width: 1, height: 10 },
    { x: 15, y: 5, width: 1, height: 10 }
  ];
}

function createMovingBarriers() {
  barriers = [
    { x: 5, y: 5, width: 8, height: 1, dx: 0.1, dy: 0 },
    { x: 5, y: 15, width: 8, height: 1, dx: -0.1, dy: 0 }
  ];
}

function createRandomBarriers() {
  barriers = [];
  for (let i = 0; i < 5; i++) {
    barriers.push({
      x: Math.floor(Math.random() * (GRID_COUNT - 5)),
      y: Math.floor(Math.random() * (GRID_COUNT - 5)),
      width: Math.floor(Math.random() * 3) + 2,
      height: 1
    });
  }
}

function createMazeBarriers() {
  barriers = [
    { x: 5, y: 5, width: 10, height: 1 },
    { x: 5, y: 15, width: 10, height: 1 },
    { x: 5, y: 5, width: 1, height: 10 },
    { x: 15, y: 5, width: 1, height: 10 },
    { x: 8, y: 8, width: 4, height: 1 },
    { x: 8, y: 12, width: 4, height: 1 }
  ];
}

function createDynamicBarriers() {
  barriers = [
    { x: 5, y: 5, width: 8, height: 1, dx: 0.1, dy: 0 },
    { x: 5, y: 15, width: 8, height: 1, dx: -0.1, dy: 0 },
    { x: 5, y: 5, width: 1, height: 8, dx: 0, dy: 0.1 },
    { x: 15, y: 5, width: 1, height: 8, dx: 0, dy: -0.1 }
  ];
}

function checkBarrierCollision(head) {
  return barriers.some(barrier => {
    for (let x = barrier.x; x < barrier.x + barrier.width; x++) {
      for (let y = barrier.y; y < barrier.y + barrier.height; y++) {
        if (head.x === x && head.y === y) return true;
      }
    }
    return false;
  });
}

function drawBarriers() {
  ctx.fillStyle = '#FF5252';
  barriers.forEach(barrier => {
    for (let x = barrier.x; x < barrier.x + barrier.width; x++) {
      for (let y = barrier.y; y < barrier.y + barrier.height; y++) {
        ctx.fillRect(
          x * GRID_SIZE,
          y * GRID_SIZE,
          GRID_SIZE - 1,
          GRID_SIZE - 1
        );
      }
    }
  });
}

function showEventNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'event-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function checkMatchEvents() {
  matchEvents.forEach(event => {
    if (!event.triggered && score >= event.score) {
      event.triggered = true;
      showEventNotification(event.message);
      event.effect();
    }
  });
}

function showVictoryScreen() {
  const victoryScreen = document.createElement('div');
  victoryScreen.className = 'victory-screen';
  victoryScreen.innerHTML = `
    <h2>Congratulations!</h2>
    <p>You've completed the first chapter!</p>
    <p>Score: ${score}</p>
    <p class="coming-soon">More levels coming soon...</p>
    <button onclick="showMainMenu()" class="menu-button">Main Menu</button>
  `;
  document.body.appendChild(victoryScreen);
}

function checkAchievements(currentScore) {
  achievements.forEach(achievement => {
    if (currentScore >= achievement.score && !unlockedAchievements.includes(achievement.id)) {
      unlockAchievement(achievement);
    }
  });
}

function unlockAchievement(achievement) {
  if (!unlockedAchievements.includes(achievement.id)) {
    unlockedAchievements.push(achievement.id);
    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    updateBalance(ACHIEVEMENT_REWARD);
    showAchievementNotification(achievement);
    updateAchievementsMenu();
  }
}

function showAchievementNotification(achievement) {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-icon">${achievement.icon}</div>
    <div class="achievement-info">
      <div class="achievement-title">${achievement.title}</div>
      <div class="achievement-description">${achievement.description}</div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function updateScore() {
  currentScore.textContent = score;
  
  const currentHighScore = parseInt(localStorage.getItem('highScore')) || 0;
  if (score > currentHighScore) {
    highScore = score;
    localStorage.setItem('highScore', score.toString());
    highScoreElement.textContent = score;
  }
  
  checkAchievements(score);
}

function updateAchievementsMenu() {
  const achievementsList = document.getElementById('achievementsList');
  if (!achievementsList) return;
  
  achievementsList.innerHTML = achievements.map(achievement => `
    <div class="achievement-item ${unlockedAchievements.includes(achievement.id) ? 'unlocked' : 'locked'}">
      <div class="achievement-icon">${achievement.icon}</div>
      <div class="achievement-info">
        <div class="achievement-title">${achievement.title}</div>
        <div class="achievement-description">${achievement.description}</div>
      </div>
      <div class="achievement-status">
        ${unlockedAchievements.includes(achievement.id) ? 
          '<span class="status-unlocked">✓</span>' : 
          '<span class="status-locked">🔒</span>'}
      </div>
    </div>
  `).join('');
}

function showMainMenu() {
  gameOverScreen.style.display = 'none';
  mainMenu.style.display = 'flex';
  gameActive = false;
  canvas.style.opacity = '0.5';
  document.querySelector('.score-overlay').style.display = 'none';
}

function startGame() {
  mainMenu.style.display = 'none';
  gameActive = true;
  canvas.style.opacity = '1';
  document.querySelector('.score-overlay').style.display = 'block';
  resetGame();
}

function showOptions() {
  mainMenu.style.display = 'none';
  optionsMenu.style.display = 'flex';
}

function closeOptions() {
  optionsMenu.style.display = 'none';
  mainMenu.style.display = 'flex';
}

function showAchievements() {
  mainMenu.style.display = 'none';
  achievementsMenu.style.display = 'flex';
  updateAchievementsMenu();
}

function closeAchievements() {
  achievementsMenu.style.display = 'none';
  mainMenu.style.display = 'flex';
}

function initGame() {
  snake = [{x: 10, y: 10}];
  direction = {x: 0, y: 0};
  food = getRandomFood();
  gameOver = false;
  score = 0;
  gameSpeed = INITIAL_SPEED;
  gameOverScreen.style.display = 'none';
  coins = [];
  treasures = [];
  const savedHighScore = parseInt(localStorage.getItem('highScore')) || 0;
  highScoreElement.textContent = savedHighScore;
}

function getRandomFood() {
  let newFood;
  let minDistance = 3;
  let distance;
  
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_COUNT),
      y: Math.floor(Math.random() * GRID_COUNT)
    };
    distance = Math.abs(newFood.x - snake[0].x) + Math.abs(newFood.y - snake[0].y);
  } while (
    snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
    distance < minDistance
  );
  return newFood;
}

function drawSnake() {
  let currentSkin = 'classic';
  switch(currentSkin) {
    case 'neon':
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4CAF50';
      ctx.fillStyle = '#4CAF50';
      snake.forEach((segment, index) => {
        ctx.fillRect(
          segment.x * GRID_SIZE,
          segment.y * GRID_SIZE,
          GRID_SIZE - 1,
          GRID_SIZE - 1
        );
      });
      ctx.shadowBlur = 0;
      break;
    
    case 'rainbow':
      snake.forEach((segment, index) => {
        const hue = (Date.now() / 20 + index * 15) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(
          segment.x * GRID_SIZE,
          segment.y * GRID_SIZE,
          GRID_SIZE - 1,
          GRID_SIZE - 1
        );
      });
      break;
    
    default:
      ctx.fillStyle = '#2E7D32';
      snake.slice(1).forEach(segment => {
        ctx.fillRect(
          segment.x * GRID_SIZE,
          segment.y * GRID_SIZE,
          GRID_SIZE - 1,
          GRID_SIZE - 1
        );
      });
      
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(
        snake[0].x * GRID_SIZE,
        snake[0].y * GRID_SIZE,
        GRID_SIZE - 1,
        GRID_SIZE - 1
      );
  }
}

function drawFood() {
  ctx.fillStyle = '#FF5252';
  ctx.beginPath();
  ctx.arc(
    (food.x * GRID_SIZE) + GRID_SIZE/2,
    (food.y * GRID_SIZE) + GRID_SIZE/2,
    GRID_SIZE/2 - 1,
    0,
    Math.PI * 2
  );
  ctx.fill();
  
  const pulseSize = Math.sin(Date.now() / 200) * 2;
  ctx.beginPath();
  ctx.arc(
    (food.x * GRID_SIZE) + GRID_SIZE/2,
    (food.y * GRID_SIZE) + GRID_SIZE/2,
    (GRID_SIZE/3) + pulseSize,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = 'rgba(255, 82, 82, 0.3)';
  ctx.fill();
  
  coins.forEach(coin => {
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(
      (coin.x * GRID_SIZE) + GRID_SIZE/2,
      (coin.y * GRID_SIZE) + GRID_SIZE/2,
      GRID_SIZE/3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
  
  treasures.forEach(treasure => {
    ctx.fillStyle = '#00E7FF';
    ctx.beginPath();
    ctx.arc(
      (treasure.x * GRID_SIZE) + GRID_SIZE/2,
      (treasure.y * GRID_SIZE) + GRID_SIZE/2,
      GRID_SIZE/2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

function checkCollision(head) {
  if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
    return true;
  }
  
  return snake.some((segment, index) => {
    if (index === 0) return false;
    return segment.x === head.x && segment.y === head.y;
  });
}

function update(currentTime) {
  if (gameOver || !gameActive) return;
  
  if (score >= 300) {
    gameActive = false;
    showVictoryScreen();
    return;
  }
  
  checkMatchEvents();
  
  if (!lastUpdateTime) lastUpdateTime = currentTime;
  
  if (currentTime - lastUpdateTime >= gameSpeed) {
    const newHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y
    };
    
    if (checkCollision(newHead) || checkBarrierCollision(newHead)) {
      gameOver = true;
      scoreElement.textContent = score;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
      }
      gameOverScreen.style.display = 'block';
      return;
    }
    
    snake.unshift(newHead);
    
    if (newHead.x === food.x && newHead.y === food.y) {
      score += POINTS_PER_FOOD;
      updateScore();
      updateBalance(COIN_REWARD);
      food = getRandomFood();
      gameSpeed = Math.max(MIN_SPEED, INITIAL_SPEED - (score / 5) * SPEED_INCREASE);
    } else {
      snake.pop();
    }
    
    coins = coins.filter(coin => {
      if (newHead.x === coin.x && newHead.y === coin.y) {
        updateBalance(COIN_REWARD * 2);
        return false;
      }
      return true;
    });
    
    treasures = treasures.filter(treasure => {
      if (newHead.x === treasure.x && newHead.y === treasure.y) {
        updateBalance(COIN_REWARD * 5);
        return false;
      }
      return true;
    });
    
    lastUpdateTime = currentTime;
  }
}

function handleSwipe(event) {
  if (gameOver || !gameActive) return;
  
  const currentDirection = direction;
  let newDirection;
  
  switch(event.direction) {
    case Hammer.DIRECTION_UP:
      newDirection = {x: 0, y: -1};
      break;
    case Hammer.DIRECTION_DOWN:
      newDirection = {x: 0, y: 1};
      break;
    case Hammer.DIRECTION_LEFT:
      newDirection = {x: -1, y: 0};
      break;
    case Hammer.DIRECTION_RIGHT:
      newDirection = {x: 1, y: 0};
      break;
    default:
      return;
  }
  
  if (currentDirection.x + newDirection.x === 0 && 
      currentDirection.y + newDirection.y === 0) {
    return;
  }
  
  if (currentDirection.x === 0 && currentDirection.y === 0) {
    direction = newDirection;
    return;
  }
  
  let swipeBuffer = null;
  let swipeTimeout = null;
  clearTimeout(swipeTimeout);
  swipeBuffer = newDirection;
  swipeTimeout = setTimeout(() => {
    if (swipeBuffer) {
      direction = swipeBuffer;
      swipeBuffer = null;
    }
  }, 50); 
}

function spawnMultipleCoins() {
  for (let i = 0; i < 5; i++) {
    const coin = getRandomFood();
    coins.push(coin);
  }
}

function spawnSpecialTreasures() {
  for (let i = 0; i < 3; i++) {
    const treasure = getRandomFood();
    treasures.push(treasure);
  }
}

function spawnRareItems() {
  spawnMultipleCoins();
  spawnSpecialTreasures();
}

function updateBarriers() {
  barriers.forEach(barrier => {
    if (barrier.dx) barrier.x += barrier.dx;
    if (barrier.dy) barrier.y += barrier.dy;
    
    // Bounce off walls
    if (barrier.x <= 0 || barrier.x + barrier.width >= GRID_COUNT) {
      barrier.dx = -barrier.dx;
    }
    if (barrier.y <= 0 || barrier.y + barrier.height >= GRID_COUNT) {
      barrier.dy = -barrier.dy;
    }
  });
}

function gameLoop(currentTime) {
  ctx.clearRect(0, 0, GAME_SIZE, GAME_SIZE);
  
  if (gameActive) {
    updateBarriers();
    update(currentTime);
    drawBarriers();
    drawFood();
    drawSnake();
  }
  
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  initGame();
  lastUpdateTime = 0;
  gameActive = true;
}

const hammer = new Hammer(document.body);
hammer.get('swipe').set({ 
  direction: Hammer.DIRECTION_ALL,
  threshold: 5,  
  velocity: 0.1  
});
hammer.on('swipe', handleSwipe);

function updateBalance(amount) {
  userBalance += amount;
  localStorage.setItem('userBalance', userBalance);
  userBalanceElement.textContent = userBalance;
  
  const coin = document.createElement('div');
  coin.className = 'coin-collect';
  coin.textContent = `+${amount}💎`;
  coin.style.left = `${Math.random() * 80 + 10}%`;
  coin.style.top = `${Math.random() * 80 + 10}%`;
  document.body.appendChild(coin);
  
  setTimeout(() => coin.remove(), 500);
}

let unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
let highScore = parseInt(localStorage.getItem('highScore')) || 0;

userBalance = parseInt(localStorage.getItem('userBalance')) || 0;
userBalanceElement.textContent = userBalance;

initGame();
updateScore();
gameLoop();

document.addEventListener('touchmove', function(e) {
  e.preventDefault();
}, { passive: false });