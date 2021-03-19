import { Socket } from "socket.io";
import { CardColor, CardType } from "./Card";
import Player from "./Player";
import Room from "./Room";

const players: { [index: string]: Player } = {};
const rooms: { [index: string]: Room } = {};

export default function(socket: Socket) {
  const player = new Player(socket);
  players[socket.id] = player;

  const leaveRoom = () => {
    if (player.inRoom) {
      rooms[player.roomId].removePlayer(player);
    }

    let playerCount = 0;

    if (!rooms[player.roomId]) return;
    rooms[player.roomId].players.forEach((p) => (!p.bot ? playerCount++ : null));

    if (playerCount === 0) {
      delete rooms[player.roomId];
    }
  };

  socket.on("disconnect", () => {
    leaveRoom();

    delete players[socket.id];
  });

  socket.on("create-room", (username: string) => {
    if (player.inRoom) return;

    player.username = username;

    // create room
    const room = new Room(player);
    rooms[room.id] = room;
  });

  socket.on("join-room", ({ roomId = "", username = "" }) => {
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
    leaveRoom();
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

  socket.on("play-card", (index: number, color: number) => {
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
