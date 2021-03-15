import { v4 as uuid } from "uuid";
import Player from "./Player";

interface RoomInterface {
  id: string;
  host: Player | null;
  players: Player[];

  addPlayer(player: Player): void;
}

export default class Room implements RoomInterface {
  id = "";
  host: Player = new Player(false);
  players: Player[] = [];

  constructor(host: Player) {
    this.id = uuid();
    this.host = host;
    this.addPlayer(host);
  }

  addPlayer(player: Player) {
    player.inGame = true;
    player.gameId = this.id;

    this.players.push(player);
  }
}
