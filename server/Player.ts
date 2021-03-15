import { v4 as uuid } from "uuid";

export default class Player {
  id: string = "";
  bot = false;

  constructor(bot: boolean) {
    this.bot = bot;
    this.id = uuid();
  }
}
