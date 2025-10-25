// Hollow Knight-inspired game with coins, platforms, enemies, and attacks

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make the screen bigger
canvas.width = 1200;
canvas.height = 700;

let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// Player setup
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
  attackTimer: 0
};

// Platforms (taller)
const platforms = [
  { x: 0, y: 650, width: 1200, height: 50 },
  { x: 300, y: 500, width: 200, height: 80 },
  { x: 700, y: 400, width: 250, height: 80 },
  { x: 1000, y: 550, width: 150, height: 80 },
];

// Coins
const coins = [
  { x: 350, y: 460, collected: false },
  { x: 750, y: 360, collected: false },
  { x: 1050, y: 510, collected: false },
];

// Enemies follow on X-axis only
const enemies = [
  { x: 600, y: 590, width: 40, height: 40, speed: 2, alive: true },
  { x: 900, y: 360, width: 40, height: 40, speed: 2, alive: true },
  { x: 400, y: 440, width: 40, height: 40, speed: 2, alive: true },
];

function drawPlayer() {
  ctx.fillStyle = "#c0e6ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Attack arc
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
  for (let p of platforms) {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }
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
      ctx.fillStyle = "#ff6666";
      ctx.fillRect(e.x, e.y, e.width, e.height);
    }
  }
}

function updatePlayer() {
  // Movement
  player.dx = 0;
  if (keys["a"] || keys["ArrowLeft"]) { player.dx = -player.speed; player.facing = -1; }
  if (keys["d"] || keys["ArrowRight"]) { player.dx = player.speed; player.facing = 1; }

  // Jump
  if ((keys["w"] || keys["ArrowUp"] || keys[" "]) && player.grounded) {
    player.dy = player.jumpPower;
    player.grounded = false;
  }

  // Attack
  if (keys["j"] && !player.attacking) {
    player.attacking = true;
    player.attackTimer = 10;
  }

  // Apply gravity
  player.dy += player.gravity;
  player.x += player.dx;
  player.y += player.dy;

  // Collision with platforms
  player.grounded = false;
  for (let p of platforms) {
    if (player.x < p.x + p.width &&
        player.x + player.width > p.x &&
        player.y + player.height < p.y + player.dy + player.height &&
        player.y + player.height > p.y &&
        player.dy >= 0) {
      player.y = p.y - player.height;
      player.dy = 0;
      player.grounded = true;
    }
  }

  // Attack timer
  if (player.attacking) {
    player.attackTimer--;
    if (player.attackTimer <= 0) player.attacking = false;

    // Check attack hits
    const attackRange = { 
      x: player.facing === 1 ? player.x + player.width : player.x - 50,
      y: player.y + player.height / 2 - 10,
      w: 50,
      h: 20
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

  // Collect coins
  for (let c of coins) {
    if (!c.collected &&
      player.x < c.x + 10 &&
      player.x + player.width > c.x - 10 &&
      player.y < c.y + 10 &&
      player.y + player.height > c.y - 10) {
      c.collected = true;
    }
  }
}

function updateEnemies() {
  for (let e of enemies) {
    if (!e.alive) continue;

    // Follow player on X-axis
    if (player.x < e.x) e.x -= e.speed;
    else if (player.x > e.x) e.x += e.speed;
  }
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPlatforms();
  drawCoins();
  drawEnemies();
  drawPlayer();
}

function update() {
  updatePlayer();
  updateEnemies();
  draw();
  requestAnimationFrame(update);
}

update();
