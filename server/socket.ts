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
    if (!player.inRoom) return;

    const room = rooms[player.roomId];
    room.removePlayer(player);

    if (room.isRoomEmpty) delete rooms[room.id];
  };

  socket.on("disconnect", () => {
    leaveRoom();

    delete players[socket.id];
  });

  socket.on("create-room", ({ username = "", roomCode = "", maxPlayers = "4" }) => {
    if (player.inRoom) return;

    // validate data
    if (username.length < 2 || username.length > 11) return;
    if (roomCode && (roomCode.length < 4 || roomCode.length > 12)) return;

    const maxPlayersNum = Number(maxPlayers);
    if (maxPlayersNum < 2 || maxPlayersNum > 4) return;

    player.username = username;

    // create room
    let room;
    if (roomCode && !rooms[roomCode]) {
      room = new Room(player, roomCode);
    } else {
      room = new Room(player);
    }

    room.maxPlayers = maxPlayersNum;

    rooms[room.id] = room;
  });

  socket.on("join-room", ({ username = "", roomCode = "" }) => {
    if (player.inRoom) return;

    // validate data
    if (username.length < 2 || username.length > 11) return;
    if (roomCode.length < 4 || roomCode.length > 12) return;

    // get room
    const room = rooms[roomCode];
    if (!room || room.players.length === room.maxPlayers || room.started) return;

    player.username = username;
    room.addPlayer(player);
  });

  socket.on("add-bot", () => {
    if (!player.inRoom) return;

    const room = rooms[player.roomId];
    if (room.host.id !== player.id || room.players.length === room.maxPlayers) return;

    room.addBot(room.createBot());
    room.broadcastState();
  });

  socket.on("kick-player", (id: string) => {
    if (!player.inRoom) return;

    const room = rooms[player.roomId];
    if (room.host.id !== player.id) return;

    const remove = room.players.find((p) => p.id === id);
    if (!remove) return;

    room.removePlayer(remove, false);
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
    if (!player.inRoom || rooms[player.roomId].turn.id !== player.id || !player.canDraw) return;

    const room = rooms[player.roomId];

    room.drawCards(player);
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
