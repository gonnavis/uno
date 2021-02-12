const path = require("path");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const uniqid = require("uniqid");

const rooms = {};

io.on("connection", (socket) => {
  console.log("connection");

  const leaveRoom = () => {
    const room = rooms[socket.roomId];
    if (!room) return;
    const index = room.players.findIndex((playerId) => playerId === socket.id);
    room.players.splice(index, 1);
    room.usernames.splice(index, 1);

    socket.leave(socket.roomId);
    io.to(socket.roomId).emit("player-disconnect", socket.id);
  };

  socket.on("disconnect", () => {
    leaveRoom();
  });

  socket.on("create-room", (username) => {
    const roomId = uniqid.time();

    socket.roomId = roomId;
    socket.roomHost = true;

    rooms[roomId] = {
      id: roomId,
      host: socket.id,
      players: [socket.id],
      usernames: [username],
    };

    socket.join(roomId);
    socket.emit("created-room", rooms[roomId]);
  });

  socket.on("join-room", ({ code, username }) => {
    const exists = io.sockets.adapter.rooms[code];

    if (exists) {
      const clients = rooms[code].players.length;
      if (clients >= 4)
        return socket.emit("join-room-response", { error: true, message: "Room is already full." });

      rooms[code].players.push(socket.id);
      rooms[code].usernames.push(username);

      socket.join(code);
      socket.roomId = code;
      io.to(socket.roomId).emit("room-data", rooms[code]);

      return socket.emit("join-room-response", { error: false, message: "Joined room." });
    } else {
      return socket.emit("join-room-response", { error: true, message: "Room does not exist." });
    }
  });

  socket.on("current-player", (id) => {
    io.to(socket.roomId).emit("current-player-update", id);
  });

  socket.on("play-card", (data) => {
    io.to(socket.roomId).emit("played-card", data);
  });

  socket.on("start-game", () => {
    io.to(socket.roomId).emit("start-the-game");
  });

  socket.on("reverse-card-played", () => {
    io.to(socket.roomId).emit("reverse-play-direction");
  });

  socket.on("plus-card-played", (data) => {
    io.to(socket.roomId).emit("give-cards", data);
  });

  socket.on("add-cards", (data) => {
    io.to(socket.roomId).emit("give-cards", data);
  });

  socket.on("has-won", (id) => {
    io.to(socket.roomId).emit("winner", id);
  });

  socket.on("leave-game", (id) => {
    leaveRoom();
  });
});

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log("Server listening on port " + port);
});
