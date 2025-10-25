const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 700;

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

let level = 1;
let coinsCollected = 0;

// --- PLAYER ---
const player = {
  x: 100,
  y: 500,
  width: 40,
  height: 60,
  speed: 5,
  dx: 0,
  dy: 0,
  jumpPower: -15,
  gravity: 0.8,
  grounded: false,
  jumpsLeft: 2,
  facing: 1,
  attacking: false,
  attackTimer: 0,
  health: 5,
  invincible: 0
};

// --- LEVELS DATA ---
const levels = {
  1: {
    platforms: [
      { x: 0, y: 650, width: 1200, height: 50 },
      { x: 300, y: 500, width: 200, height: 80 },
      { x: 700, y: 400, width: 250, height: 80 },
      { x: 1000, y: 550, width: 150, height: 80 },
    ],
    coins: [
      { x: 350, y: 460, collected: false },
      { x: 750, y: 360, collected: false },
      { x: 1050, y: 510, collected: false },
    ],
    enemies: [
      { x: 600, y: 590, width: 40, height: 40, speed: 2, alive: true },
      { x: 900, y: 360, width: 40, height: 40, speed: 2, alive: true },
    ]
  },
  2: {
    platforms: [
      { x: 0, y: 650, width: 1200, height: 50 },
      { x: 250, y: 550, width: 200, height: 80 },
      { x: 600, y: 450, width: 250, height: 80 },
      { x: 950, y: 350, width: 200, height: 80 },
    ],
    coins: [
      { x: 300, y: 510, collected: false },
      { x: 650, y: 410, collected: false },
      { x: 1000, y: 310, collected: false },
    ],
    enemies: [
      { x: 400, y: 500, width: 40, height: 40, speed: 2, alive: true },
      { x: 800, y: 600, width: 40, height: 40, speed: 2, alive: true },
      { x: 1050, y: 350, width: 40, height: 40, speed: 2, alive: true },
    ]
  },
  3: {
    platforms: [
      { x: 0, y: 650, width: 1200, height: 50 },
      { x: 150, y: 500, width: 150, height: 80 },
      { x: 400, y: 400, width: 200, height: 80 },
      { x: 700, y: 300, width: 250, height: 80 },
      { x: 1000, y: 500, width: 150, height: 80 },
    ],
    coins: [
      { x: 180, y: 460, collected: false },
      { x: 450, y: 360, collected: false },
      { x: 750, y: 260, collected: false },
      { x: 1020, y: 460, collected: false },
    ],
    enemies: [
      { x: 350, y: 580, width: 40, height: 40, speed: 2.2, alive: true },
      { x: 650, y: 380, width: 40, height: 40, speed: 2.2, alive: true },
      { x: 1000, y: 480, width: 40, height: 40, speed: 2.2, alive: true },
    ]
  },
  4: {
    platforms: [
      { x: 0, y: 650, width: 1200, height: 50 },
      { x: 200, y: 550, width: 200, height: 80 },
      { x: 500, y: 450, width: 200, height: 80 },
      { x: 800, y: 350, width: 250, height: 80 },
      { x: 1100, y: 250, width: 100, height: 80 },
    ],
    coins: [
      { x: 250, y: 510, collected: false },
      { x: 550, y: 410, collected: false },
      { x: 850, y: 310, collected: false },
      { x: 1120, y: 210, collected: false },
    ],
    enemies: [
      { x: 300, y: 580, width: 40, height: 40, speed: 2.5, alive: true },
      { x: 600, y: 430, width: 40, height: 40, speed: 2.5, alive: true },
      { x: 900, y: 330, width: 40, height: 40, speed: 2.5, alive: true },
      { x: 1100, y: 230, width: 40, height: 40, speed: 2.5, alive: true },
    ]
  },
  5: {
    platforms: [
      { x: 0, y: 650, width: 1200, height: 50 },
      { x: 150, y: 500, width: 200, height: 80 },
      { x: 450, y: 400, width: 250, height: 80 },
      { x: 750, y: 300, width: 250, height: 80 },
      { x: 1050, y: 200, width: 150, height: 80 },
    ],
    coins: [
      { x: 180, y: 460, collected: false },
      { x: 500, y: 360, collected: false },
      { x: 780, y: 260, collected: false },
      { x: 1080, y: 160, collected: false },
    ],
    enemies: [
      { x: 200, y: 580, width: 40, height: 40, speed: 3, alive: true },
      { x: 500, y: 380, width: 40, height: 40, speed: 3, alive: true },
      { x: 800, y: 280, width: 40, height: 40, speed: 3, alive: true },
      { x: 1050, y: 180, width: 40, height: 40, speed: 3, alive: true },
    ]
  }
};

let platforms = structuredClone(levels[level].platforms);
let coins = structuredClone(levels[level].coins);
let enemies = structuredClone(levels[level].enemies);

function resetLevel(newLevel) {
  level = newLevel;
  platforms = structuredClone(levels[level].platforms);
  coins = structuredClone(levels[level].coins);
  enemies = structuredClone(levels[level].enemies);
  player.x = 100;
  player.y = 500;
  player.dy = 0;
  player.dx = 0;
  player.jumpsLeft = 2;
  coinsCollected = 0;
}

// --- DRAW FUNCTIONS ---
function drawPlayer() {
  ctx.fillStyle = player.invincible > 0 ? "rgba(255,180,180,0.7)" : "#c0e6ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  if (player.attacking) {
    ctx.fillStyle = "rgba(150,220,255,0.7)";
    const attackWidth = 50;
    const attackHeight = 20;
    const ax = player.facing === 1 ? player.x + player.width : player.x - attackWidth;
    const ay = player.y + player.height / 2 - attackHeight / 2;
    ctx.fillRect(ax, ay, attackWidth, attackHeight);
  }
}

function drawPlatforms() {
  ctx.fillStyle = "#444";
  for (let p of platforms) ctx.fillRect(p.x, p.y, p.width, p.height);
}

function drawCoins
