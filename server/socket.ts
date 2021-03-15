import SocketIO from "socket.io";
import Player from "./Player";
import Room from "./Room";

const players: { [index: string]: Player } = {};
const rooms: { [index: string]: Room } = {};

export default function(socket: SocketIO.Socket) {
  const player = new Player(false);
  players[socket.id] = player;

  socket.on("disconnect", () => {
    if (player.inGame) {
      rooms[player.gameId].removePlayer(player);
    }

    delete players[socket.id];
  });
}
