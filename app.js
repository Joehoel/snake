const canvas = document.querySelector("canvas");
const score = document.querySelector(".score");

const ctx = canvas.getContext("2d");

const size = 600;
const framerate = 10;
const scale = 40;

canvas.width = size;
canvas.height = size;

class Grid {
  get rows() {
    return canvas.width / scale;
  }
  get columns() {
    return canvas.height / scale;
  }
}

class Snake {
  constructor() {
    this.x = 0;
    this.y = 0;

    this.xs = scale * 1;
    this.ys = 0;

    this.total = 0;
    this.tail = [];
  }

  draw() {
    ctx.fillStyle = "#FFFFFF";
    for (let i = 0; i < this.tail.length; i++) {
      ctx.fillRect(this.tail[i].x, this.tail[i].y, scale, scale);
    }
    ctx.fillRect(this.x, this.y, scale, scale);
  }

  update() {
    for (let i = 0; i < this.tail.length - 1; i++) {
      this.tail[i] = this.tail[i + 1];
    }

    this.tail[this.total - 1] = { x: this.x, y: this.y };

    this.x += this.xs;
    this.y += this.ys;

    if (this.x > canvas.width) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = canvas.width;
    } else if (this.y > canvas.height) {
      this.y = 0;
    } else if (this.y < 0) {
      this.y = canvas.height;
    }
  }

  eat(fruit) {
    if (this.x == fruit.x && this.y == fruit.y) {
      this.total++;
      return true;
    }

    return false;
  }

  check() {
    for (let i = 0; i < this.tail.length; i++) {
      if (this.x == this.tail[i].x && this.y == this.tail[i].y) {
        this.total = 0;
        this.tail = [];
      }
    }
  }

  steer(direction) {
    switch (direction) {
      case "up":
        this.xs = 0;
        this.ys = -scale;
        break;
      case "right":
        this.xs = scale;
        this.ys = 0;
        break;
      case "down":
        this.xs = 0;
        this.ys = scale;
        break;
      case "left":
        this.xs = -scale;
        this.ys = 0;
        break;

      default:
        break;
    }
  }
}

class Fruit {
  constructor() {
    this.x;
    this.y;
  }

  new() {
    this.x = (Math.floor(Math.random() * grid.rows - 1) + 1) * scale;
    this.y = (Math.floor(Math.random() * grid.columns - 1) + 1) * scale;
  }

  draw() {
    ctx.fillStyle = "#4cafab";
    ctx.fillRect(this.x, this.y, scale, scale);
  }
}

const snake = new Snake();
const fruit = new Fruit();
const grid = new Grid();

fruit.new();

setInterval(() => {
  requestAnimationFrame(game);
}, 1000 / framerate);

function game() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fruit.draw();
  snake.update();
  snake.draw();
  snake.check();

  score.textContent = snake.total;

  if (snake.eat(fruit)) {
    fruit.new();
  }
}

window.addEventListener("keydown", (e) => {
  const direction = e.key.replace("Arrow", "").toLowerCase();
  snake.steer(direction);
});
