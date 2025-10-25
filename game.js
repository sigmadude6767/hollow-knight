// Hollow Knight Inspired Game - Platforms + Coins + Smarter Enemies
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gravity = 0.8;
const groundHeight = 80;

const player = {
  x: 100,
  y: canvas.height - groundHeight - 50,
  width: 40,
  height: 50,
  color: "#c0ffff",
  dy: 0,
  speed: 5,
  jumping: false,
  facing: "right",
  attacking: false,
  attackTimer: 0,
  attackCooldown: 0,
  health: 3,
  coins: 0
};

let enemies = [];
let platforms = [];
let coins = [];
const keys = {};

// --- Spawn objects ---
function spawnEnemies() {
  enemies = [];
  for (let i = 0; i < 5; i++) {
    enemies.push({
      x: 300 + i * 150,
      y: canvas.height - groundHeight - 40,
      width: 40,
      height: 40,
      color: "#ff4444",
      speed: 2 + Math.random() * 1.5,
      dy: 0
    });
  }
}

function spawnPlatforms() {
  platforms = [
    { x: 200, y: 330, width: 150, height: 15 },
    { x: 500, y: 250, width: 120, height: 15 },
    { x: 350, y: 150, width: 100, height: 15 }
  ];
}

function spawnCoins() {
  coins = [
    { x: 240, y: 290, size: 15, collected: false },
    { x: 520, y: 210, size: 15, collected: false },
    { x: 380, y: 110, size: 15, collected: false },
    { x: 700, y: canvas.height - groundHeight - 25, size: 15, collected: false }
  ];
}

// --- Draw ---
function draw() {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#222";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

  // Platforms
  ctx.fillStyle = "#333";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // Coins
  coins.forEach(c => {
    if (!c.collected) {
      const gradient = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, c.size);
      gradient.addColorStop(0, "rgba(255, 255, 150, 1)");
      gradient.addColorStop(1, "rgba(255, 220, 0, 0.1)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x + 8, player.y + 15, 5, 5);
  ctx.fillRect(player.x + 25, player.y + 15, 5, 5);

  if (player.attacking) drawSlash();

  // Enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  // HUD
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("❤️ " + player.health, 10, 30);
  ctx.fillText("💰 " + player.coins, 80, 30);
}

// --- Slash effect ---
function drawSlash() {
  const arcLength = Math.PI / 1.5;
  const radius = 45;
  const centerX = player.facing === "right" ? player.x + player.width : player.x;
  const centerY = player.y + player.height / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(player.facing === "right" ? 1 : -1, 1);

  const gradient = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
  gradient.addColorStop(0, "rgba(200,255,255,0.8)");
  gradient.addColorStop(1, "rgba(0,255,255,0)");

  ctx.beginPath();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 10;
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#88ffff";
  ctx.arc(0, 0, radius, -arcLength / 2, arcLength / 2);
  ctx.stroke();
  ctx.restore();
}

// --- Physics ---
function applyGravity(entity) {
  entity.dy += gravity;
  entity.y += entity.dy;
}

// --- Collision helper ---
function rectCollide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// --- Player attack ---
function performAttack() {
  if (player.attackCooldown > 0) return;
  player.attacking = true;
  player.attackTimer = 15;
  player.attackCooldown = 30;

  const swordBox = {
    x: player.facing === "right" ? player.x + player.width : player.x - 50,
    y: player.y + 5,
    width: 50,
    height: 40
  };

  enemies = enemies.filter(e => {
    if (rectCollide(swordBox, e)) return false;
    return true;
  });
}

// --- Respawn ---
function respawn() {
  player.x = 100;
  player.y = canvas.height - groundHeight - 50;
  player.health = 3;
  player.coins = 0;
  spawnEnemies();
  spawnPlatforms();
  spawnCoins();
}

// --- Main Update ---
function update() {
  // Move left/right
  if (keys["ArrowLeft"] || keys["a"]) {
    player.x -= player.speed;
    player.facing = "left";
  }
  if (keys["ArrowRight"] || keys["d"]) {
    player.x += player.speed;
    player.facing = "right";
  }

  // Gravity
  applyGravity(player);

  // Ground collision
  if (player.y + player.height >= canvas.height - groundHeight) {
    player.y = canvas.height - groundHeight - player.height;
    player.dy = 0;
    player.jumping = false;
  }

  // Platform collisions
  platforms.forEach(p => {
    if (
      player.y + player.height <= p.y + 10 &&
      player.y + player.height + player.dy >= p.y &&
      player.x + player.width > p.x &&
      player.x < p.x + p.width
    ) {
      player.y = p.y - player.height;
      player.dy = 0;
      player.jumping = false;
    }
  });

  // Coin collection
  coins.forEach(c => {
    if (!c.collected && Math.abs(player.x - c.x) < 30 && Math.abs(player.y - c.y) < 40) {
      c.collected = true;
      player.coins++;
    }
  });

  // Attack timers
  if (player.attacking) {
    player.attackTimer--;
    if (player.attackTimer <= 0) player.attacking = false;
  }
  if (player.attackCooldown > 0) player.attackCooldown--;

  // Enemy movement (follow player)
  enemies.forEach(e => {
    e.dy += gravity * 0.4; // mild gravity for enemies
    e.y += e.dy;

    // Enemies follow player
    if (player.x > e.x) e.x += e.speed;
    else e.x -= e.speed;

    if (player.y > e.y) e.y += e.speed * 0.4;
    else e.y -= e.speed * 0.4;

    // Ground collision
    if (e.y + e.height >= canvas.height - groundHeight) {
      e.y = canvas.height - groundHeight - e.height;
      e.dy = 0;
    }

    // Enemy hits player
    if (rectCollide(player, e)) {
      player.health--;
      if (player.health <= 0) respawn();
    }
  });

  draw();
  requestAnimationFrame(update);
}

// --- Controls ---
window.addEventListener("keydown", e => {
  keys[e.key] = true;

  // Jump
  if ((e.key === "w" || e.key === "ArrowUp" || e.key === " ") && !player.jumping) {
    player.dy = -15;
    player.jumping = true;
  }

  // Attack
  if (e.key === "j") {
    performAttack();
  }
});

window.addEventListener("keyup", e => {
  keys[e.key] = false;
});

// Start everything
spawnEnemies();
spawnPlatforms();
spawnCoins();
update();
