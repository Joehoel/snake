const canvas = document.querySelector("canvas");
const score = document.querySelector(".score");
const highscore = document.querySelector(".highscore");
const message = document.querySelector("#start");
const overlay = document.querySelector(".overlay");
const nameForm = document.querySelector("#nameForm");
const highscoreModal = document.querySelector("#highscore-modal");
const highscoreButton = document.querySelector("#highscore-button");
const highscoreList = document.querySelector("#highscore-list");
const nameModal = document.querySelector("#name-modal");

let name;

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
    this.x = (Math.floor(Math.random() * grid.rows - 1) + 1) * scale;
    this.y = (Math.floor(Math.random() * grid.columns - 1) + 1) * scale;

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

    if (this.x >= canvas.width) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = canvas.width;
    } else if (this.y >= canvas.height) {
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
        Storage.setHighscore(this.total);

        const user = { name: name, highscore: this.total };
        const raw = JSON.stringify(user);

        fetch(`${BASE_URL}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: raw,
        })
          .then((res) => res.json())
          .then((data) => console.log(data));

        this.total = 0;
        this.tail = [];
        clearInterval(loop);
        started = false;
        message.textContent = "You died, press any key to try again...";
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

class Storage {
  static getHighscore() {
    let highscore;

    if (localStorage.getItem("highscore") === null) {
      highscore = "0";
    } else {
      highscore = localStorage.getItem("highscore");
    }
    return highscore;
  }

  static setHighscore(score) {
    if (score > this.getHighscore()) {
      localStorage.setItem("highscore", score);
    }
  }
}

// TODO: Create modal for user name

const grid = new Grid();
const fruit = new Fruit();
const snake = new Snake();

fruit.new();
fruit.draw();
snake.draw();

let loop;
function start() {
  loop = setInterval(() => {
    requestAnimationFrame(game);
  }, 1000 / framerate);
}

function game() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  fruit.draw();
  snake.update();
  snake.draw();
  snake.check();

  score.textContent = snake.total;
  if (Storage.getHighscore() === "0") {
    highscore.textContent = "0";
  } else {
    highscore.textContent = Storage.getHighscore();
  }

  if (snake.eat(fruit)) {
    fruit.new();
  }
}

let started = false;

highscore.textContent = Storage.getHighscore();

const BASE_URL =
  "http://localhost:3905" || "https://pacific-wildwood-11143.herokuapp.com";

async function getUsers(url) {
  try {
    const res = await fetch(`${url}/users`);
    const users = await res.json();

    return users.map((user) => {
      return { name: user.name, highscore: user.highscore };
    });
  } catch (error) {
    console.error(error);
  }
}

nameForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  name = nameForm.name.value;

  const res = await fetch(`${BASE_URL}/${name}`);
  const data = await res.json();
  if (!data.success) {
    if (!name.trim() == "") {
      overlay.style.display = "none";
      nameModal.style.display = "none";
    }
  }
});

highscoreButton.addEventListener("click", async () => {
  highscoreModal.style.display = "block";
  overlay.style.display = "block";
  const users = await getUsers(BASE_URL);
  users.sort((a, b) => a.highscore - b.highscore).reverse();
  for (const user of users) {
    highscoreList.innerHTML += `<li>${user.name} - ${user.highscore}</li>`;
  }
});

window.addEventListener("keydown", (e) => {
  if (
    e.keyCode == 37 ||
    e.keyCode == 38 ||
    e.keyCode == 39 ||
    e.keyCode == 40
  ) {
    if (!started) {
      message.textContent = "";
      start();
      started = true;
    }

    const direction = e.key.replace("Arrow", "").toLowerCase();
    snake.steer(direction);
  }
});
