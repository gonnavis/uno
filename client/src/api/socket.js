import store from "@/store";
import io from "socket.io-client";
const SERVER_URL =
  process.env.NODE_ENV === "development"
    ? `http://${window.location.hostname}:3000`
    : "https://uno-freddie.herokuapp.com/";

const socket = io(SERVER_URL);
store.commit("SET_SOCKET", socket);

socket.on("connect", () => console.log("[SocketIO]: Connected!"));

socket.on("state", (room) => store.commit("SET_ROOM", room));
