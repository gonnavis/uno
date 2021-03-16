import { Socket } from "node:dgram";
import { createReadStream } from "node:fs";
import { hostname } from "node:os";
import { isObject } from "node:util";
import SocketIO from "socket.io";
import { v4 as uuid } from "uuid";
import { Card, CardType } from "./Card";
import Deck from "./Deck";
import Player from "./Player";
import socket from "./socket";

interface RoomInterface {
  id: string;
  started: boolean;
  host: Player;
  players: Player[];
  deck: Deck;
  pile: Card[];
  turn: Player;
  directionReversed: boolean;
  stack: number;

  addPlayer(player: Player): void;
  removePlayer(player: Player): void;
  startGame(): void;
  giveCards(player: Player, amount: number): void;
  playCard(player: Player, cardIndex: number): void;
  getNextPlayer(): Player;
  refillDeckFromPile(): void;
}

export default class Room implements RoomInterface {
  id = "";
  started: boolean = false;
  host: Player;
  players: Player[] = [];
  deck: Deck = new Deck();
  pile: Card[] = [];
  turn: Player;
  directionReversed: boolean = false;
  stack: number = 0;

  constructor(host: Player) {
    this.id = uuid().substr(0, 7);
    this.host = host;
    this.turn = host;
    this.addPlayer(host);
  }

  addPlayer(player: Player) {
    player.roomId = this.id;
    player.inRoom = true;

    this.players.push(player);
  }

  removePlayer(player: Player) {
    // create replacement bot
    const bot = this.createBot(player);
    this.addBot(bot, player);

    player.roomId = "";
    player.inRoom = false;
    player.cards = [];
  }

  startGame() {
    this.started = true;
    this.deck.generateDeck();
    this.deck.shuffleDeck();

    // give players cards
    this.players.forEach((p) => {
      this.giveCards(p, 7);
    });

    // place starting card on pile
    this.pile.push(this.deck.pickCard());

    // pick player to start
    const randIndex = Math.floor(Math.random() * this.players.length);
    this.turn = this.players[randIndex];
  }

  giveCards(player: Player, amount: number) {
    for (let i = 0; i < amount; i++) {
      if (this.deck.cards.length === 0) {
        this.refillDeckFromPile();
      }

      player.cards.push(this.deck.pickCard());
    }
  }

  playCard(player: Player, cardIndex: number) {
    if (cardIndex < 0 || cardIndex > player.cards.length - 1 || this.turn.id !== player.id) return;

    // get card and remove from players cards
    const card = player.cards[cardIndex];
    player.cards.splice(cardIndex, 1);

    // put card on pile
    this.pile.push(card);

    const nextPlayer = this.getNextPlayer();

    switch (card.type) {
      case CardType.Plus2:
        if (nextPlayer.cards.filter((card) => card.type === CardType.Plus2)) {
          nextPlayer.mustStack = true;
          this.stack += 2;
        } else {
          this.giveCards(nextPlayer, this.stack + 2);
          this.clearStack();
        }
        break;
      case CardType.Plus4:
        if (nextPlayer.cards.filter((card) => card.type === CardType.Plus4)) {
          nextPlayer.mustStack = true;
          this.stack += 4;
        } else {
          this.giveCards(nextPlayer, this.stack + 4);
          this.clearStack();
        }
        break;
      case CardType.Reverse:
        this.directionReversed = !this.directionReversed;
        break;
    }

    // go to next turn
    if (
      ((card.type === CardType.Plus2 || card.type === CardType.Plus4) && !nextPlayer.mustStack) ||
      card.type === CardType.Skip
    ) {
      this.nextTurn(true);
    } else {
      this.nextTurn();
    }
  }

  clearStack() {
    this.stack = 0;
    this.players.forEach((p) => (p.mustStack = false));
  }

  nextTurn(skip: boolean = false) {
    if (skip) {
      this.turn = this.getNextPlayer(1);
    } else {
      this.turn = this.getNextPlayer();
    }
  }

  getNextPlayer(offset: number = 0): Player {
    let i = this.players.findIndex((p) => p.id === this.turn.id);

    if (this.directionReversed) {
      i--;
      if (i < 0) i = this.players.length - 1 - offset;
    } else {
      i++;
      if (i > this.players.length - 1) i = 0 + offset;
    }

    return this.players[i];
  }

  refillDeckFromPile() {
    const cards = this.pile.splice(0, this.pile.length - 1);
    this.deck.cards.push(...cards);
    this.deck.shuffleDeck();
  }

  broadcastState() {
    this.players.forEach((player) => {
      if (player.bot) return;

      const state = {
        isHost: this.host.id === player.id,
        turn: this.turn,
        pile: this.pile,
        started: this.started,
        directionReversed: this.directionReversed,
        stack: this.stack,
        you: player,
        others: this.players.map((p) => {
          return {
            username: p.username,
            count: p.cards.length,
            id: p.id,
            isBot: p.bot,
          };
        }),
      };

      player.socket?.emit("state", state);
    });
  }

  createBot(player?: Player): Player {
    const bot = new Player(null, true);
    bot.inRoom = true;
    bot.roomId = this.id;
    if (player) bot.cards = player.cards;

    return bot;
  }

  addBot(bot: Player, player?: Player) {
    if (player) {
      const index = this.players.findIndex((p) => p.id === player.id);
      this.players[index] = bot;

      if (this.turn.id === player.id) {
        this.turn = bot;
        // TODO implement bot playing logic
      }
    } else {
      if (this.players.length === 4) return;

      this.players.push(bot);
    }
  }
}
