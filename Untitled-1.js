 < !DOCTYPE html >
     <
     html >
     <
     head >
     <
     title > Group Chat < /title> <
     script src = "/socket.io/socket.io.js" > < /script> <
     /head> <
     body >
     <
     div id = "messages" > < /div> <
     input id = "user"
 placeholder = "Your name" / >
     <
     input id = "message"
 placeholder = "Type a message" / >
     <
     button onclick = "sendMessage()" > Send < /button> <
     script >
     const socket = io();
 const messagesDiv = document.getElementById('messages');
 const userInput = document.getElementById('user');
 const messageInput = document.getElementById('message');
 socket.on('historicalMessages', (msgs) => {
     msgs.forEach(msg => addMessage(msg));
 });
 socket.on('message', (msg) => {
     addMessage(msg);
 });
 socket.on('error', (err) => {
     alert(err); // Or display in UI
 });

 function addMessage(msg) {
     const p = document.createElement('p');
     p.textContent = `${msg.user}: ${msg.message} (${new Date(msg.timestamp).toLocaleTimeString()})`;

     function sendMessage() {
         const user = userInput.value || 'Anonymous';
         const message = messageInput.value;
         if (message) {
             socket.emit('chatMessage', {
                 user,
                 message
             });
             messageInput.value = '';
         }
     }
     messageInput.addEventListener('keypress', (e) => {
         if (e.key === 'Enter') sendMessage();
     }); <
     /script> <
     /body> <
     /html>