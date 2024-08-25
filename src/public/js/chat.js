//src/public/js/chat.js

const socket = io();
const chatBox = document.getElementById("chatBox");
const sendButton = document.getElementById("sendButton");

// Capturar el nombre de usuario desde el DOM
const userLogin = document.getElementById("userLogin").innerText.trim();

// Añadir un console.log para verificar el nombre de usuario capturado
console.log("Usuario que envía el mensaje:", userLogin);

// Evento para enviar mensaje al presionar Enter
chatBox.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Evento para enviar mensaje
sendButton.addEventListener("click", () => {
    if (chatBox.value.trim().length > 0) {
        socket.emit("message", { user: userLogin, message: chatBox.value });
        chatBox.value = "";
    }
});

function sendMessage() {
    // Verificar que el campo de chat no esté vacío
    if (userLogin !== "" && chatBox.value.trim().length > 0) {
        socket.emit("message", { user: userLogin, message: chatBox.value });
        chatBox.value = "";
    }
}

// Recibir mensajes y renderizarlos
socket.on("messagesLogs", (data) => {
    const log = document.getElementById("messagesLogs");
    let messages = "";
    data.forEach((message) => {
        messages += `${message.user}: ${message.message} <br>`;
    });
    log.innerHTML = messages;
});

// Detectar conexión al servidor WebSocket
socket.on('connect', () => {
    console.log('Conectado al servidor de WebSocket');
});







