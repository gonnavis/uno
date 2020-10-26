const path = require("path");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const uniqid = require("uniqid");

io.on("connection", socket => {
    console.log("connection")

    socket.on("disconnect", () => {
      console.log("disconnection")
    });

   socket.on("create-room", () => {
    const roomId = uniqid.time(); 

    socket.roomId = roomId;
    socket.roomHost = true;

    socket.join(roomId);
    socket.emit("created-room", roomId)
   })
   
  socket.on("join-room", code => {
    const exists = io.sockets.adapter.rooms[code];
    
    if (exists) {
      const clients = Object.keys(io.nsps["/"].adapter.rooms[code]).length;
      if (clients >= 4) return socket.emit("join-room-response", { error: true, message: "Room is already full." });

      socket.join(code);
      return socket.emit("join-room-response", { error: false, message: "Joined room." });
    } else {
      return socket.emit("join-room-response", { error: true, message: "Room does not exist." })
    }
  })
})

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log("Server listening on port " + port);
});