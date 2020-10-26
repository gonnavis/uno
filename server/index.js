const path = require("path");
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const uniqid = require("uniqid");

io.on("connection", socket => {
    console.log("connection")
    socket.emit("connected", connection)

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
})

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log("Server listening on port " + port);
});