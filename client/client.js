const socket = io.connect("http://localhost:8000");
console.log(socket);

const userLoggedInNameSpan = document.getElementById("userNameSpan");
const inputText = document.getElementById("chat-input");
const formInput = document.querySelector(".chat-input");
const form = document.getElementById("chat-I-area");
const chatBox = document.querySelector(".chat-box");
const showCountOfConnectedUser = document.getElementById(
  "showCountOfConnectedUsers"
);
const typing = document.getElementById("typing");
const connected_users = document.getElementById("connected_users");

const userName = window.prompt("enter your name").toLocaleLowerCase();
if (!userName) {
  window.alert("name can't be empty");
  userName = window.prompt("enter your name").toLocaleLowerCase();
} else {
  socket.emit("new-user-joined", userName);
  userLoggedInNameSpan.innerText = `welcome ${userName}`;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = inputText.value;
  if (message != null && message.length > 0) {
    appendMessage(userName, "../images/goku.jpg", "right", message);
    socket.emit("send", message);
    inputText.value = "";
  } else {
    window.alert("message can't be empty");
  }
});
socket.on("receive", (data) => {
  const result = pickRandom();
  appendMessage(data.name, result, "left", data.message);
});
socket.on("previousMessages", (data) => {
  data.forEach((message) => {
    const result = pickRandom();
    appendMessage(message.username, result, "left", message.text);
  });
});

const BOT_IMG = [
  "../images/deadpool.jpg",
  "../images/goku.jpg",
  "../images/ironman.jpg",
  "../images/saitama.jpg",
  "../images/venom.jpg",
];
function pickRandom() {
  const res = BOT_IMG[Math.floor(Math.random() * BOT_IMG.length)];
  return res;
}

// socket.on("user-joined", (name) => {
//   appendMessage(name, result, "left", `${name} joined`);
// });

function appendMessage(name, img, side, text, date = new Date()) {
  const msgHTML = `
      <div class="msg ${side}-msg">
        <div class="msg-img" style='background-image: url(${img})'></div>
  
        <div class="msg-bubble">
          <div class="msg-info">
            <div class="msg-info-name">${name}</div>
            <div class="msg-info-time">${formatDate(date)}</div>
          </div>
  
          <div class="msg-text">${text}</div>
        </div>
      </div>
    `;

  chatBox.insertAdjacentHTML("beforeend", msgHTML);
  chatBox.scrollTop += 500;
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}

socket.on("joineduserList", (users) => {
  userListInfo = users;
  updateCurrentUserCountOnUi(users);
});

// re-render joined users list after a user left the connection
socket.on("usersListUpdated", (users) => {
  console.log("re-render", users);
  userListInfo = users;
  updateCurrentUserCountOnUi(users);
});

const updateCurrentUserCountOnUi = (users) => {
  const length = Object.keys(users).length;
  connected_users.innerHTML = "";
  showCountOfConnectedUser.innerHTML = "";
  let userCountToDisplay = ` <button
                type="button"
                class="list-group-item list-group-item active">
                connected users ${length}
              </button>`;
  // showCountOfConnectedUser.innerHTML = userCountToDisplay;
  showCountOfConnectedUser.insertAdjacentHTML("beforeend", userCountToDisplay);

  Object.values(users).forEach((user) => {
    let userNameToDisplay = ` <button
                type="button"
                class="list-group-item list-group-item-success">
               <span id="greenOnlineDot" class="mx-1"></span>
                ${user}
              </button>`;
    connected_users.insertAdjacentHTML("beforeend", userNameToDisplay);
  });

  chatBox.scrollTop += 500;
};

formInput.addEventListener("input", function () {
  socket.emit("userTyping");
});

formInput.addEventListener("change", function () {
  socket.emit("userTypingCompleted");
});

socket.on("userTypingBroadcast", (userName) => {
  typing.innerHTML = `<em>${userName} typing...</em>`;
});
socket.on("userTypingCompletedBroadcast", (userName) => {
  typing.innerHTML = "";
});
