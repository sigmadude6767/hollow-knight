// Hollow Knight Inspired Game - Combat Enhanced
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gravity = 0.8;
const groundHeight = 80;

// --- Player setup ---
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
  health: 3
};

let enemies = [];
const keys = {};

// --- Spawn a bunch of enemies ---
function spawnEnemies() {
  enemies = [];
  for (let i = 0; i < 6; i++) {
    enemies.push({
      x: 300 + i * 120,
      y: canvas.height - groundHeight - 40,
      width: 40,
      height: 40,
      color: "#ff4444",
      dir: Math.random() < 0.5 ? 1 : -1,
      speed: 1 + Math.random() * 2
    });
  }
}

// --- Draw everything ---
function draw() {
  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#222";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

  // Player body
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x + 8, player.y + 15, 5, 5);
  ctx.fillRect(player.x + 25, player.y + 15, 5, 5);

  // Draw attack arc if attacking
  if (player.attacking) {
    drawSlash();
  }

  // Enemies
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });

  // HUD
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("❤️ " + player.health, 10, 30);
}

// --- Draw glowing slash effect ---
function drawSlash() {
  const arcLength = Math.PI / 1.5; // half-circle swing
  const radius = 45;
  const centerX = player.facing === "right" ? player.x + player.width : player.x;
  const centerY = player.y + player.height / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(player.facing === "right" ? 1 : -1, 1);

  // Create glowing effect
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

// --- Collision check ---
function rectCollide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// --- Attack logic ---
function performAttack() {
  if (player.attackCooldown > 0) return; // prevent spamming

  player.attacking = true;
  player.attackTimer = 15;
  player.attackCooldown = 30;

  // Compute sword hitbox
  let swordBox = {
    x: player.facing === "right" ? player.x + player.width : player.x - 50,
    y: player.y + 5,
    width: 50,
    height: 40
  };

  // Hit enemies
  enemies = enemies.filter(e => {
    if (rectCollide(swordBox, e)) return false; // enemy destroyed
    return true;
  });
}

// --- Respawn logic ---
function respawn() {
  player.x = 100;
  player.y = canvas.height - groundHeight - 50;
  player.health = 3;
  spawnEnemies();
}

// --- Game update ---
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
  player.dy += gravity;
  player.y += player.dy;

  // Ground collision
  if (player.y + player.height >= canvas.height - groundHeight) {
    player.y = canvas.height - groundHeight - player.height;
    player.dy = 0;
    player.jumping = false;
  }

  // Attack timer
  if (player.attacking) {
    player.attackTimer--;
    if (player.attackTimer <= 0) player.attacking = false;
  }
  if (player.attackCooldown > 0) player.attackCooldown--;

  // Enemy behavior
  enemies.forEach(e => {
    e.x += e.dir * e.speed;
    if (e.x < 200 || e.x > canvas.width - 60) e.dir *= -1;

    // Enemy touches player
    if (rectCollide(player, e)) {
      player.health--;
      if (player.health <= 0) respawn();
    }
  });

  draw();
  requestAnimationFrame(update);
}

// --- Controls ---
window.addEventListener("keydown", (e) => {
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

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Start
spawnEnemies();
update();
