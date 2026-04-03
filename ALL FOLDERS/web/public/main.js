const socket = io();
const loginDiv = document.getElementById('login');
const chatDiv = document.getElementById('chat');
const usernameInput = document.getElementById('username');
const joinBtn = document.getElementById('joinBtn');
const errorDiv = document.getElementById('error');
const usersDiv = document.getElementById('users');
const messagesDiv = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');

let myName = '';

joinBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) return;
    myName = name;
    socket.emit('join', name);
};

socket.on('full', (msg) => {
    errorDiv.textContent = msg;
});

socket.on('userlist', (users) => {
    if (myName && !chatDiv.style.display) {
        loginDiv.style.display = 'none';
        chatDiv.style.display = '';
    }
    usersDiv.textContent = 'Users: ' + users.join(', ');
});

sendBtn.onclick = () => {
    const text = msgInput.value.trim();
    if (!text) return;
    socket.emit('message', { user: myName, text });
    msgInput.value = '';
};

socket.on('message', (msg) => {
    const div = document.createElement('div');
    div.className = msg.user === myName ? 'me' : '';
    div.textContent = `${msg.user}: ${msg.text}`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
