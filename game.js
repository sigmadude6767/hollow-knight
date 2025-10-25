// Hollow Knight-inspired platformer with health, enemies, and level progression

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 700;

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

let level = 1;
let coinsCollected = 0;

// --- PLAYER SETUP ---
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
  facing: 1,
  attacking: false,
  attackTimer: 0,
  health: 5,
  invincible: 0
};

// --- LEVEL DATA ---
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
      { x: 200, y: 550, width: 200, height: 80 },
      { x: 600, y: 450, width: 250, height: 80 },
      { x: 1000, y: 350, width: 150, height: 80 },
    ],
    coins: [
      { x: 250, y: 510, collected: false },
      { x: 650, y: 410, collected: false },
      { x: 1050, y: 310, collected: false },
    ],
    enemies: [
      { x: 800, y: 600, width: 40, height: 40, speed: 2, alive: true },
      { x: 400, y: 500, width: 40, height: 40, speed: 2, alive: true },
      { x: 1000, y: 300, width: 40, height: 40, speed: 2, alive: true },
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

function drawCoins() {
  for (let c of coins) {
    if (!c.collected) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "gold";
      ctx.fill();
    }
  }
}

function drawEnemies() {
  for (let e of enemies) {
    if (e.alive) {
      ctx.fillStyle = "#ff5555";
      ctx.fillRect(e.x, e.y, e.width, e.height);
    }
  }
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Health: ${player.health}`, 20, 30);
  ctx.fillText(`Coins: ${coinsCollected}/${coins.length}`, 20, 60);
  ctx.fillText(`Level: ${level}`, 20, 90);
}

// --- UPDATE FUNCTIONS ---
function updatePlayer() {
  player.dx = 0;
  if (keys["a"] || keys["ArrowLeft"]) { player.dx = -player.speed; player.facing = -1; }
  if (keys["d"] || keys["ArrowRight"]) { player.dx = player.speed; player.facing = 1; }

  if ((keys["w"] || keys["ArrowUp"] || keys[" "]) && player.grounded) {
    player.dy = player.jumpPower;
    player.grounded = false;
  }

  if (keys["j"] && !player.attacking) {
    player.attacking = true;
    player.attackTimer = 10;
  }

  player.dy += player.gravity;
  player.x += player.dx;
  player.y += player.dy;

  // Platform collision
  player.grounded = false;
  for (let p of platforms) {
    if (player.x < p.x + p.width &&
        player.x + player.width > p.x &&
        player.y + player.height <= p.y + 10 &&
        player.y + player.height + player.dy >= p.y) {
      player.y = p.y - player.height;
      player.dy = 0;
      player.grounded = true;
    }
  }

  // Attack logic
  if (player.attacking) {
    player.attackTimer--;
    if (player.attackTimer <= 0) player.attacking = false;
    const attackRange = {
      x: player.facing === 1 ? player.x + player.width : player.x - 50,
      y: player.y + player.height / 2 - 10,
      w: 50, h: 20
    };
    for (let e of enemies) {
      if (e.alive &&
        attackRange.x < e.x + e.width &&
        attackRange.x + attackRange.w > e.x &&
        attackRange.y < e.y + e.height &&
        attackRange.y + attackRange.h > e.y) {
        e.alive = false;
      }
    }
  }

  // Coin collection
  for (let c of coins) {
    if (!c.collected &&
      player.x < c.x + 10 &&
      player.x + player.width > c.x - 10 &&
      player.y < c.y + 10 &&
      player.y + player.height > c.y - 10) {
      c.collected = true;
      coinsCollected++;
      if (coinsCollected === coins.length) {
        if (levels[level + 1]) {
          resetLevel(level + 1);
        } else {
          alert("🎉 You won the game!");
          resetLevel(1);
        }
      }
    }
  }

  if (player.invincible > 0) player.invincible--;
}

function updateEnemies() {
  for (let e of enemies) {
    if (!e.alive) continue;

    // Follow player on both axes
    if (player.x < e.x) e.x -= e.speed;
    else if (player.x > e.x) e.x += e.speed;

    if (player.y < e.y) e.y -= e.speed * 0.6;
    else if (player.y > e.y) e.y += e.speed * 0.6;

    // Collision with player → damage
    if (player.invincible <= 0 &&
      player.x < e.x + e.width &&
      player.x + player.width > e.x &&
      player.y < e.y + e.height &&
      player.y + player.height > e.y) {
      player.health--;
      player.invincible = 60; // brief invincibility
      if (player.health <= 0) {
        alert("💀 You Died! Restarting Level...");
        player.health = 5;
        resetLevel(level);
      }
    }
  }
}

// --- MAIN LOOP ---
function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPlatforms();
  drawCoins();
  drawEnemies();
  drawPlayer();
  drawUI();
}

function update() {
  updatePlayer();
  updateEnemies();
  draw();
  requestAnimationFrame(update);
}

update();
