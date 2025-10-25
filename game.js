// Hollow Knight Inspired Demo with Combat
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
  attacking: false,
  facing: "right",
  attackTimer: 0,
  health: 3
};

let enemies = [];
const keys = {};

// Spawn a few simple enemies
function spawnEnemies() {
  enemies = [
    { x: 400, y: canvas.height - groundHeight - 40, width: 40, height: 40, color: "#ff5555", dir: 1 },
    { x: 650, y: canvas.height - groundHeight - 40, width: 40, height: 40, color: "#ff5555", dir: -1 }
  ];
}

// Draw everything
function draw() {
  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#222";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

  // Player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Eyes
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x + 8, player.y + 15, 5, 5);
  ctx.fillRect(player.x + 25, player.y + 15, 5, 5);

  // Attack slash (temporary sword effect)
  if (player.attacking) {
    ctx.fillStyle = "#88ffff";
    if (player.facing === "right") {
      ctx.fillRect(player.x + player.width, player.y + 10, 25, 10);
    } else {
      ctx.fillRect(player.x - 25, player.y + 10, 25, 10);
    }
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

// Handle player movement, gravity, and attacks
function update() {
  // Movement
  if (keys["ArrowLeft"] || keys["a"]) {
    player.x -= player.speed;
    player.facing = "left";
  }
  if (keys["ArrowRight"] || keys["d"]) {
    player.x += player.speed;
    player.facing = "right";
  }

  // Jumping
  player.dy += gravity;
  player.y += player.dy;

  if (player.y + player.height >= canvas.height - groundHeight) {
    player.y = canvas.height - groundHeight - player.height;
    player.dy = 0;
    player.jumping = false;
  }

  // Attack timing
  if (player.attacking) {
    player.attackTimer--;
    if (player.attackTimer <= 0) player.attacking = false;
  }

  // Enemy movement + collision
  enemies.forEach((e, i) => {
    e.x += e.dir * 2;
    if (e.x < 300 || e.x > 750) e.dir *= -1;

    // Player attack collision
    if (player.attacking) {
      let swordBox = {
        x: player.facing === "right" ? player.x + player.width : player.x - 25,
        y: player.y + 10,
        width: 25,
        height: 10
      };

      if (rectCollide(swordBox, e)) {
        enemies.splice(i, 1);
      }
    }

    // Enemy touches player
    if (rectCollide(player, e)) {
      player.health--;
      if (player.health <= 0) {
        respawn();
      }
    }
  });

  draw();
  requestAnimationFrame(update);
}

// Collision check
function rectCollide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// Respawn player
function respawn() {
  player.x = 100;
  player.y = canvas.height - groundHeight - 50;
  player.health = 3;
  spawnEnemies();
}

// Input controls
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  // Jump
  if ((e.key === "w" || e.key === "ArrowUp" || e.key === " ") && !player.jumping) {
    player.dy = -15;
    player.jumping = true;
  }

  // Attack
  if (e.key === "j" && !player.attacking) {
    player.attacking = true;
    player.attackTimer = 15; // short attack duration
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

spawnEnemies();
update();
