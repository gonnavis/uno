import { Socket } from "socket.io";
import { Card, CardColor, CardType } from "./Card";
import Player from "./Player";
import { Room, Settings } from "./Room";

const players: { [index: string]: Player } = {};
const rooms: { [index: string]: Room } = {};
const publicRooms: { host: string; code: string; maxPlayers: number; playerCount: number }[] = [];

const validateSettings = (settings: any): Settings | false => {
  if (!settings || typeof settings !== "object") return false;

  const requiredSettings: {
    key: string;
    type: string;
  }[] = [
    { key: "maxPlayers", type: "number" },
    { key: "public", type: "boolean" },
    { key: "stacking", type: "boolean" },
    { key: "forcePlay", type: "boolean" },
    { key: "drawToPlay", type: "boolean" },
    { key: "bluffing", type: "boolean" },
  ];

  for (const rs of requiredSettings) {
    if (settings[rs.key] === undefined || typeof settings[rs.key] !== rs.type) return false;
  }

  const s = <Settings>settings;

  if (s.maxPlayers < 2 || s.maxPlayers > 4) return false;

  return s;
};

const updatePublicRoomPlayerCount = (player: Player, num: number) => {
  if (rooms[player.roomId]?.settings.public) {
    const i = publicRooms.findIndex((r) => r.code === player.roomId);
    if (i === -1) return;

    publicRooms[i].playerCount += num;

    if (publicRooms[i].playerCount === 0) {
      publicRooms.splice(i, 1);
    }
  }
};

export default function(socket: Socket) {
  const player = new Player(socket);
  players[socket.id] = player;

  const leaveRoom = () => {
    if (!player.inRoom) return;

    const room = rooms[player.roomId];
    room.removePlayer(player, false);

    if (room.isRoomEmpty) delete rooms[room.id];
  };

  socket.on("disconnect", () => {
    leaveRoom();

    delete players[socket.id];
  });

  socket.on("create-room", ({ username = "", roomCode = "", settings }) => {
    if (player.inRoom) return;

    // validate data
    if (username.length < 2 || username.length > 11) return;
    if (roomCode && (roomCode.length < 4 || roomCode.length > 12)) return;

    // validate settings
    const s = validateSettings(settings);
    if (!s) return;

    player.username = username;

    // create room
    let room;
    if (roomCode && !rooms[roomCode]) {
      room = new Room(player, s, roomCode);
    } else {
      room = new Room(player, s);
    }

    rooms[room.id] = room;

    if (room.settings.public)
      publicRooms.push({
        host: room.host.username,
        code: room.id,
        maxPlayers: room.settings.maxPlayers,
        playerCount: room.players.length,
      });
  });

  socket.on("join-room", ({ username = "", roomCode = "" }) => {
    if (player.inRoom) return;

    // validate data
    if (username.length < 2 || username.length > 11) return;
    if (roomCode.length < 4 || roomCode.length > 12) return;

    // get room
    const room = rooms[roomCode];
    if (!room || room.players.length === room.settings.maxPlayers || room.started)
      return socket.emit("kicked");

    player.username = username;
    room.addPlayer(player);

    updatePublicRoomPlayerCount(player, 1);
  });

  socket.on("add-bot", () => {
    if (!player.inRoom) return;

    const room = rooms[player.roomId];
    if (room.host.id !== player.id || room.players.length === room.settings.maxPlayers) return;

    room.addBot(room.createBot());
    room.broadcastState();

    updatePublicRoomPlayerCount(player, 1);
  });

  socket.on("kick-player", (id: string) => {
    if (!player.inRoom) return;

    const room = rooms[player.roomId];
    if (room.host.id !== player.id) return;

    const remove = room.players.find((p) => p.id === id);
    if (!remove) return;

    updatePublicRoomPlayerCount(player, -1);

    room.removePlayer(remove, false);
    remove.socket?.emit("kicked");
  });

  socket.on("leave-room", () => {
    updatePublicRoomPlayerCount(player, -1);
    leaveRoom();
  });

  socket.on("start-game", () => {
    if (!player.inRoom) return;

    const room = rooms[player.roomId];
    if (room.started || room.host.id !== player.id) return;

    room.startGame();

    if (room.settings.public)
      publicRooms.splice(
        publicRooms.findIndex((r) => r.code === room.id),
        1
      );
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
    rooms[player.roomId].broadcastState();
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

  socket.on("play-wildcard", (type: CardType) => {
    if (!player.inRoom || !(type === CardType.Plus4 || type === CardType.Wildcard)) return;

    const room = rooms[player.roomId];
    if (!room.started || room.turn.id !== player.id || player.cards.findIndex((c) => c.type === type) === -1)
      return;

    room.wildcard = new Card(-1, CardColor.None, type);
    room.broadcastState();
  });

  socket.on("get-public-rooms", () => {
    socket.emit("recieve-public-rooms", publicRooms);
  });
}
