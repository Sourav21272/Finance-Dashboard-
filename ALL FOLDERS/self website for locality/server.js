const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/groupchat", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Real-time Communication
io.on("connection", socket => {
  console.log("🟢 New user connected");
  socket.on("chatMessage", msg => {
    io.emit("message", msg); // broadcast message
  });
  socket.on("disconnect", () => console.log("🔴 User disconnected"));
});

// Start server
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
