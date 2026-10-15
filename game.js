
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");

const player = {
  x: 50, y: 300, w: 30, h: 38,
  vx: 0, vy: 0, speed: 4,
  grounded: false
};

const platforms = [
  { x: 0, y: 410, w: 800, h: 40 },
  { x: 180, y: 330, w: 130, h: 18 },
  { x: 390, y: 260, w: 130, h: 18 },
  { x: 600, y: 330, w: 120, h: 18 }
];

const coins = [
  { x: 235, y: 290, got: false },
  { x: 445, y: 220, got: false },
  { x: 650, y: 290, got: false }
];

const keys = { left: false, right: false };
let score = 0;

function bindButton(id, action) {
  const button = document.getElementById(id);

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    action(true);
  });

  for (const event of ["pointerup", "pointercancel",
                       "lostpointercapture"]) {
    button.addEventListener(event, () => action(false));
  }

  button.addEventListener("contextmenu", e => e.preventDefault());
}

bindButton("left", value => keys.left = value);
bindButton("right", value => keys.right = value);

document.getElementById("jump").addEventListener(
  "pointerdown", e => {
    e.preventDefault();
    if (player.grounded) {
      player.vy = -12;
      player.grounded = false;
    }
  }
);

document.addEventListener("keydown", e => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", " "]
      .includes(e.key)) e.preventDefault();

  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;

  if ((e.key === "ArrowUp" || e.key === " ") &&
      player.grounded) {
    player.vy = -12;
    player.grounded = false;
  }
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

function update() {
  player.vx = (keys.right ? player.speed : 0) -
              (keys.left ? player.speed : 0);

  player.x += player.vx;
  player.x = Math.max(0, Math.min(
    canvas.width - player.w, player.x
  ));

  const oldY = player.y;
  player.vy += 0.55;
  player.y += player.vy;
  player.grounded = false;

  for (const p of platforms) {
    const overlapsX = player.x + player.w > p.x &&
                      player.x < p.x + p.w;

    if (overlapsX &&
        oldY + player.h <= p.y &&
        player.y + player.h >= p.y &&
        player.vy >= 0) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.grounded = true;
    }
  }

  for (const c of coins) {
    if (!c.got &&
        player.x < c.x + 10 &&
        player.x + player.w > c.x - 10 &&
        player.y < c.y + 10 &&
        player.y + player.h > c.y - 10) {
      c.got = true;
      score++;
      scoreText.textContent = "Coins: " + score;
    }
  }

  if (player.y > canvas.height + 100) {
    player.x = 50;
    player.y = 300;
    player.vy = 0;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Clouds
  ctx.fillStyle = "white";
  for (const [x, y] of [[100, 80], [380, 110], [650, 70]]) {
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.arc(x + 25, y - 8, 27, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // Platforms
  ctx.fillStyle = "#27864a";
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = "#6b4226";
    ctx.fillRect(p.x, p.y + 8, p.w, p.h - 8);
    ctx.fillStyle = "#27864a";
  }

  // Coins
  for (const c of coins) {
    if (c.got) continue;
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player
  ctx.fillStyle = "#e63946";
  ctx.fillRect(player.x, player.y, player.w, player.h);
  ctx.fillStyle = "white";
  ctx.fillRect(player.x + 18, player.y + 7, 6, 6);
  ctx.fillStyle = "black";
  ctx.fillRect(player.x + 21, player.y + 9, 3, 3);

  if (score === coins.length) {
    ctx.fillStyle = "#171b2e";
    ctx.fillRect(180, 150, 440, 90);
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", 400, 205);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
