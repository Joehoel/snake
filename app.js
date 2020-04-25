const canvas = document.querySelector("canvas");
const score = document.querySelector(".score");
const highscore = document.querySelector(".highscore");
const message = document.querySelector("#start");
const overlay = document.querySelector(".overlay");

const loginModal = document.querySelector("#login-modal");
const loginForm = document.querySelector("#login-form");

const registerModal = document.querySelector("#register-modal");
const registerForm = document.querySelector("#register-form");
const registerButton = document.querySelector("#register");

const highscoreModal = document.querySelector("#highscore-modal");
const highscoreButton = document.querySelector("#highscore-button");
const highscoreList = document.querySelector("#highscore-list");

highscoreButton.addEventListener("click", async () => {
  highscoreModal.style.display = "block";
  overlay.style.display = "block";
  const users = getUsers();
  // users.sort((a, b) => a.highscore - b.highscore).reverse();
  for (const user of users) {
    highscoreList.innerHTML += `<li>${user.name} - ${user.highscore}</li>`;
  }
});

registerButton.addEventListener("click", () => {
  loginModal.style.display = "none";
  registerModal.style.display = "block";
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    // closeModals();
  } catch (e) {
    console.error(e);
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = registerForm.email.value;
  const username = registerForm.username.value;
  const password = registerForm.password.value;

  try {
    const userAuth = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);

    await userAuth.user.updateProfile({
      displayName: username,
    });
    const user = {
      username,
      highscore: 0,
      createdAt: Date.now(),
      uid: userAuth.user.uid,
      email: userAuth.user.email,
    };

    writeUserData(user);

    closeModals();
  } catch (e) {
    console.error(e.message);
  }
});
const db = firebase.firestore();

let currentUser;

firebase.auth().onAuthStateChanged(async (user) => {
  currentUser = user;
  if (currentUser) {
    closeModals();
    setTimeout(() => {
      console.log(currentUser.displayName, "logged in");
    }, 1000);
    highscore.textContent =
      Storage.getHighscore() || (await getHighscore(currentUser.uid));
  } else {
    openModal();
  }
});

async function getUsers() {
  const docRefs = await db.collection("users").get();
  const users = await docRefs.forEach((docRef) => {
    return docRef.data();
  });
  console.log(users);
}

async function getHighscore(uid) {
  const docRef = await db.collection("users").doc(uid).get();
  const highscore = await docRef.data().highscore;
  return highscore;
}

function writeUserData(user) {
  db.collection("users")
    .doc(user.uid)
    .set(user)
    .catch((error) => {
      console.log(error.message);
    });
}

async function updateHighscore(uid) {
  db.collection("users").doc(uid).update({
    highscore: Storage.getHighscore(),
  });
  highscore.textContent = Storage.getHighscore();
}

function openModal() {
  const overlay = document.querySelector(".overlay");
  overlay.style.display = "block";

  loginModal.style.display = "block";
}

function closeModals() {
  const modals = document.querySelectorAll(".modal");
  const overlay = document.querySelector(".overlay");
  overlay.style.display = "none";
  modals.forEach((modal) => {
    modal.style.display = "none";
  });
}

const ctx = canvas.getContext("2d");

const size = 600;
const framerate = 10;
const scale = 40;

canvas.width = size;
canvas.height = size;

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

  if (snake.eat(fruit)) {
    fruit.new();
  }
}

let started = false;

window.addEventListener("keydown", (e) => {
  if (!started) {
    message.textContent = "";
    start();
    started = true;
  }
  const direction = e.key.replace("Arrow", "").toLowerCase();
  snake.steer(direction);
});
