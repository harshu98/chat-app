const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const { generateMessage, generateLocation } = require("./utils/message");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const publicDir = path.join(__dirname, "../public");
const port = process.env.PORT || 3000;
const io = socketio(server);

app.use(express.static(publicDir));

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username: username,
      room: room,
    });
    if (error) {
      return callback(error);
    }
    socket.join(room);
    socket.emit("message", generateMessage("welcome", "Admin"));
    socket.broadcast
      .to(room)
      .emit(
        "message",
        generateMessage(username + " has joined the chat service")
      );
    io.to(room).emit("roomData", {
      room: room,
      users: getUsersInRoom(room),
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const { username, room } = getUser(socket.id);
    io.to(room).emit("message", generateMessage(message, username));
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    const { room, username } = getUser(socket.id);
    io.to(room).emit("sendloc", generateLocation(location, username));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(user.username + " has disconnected")
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("listening on port " + port);
});
