var socket = io();

function toastMessage(message) {
  Toastify({
    text: message,
    duration: 3000,
  }).showToast();
}
function setUsername() {
  const modal_set_username = document.getElementById("modal-set-username");
  const modal_set_username_bs = new bootstrap.Modal(modal_set_username, {
    keyboard: false,
    backdrop: "static",
    focus: true,
  });
  modal_set_username_bs.show();
}

function saveUsername() {
  const username = document.getElementById("username").value;
  if (username) {
    localStorage.setItem("username", username);

    if (localStorage.getItem("id")) {
      // notify to server
      socket.emit(
        "updateUser",
        JSON.stringify({
          username: username,
          id: localStorage.getItem("id"),
          created_at: Date(),
          status: "update-user",
        })
      );

      window.location.reload();
    } else {
      // generate random id
      const randomId = Math.floor(Math.random() * 1000000);
      localStorage.setItem("id", randomId);

      // notify to server
      socket.emit(
        "newUser",
        JSON.stringify({
          username: username,
          id: randomId,
          created_at: Date(),
          status: "new-user",
        })
      );

      window.location.reload();
    }

    const modal_set_username = document.getElementById("modal-set-username");
    const modal_set_username_bs =
      bootstrap.Modal.getInstance(modal_set_username);
    modal_set_username_bs.hide();
  } else {
    document.getElementById("username").classList.add("is-invalid");
    const span = document.createElement("span");
    span.classList.add("invalid-feedback");
    span.innerText = "Username is required";
    document.getElementById("username").parentElement.appendChild(span);
  }
}

function checkUsername() {
  const username = localStorage.getItem("username");
  if (!username) {
    setUsername();
  }
}

function setHeadingUsername() {
  const username = localStorage.getItem("username");
  document.getElementById("name_user").innerText = username;
  document.getElementById("name_user").style.color = "white";
  const username_chat = document.getElementsByClassName("username_chat");
  for (let i = 0; i < username_chat.length; i++) {
    username_chat[i].innerText = `${username} (You)`;
  }
}

function deleteAccount() {
  const username = localStorage.getItem("username");
  const id = localStorage.getItem("id");
  // notify to server
  socket.emit("deleteUser", JSON.stringify({ username: username, id: id }));

  // clear localStorage
  localStorage.clear();

  // reload page
  window.location.reload();
}

function sendMessage() {
  // get element textarea from id "text_message"
  const text_message = document.getElementById("text_message");

  // check if text_message is empty
  if (text_message.value === "") {
    // add is-invalid class to text_message
    text_message.classList.add("is-invalid");
    // add span element with class invalid-feedback
    const span = document.createElement("span");
    span.classList.add("invalid-feedback");
    span.innerText = "Message is required";
    text_message.parentElement.appendChild(span);
    return;
  }

  // get value from text_message
  const message = text_message.value;
  const created_at = Date();
  const data = {
    message: message,
    username: localStorage.getItem("username"),
    id: localStorage.getItem("id"),
    created_at: created_at,
  };

  // send message to server
  socket.emit("newMessage", JSON.stringify(data));

  // clear text_message
  text_message.value = "";

  // remove is-invalid class from text_message
  text_message.classList.remove("is-invalid");

  // remove span element with class invalid-feedback
  const span =
    text_message.parentElement.getElementsByClassName("invalid-feedback")[0];
  if (span) {
    text_message.parentElement.removeChild(span);
  }
}

function addMessageBoxFromSender(message, created_at) {
  // get template from class "message_from_sender". then change innerText with message in class "card-text"
  const template = document.getElementsByClassName("message_from_sender")[0];
  template.getElementsByClassName("card-text")[0].innerText = message;

  // change created_at in class "created_at"
  template.getElementsByClassName("created_at")[0].innerText = created_at;

  // clone template
  const clone = template.cloneNode(true);

  // remove class "d-none" from clone
  clone.classList.remove("d-none");

  // append clone to id "messages_content"
  document.getElementById("messages_content").appendChild(clone);

  scrollToBottom();
}

function addMessageBoxFromOther(message, username, created_at) {
  // get template from class "message_from_other". then change innerText with message in class "card-text"
  const template = document.getElementsByClassName("message_from_other")[0];
  template.getElementsByClassName("card-text")[0].innerText = message;

  // change username in class "username_of_other"
  template.getElementsByClassName("username_of_other")[0].innerText = username;

  // change created_at in class "created_at"
  template.getElementsByClassName("created_at")[0].innerText = created_at;

  // clone template
  const clone = template.cloneNode(true);

  // remove class "d-none" from clone
  clone.classList.remove("d-none");

  // append clone to id "messages_content"
  document.getElementById("messages_content").appendChild(clone);

  scrollToBottom();
}

function getAllMessages() {
  const username = localStorage.getItem("username");
  const id = localStorage.getItem("id");
  // get all messages from server
  socket.emit("getAllMessages", JSON.stringify({ id: id, username: username }));
}

function scrollToBottom() {
  const messages_content = document.getElementsByClassName("overflow-auto")[0];
  messages_content.scroll({
    top: messages_content.scrollHeight,
    behavior: "smooth",
  });
}

// add event listener for typing message in textarea
document.getElementById("text_message").addEventListener("keyup", function () {
  // send status typing to server
  socket.emit(
    "typing",
    JSON.stringify({
      username: localStorage.getItem("username"),
      typing: true,
      id: localStorage.getItem("id"),
    })
  );
});

// add event listener for stop typing message in textarea
document.getElementById("text_message").addEventListener("blur", function () {
  // send status typing to server
  socket.emit(
    "typing",
    JSON.stringify({
      username: localStorage.getItem("username"),
      typing: false,
      id: localStorage.getItem("id"),
    })
  );
});

socket.on("connect", function () {
  toastMessage("Connected to server");
  // if user has username, send to server
  const username = localStorage.getItem("username");
  const id = localStorage.getItem("id");

  getAllMessages();
  if (username) {
    socket.emit(
      "newUser",
      JSON.stringify({
        username: username,
        id: id,
        status: "online",
        created_at: Date(),
      })
    );
  } else {
    setUsername();
  }
});

socket.on("disconnect", function () {
  toastMessage("Disconnected from server");
});

socket.on("newMessage", function (data) {
  const decodedJson = JSON.parse(data);
  console.log(decodedJson);
  const senderUsername = decodedJson.username;
  const senderId = decodedJson.id;
  const messageContent = decodedJson.message;
  const created_at = decodedJson.created_at;

  if (senderId === localStorage.getItem("id")) {
    addMessageBoxFromSender(messageContent, created_at);
    return;
  }
  addMessageBoxFromOther(messageContent, senderUsername, created_at);
});

socket.on("getAllMessages", function (data) {
  const decodedJson = JSON.parse(data);
  const messages = decodedJson;

  // sort messages by created_at
  messages.sort(function (a, b) {
    return new Date(a.created_at) - new Date(b.created_at);
  });

  // get all messages from server
  messages.forEach((message) => {
    console.log(message);
    const senderUsername = message.username;
    const messageContent = message.message;
    const senderId = message.user_id;
    const created_at = message.created_at;

    // check if sender is user
    if (senderId === localStorage.getItem("id")) {
      addMessageBoxFromSender(messageContent, created_at);
      return;
    }

    // add message to message box
    addMessageBoxFromOther(messageContent, senderUsername, created_at);
  });

  // scroll to bottom
  scrollToBottom();
});

socket.on("typing", function (data) {
  const decodedJson = JSON.parse(data);
  const username = decodedJson.username;
  const typing = decodedJson.typing;
  const statusTyping = document.getElementById("status_typing");

  if (typing) {
    statusTyping.innerText = `${username} is typing...`;
  } else {
    statusTyping.innerText = "";
  }
});
// real time check username
checkUsername();
setHeadingUsername();
setInterval(() => {
  const username = localStorage.getItem("username");
  const id = localStorage.getItem("id");
  if (username) {
    setHeadingUsername();
  }

  if (!id) {
    const randomId = Math.floor(Math.random() * 1000000);
    localStorage.setItem("id", randomId);
  }
}, 1000);
