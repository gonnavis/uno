import path from "path";
import express from "express";
import HTTP from "http";
import socketio from "socket.io";
import uniqid from "uniqid";

import setupSocket from "./socket";

const app = express();
const http = HTTP.createServer(app);
const io = socketio(http);

io.on("connection", setupSocket);

const port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log("Server listening on port " + port);
});
