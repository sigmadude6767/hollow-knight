// Hollow Knight Inspired Demo Game
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Game world settings ---
const gravity = 0.8;
const groundHeight = 80;

// --- Player settings ---
const player = {
  x: 100,
  y: canvas.height - groundHeight - 50,
  width: 40,
  height: 50,
  color: "#c0ffff",
  dy: 0,
  speed: 5,
  jumping: false
};

// --- Input tracking ---
const keys = {};

// --- Game loop ---
function update() {
  // Apply gravity
  player.dy += gravity;
  player.y += player.dy;

  // Prevent falling through ground
  if (player.y + player.height >= canvas.height - groundHeight) {
    player.y = canvas.height - groundHeight - player.height;
    player.dy = 0;
    player.jumping = false;
  }

  // Move left/right
  if (keys["ArrowLeft"] || keys["a"]) player.x -= player.speed;
  if (keys["ArrowRight"] || keys["d"]) player.x += player.speed;

  // Jump
  if ((keys["ArrowUp"] || keys["w"] || keys[" "]) && !player.jumping) {
    player.dy = -15;
    player.jumping = true;
  }

  draw();
  requestAnimationFrame(update);
}

// --- Draw everything ---
function draw() {
  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#222";
  ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);

  // Player (the “Knight”)
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Eyes glow (Hollow Knight feel)
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x + 8, player.y + 15, 5, 5);
  ctx.fillRect(player.x + 25, player.y + 15, 5, 5);
}

// --- Controls ---
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Start game
update();
