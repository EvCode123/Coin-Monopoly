
let player;
let foods = [];
let aiSnakes = [];

let worldSize = 2500;
let camX = 0;
let camY = 0;

const AI_COUNT = 15;
const INITIAL_FOOD = 700;
const MAX_FOOD = 1000;

let gameOver = false;

function setup() {
  createCanvas(windowWidth, windowHeight);

  player = new Snake(0, 0, color(50, 150, 255), true);

  for (let i = 0; i < AI_COUNT; i++) {
    spawnAI();
  }

  for (let i = 0; i < INITIAL_FOOD; i++) {
    spawnFood();
  }
}

function draw() {
  background(24, 27, 32);

  if (gameOver) {
    drawGameOver();
    return;
  }

  // Camera follows player
  let targetCamX = player.body[0].x - width / 2;
  let targetCamY = player.body[0].y - height / 2;

  camX = lerp(camX, targetCamX, 0.12);
  camY = lerp(camY, targetCamY, 0.12);

  push();
  translate(-camX, -camY);

  drawGrid();
  drawWorldBorder();

  // Update snakes
  player.update();

  for (let ai of aiSnakes) {
    ai.update();
  }

  // Handle collisions
  handleSnakeCollisions();

  // Food
  updateFood();

  // Draw snakes
  for (let ai of aiSnakes) {
    ai.show();
  }

  player.show();

  pop();

  drawHUD();
}

function spawnAI() {
  let x = random(-worldSize + 200, worldSize - 200);
  let y = random(-worldSize + 200, worldSize - 200);

  let c = color(
    random(100, 255),
    random(100, 255),
    random(100, 255)
  );

  aiSnakes.push(new Snake(x, y, c, false));
}

function spawnFood(x, y) {
  if (foods.length >= MAX_FOOD) return;

  if (x === undefined) {
    x = random(-worldSize, worldSize);
    y = random(-worldSize, worldSize);
  }

  foods.push({
    pos: createVector(x, y),
    col: color(
      random(100, 255),
      random(100, 255),
      random(100, 255)
    )
  });
}

function updateFood() {
  for (let i = foods.length - 1; i >= 0; i--) {
    let food = foods[i];
    let eaten = false;

    // Player eating
    if (
      dist(
        player.body[0].x,
        player.body[0].y,
        food.pos.x,
        food.pos.y
      ) < player.radius + 7
    ) {
      player.length += 2;
      eaten = true;
    }

    // AI eating
    if (!eaten) {
      for (let ai of aiSnakes) {
        if (!ai.alive) continue;

        if (
          dist(
            ai.body[0].x,
            ai.body[0].y,
            food.pos.x,
            food.pos.y
          ) < ai.radius + 7
        ) {
          ai.length += 2;
          eaten = true;
          break;
        }
      }
    }

    if (eaten) {
      foods.splice(i, 1);
      spawnFood();
    } else {
      noStroke();
      fill(food.col);
      circle(food.pos.x, food.pos.y, 9);
    }
  }
}

function handleSnakeCollisions() {
  // Player hits world boundary
  let p = player.body[0];

  if (
    abs(p.x) > worldSize ||
    abs(p.y) > worldSize
  ) {
    gameOver = true;
    return;
  }

  // Player hits enemy bodies
  for (let ai of aiSnakes) {
    if (!ai.alive) continue;

    if (checkHeadBodyCollision(player, ai)) {
      gameOver = true;
      return;
    }

    // Enemy hits player body
    if (checkHeadBodyCollision(ai, player)) {
      killSnake(ai);
    }
  }

  // Enemy vs enemy collisions
  for (let i = 0; i < aiSnakes.length; i++) {
    let a = aiSnakes[i];

    if (!a.alive) continue;

    for (let j = 0; j < aiSnakes.length; j++) {
      if (i === j) continue;

      let b = aiSnakes[j];

      if (!b.alive) continue;

      if (checkHeadBodyCollision(a, b)) {
        killSnake(a);
        break;
      }
    }
  }
}

function checkHeadBodyCollision(headSnake, bodySnake) {
  let head = headSnake.body[0];

  // Skip first few body segments
  for (let i = 5; i < bodySnake.body.length; i += 2) {
    let segment = bodySnake.body[i];

    if (
      dist(head.x, head.y, segment.x, segment.y) <
      headSnake.radius + bodySnake.radius - 3
    ) {
      return true;
    }
  }

  return false;
}

function killSnake(snake) {
  if (!snake.alive) return;

  snake.alive = false;

  // Turn dead body into food
  for (let i = 0; i < snake.body.length; i += 3) {
    let segment = snake.body[i];

    spawnFood(
      segment.x + random(-5, 5),
      segment.y + random(-5, 5)
    );
  }

  snake.respawnTimer = frameCount + 120;
}

function drawWorldBorder() {
  noFill();
  stroke(180, 80, 80);
  strokeWeight(5);
  rect(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
}

function drawGrid() {
  stroke(42);
  strokeWeight(1);

  for (let x = -worldSize; x <= worldSize; x += 100) {
    line(x, -worldSize, x, worldSize);
  }

  for (let y = -worldSize; y <= worldSize; y += 100) {
    line(-worldSize, y, worldSize, y);
  }
}

function drawHUD() {
  fill(255);
  noStroke();

  textSize(19);
  textAlign(LEFT);

  text("Length: " + player.length, 20, 30);
  text("Enemies: " + aiSnakes.filter(s => s.alive).length, 20, 58);
  text("Boost: Hold CLICK or SPACE", 20, 86);

  textSize(14);
  fill(180);
  text("Eat glowing food and avoid enemy snake heads!", 20, 112);
}

function drawGameOver() {
  background(15, 18, 25);

  fill(255, 70, 70);
  textAlign(CENTER, CENTER);
  textSize(55);
  text("GAME OVER", width / 2, height / 2 - 50);

  fill(255);
  textSize(22);
  text(
    "Final Length: " + player.length,
    width / 2,
    height / 2 + 10
  );

  textSize(18);
  text("Click to restart", width / 2, height / 2 + 60);
}

function mousePressed() {
  if (gameOver) {
    foods = [];
    aiSnakes = [];
    gameOver = false;

    player = new Snake(0, 0, color(50, 150, 255), true);

    for (let i = 0; i < AI_COUNT; i++) {
      spawnAI();
    }

    for (let i = 0; i < INITIAL_FOOD; i++) {
      spawnFood();
    }
  }
}

class Snake {
  constructor(x, y, col, isPlayer) {
    this.body = [];

    this.length = 25;
    this.radius = 12;

    this.baseSpeed = isPlayer ? 3.8 : 3.1;
    this.boostSpeed = 6.2;

    this.col = col;
    this.isPlayer = isPlayer;

    this.angle = random(TWO_PI);
    this.targetAngle = this.angle;

    this.alive = true;
    this.respawnTimer = 0;

    this.turnSpeed = isPlayer ? 0.13 : 0.075;

    this.aiState = "wander";
    this.stateTimer = 0;

    this.target = null;

    for (let i = 0; i < this.length; i++) {
      this.body.push(
        createVector(
          x - cos(this.angle) * i * 5,
          y - sin(this.angle) * i * 5
        )
      );
    }
  }

  update() {
    if (!this.alive) {
      if (frameCount >= this.respawnTimer) {
        this.respawn();
      }
      return;
    }

    if (this.isPlayer) {
      this.playerControl();
    } else {
      this.aiControl();
    }

    // Smooth turning
    let diff = atan2(
      sin(this.targetAngle - this.angle),
      cos(this.targetAngle - this.angle)
    );

    this.angle += constrain(
      diff,
      -this.turnSpeed,
      this.turnSpeed
    );

    let speed = this.baseSpeed;

    if (this.isPlayer) {
      if (
        (mouseIsPressed || keyIsDown(32)) &&
        this.length > 12
      ) {
        speed = this.boostSpeed;

        if (frameCount % 5 === 0) {
          this.length--;

          // Boosting leaves food behind
          let tail = this.body[this.body.length - 1];

          if (tail) {
            spawnFood(tail.x, tail.y);
          }
        }
      }
    }

    // Move head
    let head = createVector(
      this.body[0].x + cos(this.angle) * speed,
      this.body[0].y + sin(this.angle) * speed
    );

    this.body.unshift(head);

    // Remove excess body segments
    while (this.body.length > this.length) {
      this.body.pop();
    }
  }

  playerControl() {
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;

    this.targetAngle = atan2(my, mx);
  }

  aiControl() {
    this.stateTimer--;

    let head = this.body[0];

    let nearestFood = null;
    let nearestFoodDist = Infinity;

    // Find nearby food
    for (let food of foods) {
      let d = dist(
        head.x,
        head.y,
        food.pos.x,
        food.pos.y
      );

      if (d < nearestFoodDist && d < 550) {
        nearestFoodDist = d;
        nearestFood = food;
      }
    }

    let playerHead = player.body[0];

    let playerDist = dist(
      head.x,
      head.y,
      playerHead.x,
      playerHead.y
    );

    // Decide AI behavior
    if (playerDist < 450 && random() < 0.035) {
      this.aiState = "hunt";
      this.stateTimer = 100;
    } else if (nearestFood && random() < 0.04) {
      this.aiState = "food";
      this.target = nearestFood.pos.copy();
      this.stateTimer = 100;
    } else if (this.stateTimer <= 0) {
      this.aiState = "wander";
      this.stateTimer = random(60, 150);
    }

    // Boundary avoidance
    let boundaryX = worldSize - head.x;
    let boundaryY = worldSize - head.y;

    if (head.x > worldSize - 200) {
      this.targetAngle = PI;
    } else if (head.x < -worldSize + 200) {
      this.targetAngle = 0;
    } else if (head.y > worldSize - 200) {
      this.targetAngle = -HALF_PI;
    } else if (head.y < -worldSize + 200) {
      this.targetAngle = HALF_PI;
    } else if (this.aiState === "hunt") {
      // Chase the player
      this.targetAngle = atan2(
        playerHead.y - head.y,
        playerHead.x - head.x
      );
    } else if (this.aiState === "food" && this.target) {
      // Seek food
      this.targetAngle = atan2(
        this.target.y - head.y,
        this.target.x - head.x
      );
    } else {
      // Wander
      this.targetAngle += random(-0.08, 0.08);
    }

    // Avoid other snake bodies
    let avoidance = createVector(0, 0);

    for (let other of [player, ...aiSnakes]) {
      if (other === this || !other.alive) continue;

      for (let i = 4; i < other.body.length; i += 5) {
        let segment = other.body[i];

        let d = dist(
          head.x,
          head.y,
          segment.x,
          segment.y
        );

        if (d < 75 && d > 0) {
          let force = createVector(
            head.x - segment.x,
            head.y - segment.y
          );

          force.normalize();
          force.mult((75 - d) / 75);

          avoidance.add(force);
        }
      }
    }

    if (avoidance.mag() > 0.1) {
      let avoidAngle = atan2(
        avoidance.y,
        avoidance.x
      );

      this.targetAngle = lerpAngle(
        this.targetAngle,
        avoidAngle,
        0.65
      );
    }
  }

  respawn() {
    let x = random(-worldSize + 300, worldSize - 300);
    let y = random(-worldSize + 300, worldSize - 300);

    this.body = [];

    for (let i = 0; i < this.length; i++) {
      this.body.push(
        createVector(
          x - cos(this.angle) * i * 5,
          y - sin(this.angle) * i * 5
        )
      );
    }

    this.length = 25;
    this.angle = random(TWO_PI);
    this.targetAngle = this.angle;

    this.alive = true;
    this.aiState = "wander";
    this.target = null;
  }

  show() {
    if (!this.alive) return;

    // Draw body from tail to head
    for (let i = this.body.length - 1; i >= 0; i--) {
      let segment = this.body[i];

      let size = this.radius * 2;

      // Slightly taper tail
      size *= map(i, 0, this.body.length, 1, 0.7);

      noStroke();
      fill(this.col);

      circle(segment.x, segment.y, size);

      // Eye details
      if (i === 0) {
        fill(255);

        let eyeOffsetX = cos(this.angle + HALF_PI) * 5;
        let eyeOffsetY = sin(this.angle + HALF_PI) * 5;

        circle(
          segment.x + eyeOffsetX + cos(this.angle) * 5,
          segment.y + eyeOffsetY + sin(this.angle) * 5,
          6
        );

        circle(
          segment.x - eyeOffsetX + cos(this.angle) * 5,
          segment.y - eyeOffsetY + sin(this.angle) * 5,
          6
        );
      }
    }
  }
}

function lerpAngle(a, b, amount) {
  let diff = atan2(
    sin(b - a),
    cos(b - a)
  );

  return a + diff * amount;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
