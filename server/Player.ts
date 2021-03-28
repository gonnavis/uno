import { Socket } from "socket.io";
import { v4 as uuid } from "uuid";
import { Card, CardType } from "./Card";
import Room from "./Room";

interface PlayerInterface {
  id: string;
  socket: Socket | null;
  bot: boolean;
  inRoom: boolean;
  roomId: string;
  cards: Card[];
  mustStack: boolean;

  findPlayableCards(topCard: Card): void;
}
export default class Player implements PlayerInterface {
  id = "";
  socket;

  username = "";
  bot = false;
  inRoom = false;
  roomId = "";
  cards: Card[] = [];
  mustStack: boolean = false;
  hasCalledUno: boolean = false;

  constructor(socket: Socket | null, bot: boolean = false) {
    this.bot = bot;
    this.id = uuid();
    this.socket = socket;
  }

  clearPlayableCards() {
    this.cards = this.cards.map((c) => {
      c.playable = false;
      return c;
    });
  }

  findPlayableCards(topCard: Card) {
    this.cards.forEach((card) => card.checkIfPlayable(topCard, this.mustStack));
  }

  botPlay(room: Room) {
    setTimeout(() => {
      if (!this.cards) return;

      while (this.cards.findIndex((c) => c.playable) === -1) {
        room.giveCards(this, 1, true);
      }
      const playableCards = this.cards.filter((c) => c.playable);

      const card = playableCards[Math.floor(Math.random() * playableCards.length)];
      if (card.type === CardType.Plus4 || card.type === CardType.Wildcard) {
        card.color = Math.floor(Math.random() * 4);
      }

      if (this.cards.length === 2 && Math.random() > 0.3) {
        this.hasCalledUno = true;
      }

      room.playCard(
        this,
        this.cards.findIndex((c) => c === card)
      );
    }, 1500);
  }
}
