import { Socket } from "socket.io";
import { v4 as uuid } from "uuid";
import { Card, CardColor, CardType } from "./Card";
import { Room } from "./Room";

interface PlayerInterface {
  id: string;
  socket: Socket | null;
  bot: boolean;
  inRoom: boolean;
  roomId: string;
  cards: Card[];
  mustStack: boolean;
  hasCalledUno: boolean;
  lastDrawnCard: number;
  canDraw: boolean;
  drawing: boolean;
  canPlay: boolean;

  sortCards(): void;
  findPlayableCards(topCard: Card): void;
  clearPlayableCards(): void;
  botPlay(room: Room): void;
}
export default class Player implements PlayerInterface {
  id = "";
  socket;

  username = "";
  bot = false;
  inRoom = false;
  roomId = "";
  cards: Card[] = [];
  mustStack = false;
  hasCalledUno = false;
  lastDrawnCard = -1;
  canDraw = false;
  drawing = false;
  canPlay = false;

  constructor(socket: Socket | null, bot: boolean = false) {
    this.bot = bot;
    this.id = uuid();
    this.socket = socket;
  }

  sortCards() {
    // order - red, green, blue, yellow, wildcard, plus4
    // - number 0 - 9, reverse, skip, plus2

    const cardColors: { [index: string]: Card[] } = {
      Red: [],
      Green: [],
      Blue: [],
      Yellow: [],
      Wildcard: [],
      Plus4: [],
    };

    const newCards: Card[] = [];
    Object.keys(cardColors).forEach((s: string) => {
      const color: CardColor = CardColor[s as keyof typeof CardColor];

      this.cards.forEach((c) => {
        if (c && (c.color === color || c.type === CardType[s as keyof typeof CardType]))
          cardColors[s].push(c);
      });

      // sort number cards
      cardColors[s].sort((c1, c2) => c1.number - c2.number);

      // sort reverse, skip, plus2
      const specialCards = cardColors[s].filter((c) => c.type !== CardType.None);
      specialCards.sort((c1, c2) => c2.type - c1.type);

      // remove special cards from array
      cardColors[s] = cardColors[s].filter((c) => c.type === CardType.None);

      // put special cards at the end
      cardColors[s].push(...specialCards);

      // merge into total cards
      newCards.push(...cardColors[s]);
    });

    this.cards = newCards;
  }

  clearPlayableCards() {
    this.cards = this.cards.map((c) => {
      c.playable = false;
      return c;
    });
  }

  findPlayableCards(topCard: Card) {
    this.cards.forEach((card) => (card ? card.checkIfPlayable(topCard, this.mustStack) : null));
  }

  botPlay(room: Room) {
    setTimeout(async () => {
      if (!this.cards) return;
      if (this.cards.findIndex((c) => c.playable) === -1) await room.drawCards(this);

      const playableCards = this.cards.filter((c) => c.playable);
      if (room.turn.id !== this.id || playableCards.length === 0) return;

      const card = playableCards[Math.floor(Math.random() * playableCards.length)];
      if (card && (card.type === CardType.Plus4 || card.type === CardType.Wildcard)) {
        room.wildcard = card;
        room.broadcastState();
        await sleep(2000);
        card.color = Math.floor(Math.random() * 4);
      }

      if (this.cards.length === 2 && Math.random() > 0.3) {
        this.hasCalledUno = true;
        room.broadcastState();
      }

      room.playCard(
        this,
        this.cards.findIndex((c) => c === card)
      );
    }, 1500);
  }
}

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
