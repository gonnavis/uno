import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import setupSocket from "./socket";

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: {
    origin: "https://scuffeduno.online",
    methods: ["GET", "POST"],
  },
});

io.on("connection", setupSocket);

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log("Server listening on port " + port);
});
