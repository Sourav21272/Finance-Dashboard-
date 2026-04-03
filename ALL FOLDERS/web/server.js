const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    if (users.length >= 10) {
        socket.emit('full', 'Chat room is full (max 10 users)');
        socket.disconnect();
        return;
    }

    socket.on('join', (username) => {
        users.push({ id: socket.id, name: username });
        io.emit('userlist', users.map(u => u.name));
    });

    socket.on('message', (msg) => {
        io.emit('message', msg);
    });

    socket.on('disconnect', () => {
        users = users.filter(u => u.id !== socket.id);
        io.emit('userlist', users.map(u => u.name));
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
