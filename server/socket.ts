import SocketIO from "socket.io";
import { CardColor, CardType } from "./Card";
import Player from "./Player";
import Room from "./Room";

const players: { [index: string]: Player } = {};
const rooms: { [index: string]: Room } = {};

export default function(socket: SocketIO.Socket) {
  const player = new Player(socket);
  players[socket.id] = player;

  socket.on("disconnect", () => {
    if (player.inRoom) {
      rooms[player.roomId].removePlayer(player);
    }

    delete players[socket.id];
  });

  socket.on("create-room", (username) => {
    if (player.inRoom) return;

    player.username = username;

    // create room
    const room = new Room(player);
    rooms[room.id] = room;
  });

  socket.on("join-room", ({ roomId, username }) => {
    if (roomId.length !== 7) return;

    // get room
    const room = rooms[roomId];
    if (!room || room.players.length === 4 || room.started) return;

    const player = players[socket.id];
    if (player.inRoom) return;

    player.username = username;
    room.addPlayer(player);
  });

  socket.on("leave-room", () => {
    if (!player.inRoom) return;

    rooms[player.roomId].removePlayer(player);
  });

  socket.on("start-game", () => {
    if (!player.inRoom) return;

    const room = rooms[player.roomId];
    if (room.started || room.host.id !== player.id) return;

    room.startGame();
  });

  socket.on("call-uno", () => {
    if (
      !player.inRoom ||
      !rooms[player.roomId].started ||
      rooms[player.roomId].turn.id !== player.id ||
      player.cards.length !== 2
    )
      return;

    player.hasCalledUno = true;
  });

  socket.on("draw-card", () => {
    if (!player.inRoom || rooms[player.roomId].turn.id !== player.id) return;

    const room = rooms[player.roomId];

    room.giveCards(player, 1, true);
    room.broadcastState();
  });

  socket.on("play-card", (index, color) => {
    if (!player.inRoom) return;

    const room = rooms[player.roomId];
    if (!room.started || room.turn.id !== player.id || !player.cards[index]) return;

    const card = player.cards[index];
    if (card.type === CardType.Plus4 || card.type === CardType.Wildcard) {
      if (color !== undefined && color >= CardColor.Red && color <= CardColor.Blue) {
        card.color = color;
      } else {
        return;
      }
    }

    room.playCard(player, index);
  });
}
