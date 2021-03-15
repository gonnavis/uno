import { v4 as uuid } from "uuid";
import { Card } from "./Card";

interface PlayerInterface {
  id: string;
  bot: boolean;
  inGame: boolean;
  gameId: string;
}
export default class Player implements PlayerInterface {
  id = "";
  bot = false;
  inGame = false;
  gameId = "";
  cards: Card[] = [];

  constructor(bot: boolean) {
    this.bot = bot;
    this.id = uuid();
  }
}
