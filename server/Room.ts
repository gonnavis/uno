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
  winner: Player | null;

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
  winner: Player | null = null;

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
    this.broadcastState();
  }

  removePlayer(player: Player) {
    // create replacement bot
    const bot = this.createBot(player);
    this.addBot(bot, player);

    player.roomId = "";
    player.inRoom = false;
    player.cards = [];

    this.broadcastState();
  }

  startGame() {
    this.deck.generateDeck();
    this.deck.shuffleDeck();

    // place starting card on pile
    this.pile.push(this.deck.pickCard());
    if (this.topCard().type === CardType.Plus4 || this.topCard().type === CardType.Wildcard) {
      this.topCard().color = Math.floor(Math.random() * 4);
    }

    // give players cards
    this.players.forEach((p) => {
      this.giveCards(p, 7);
    });

    // pick player to start
    const randIndex = Math.floor(Math.random() * this.players.length);
    this.turn = this.players[randIndex];
    this.turn.findPlayableCards(this.topCard());

    this.started = true;

    this.broadcastState();
  }

  giveCards(player: Player, amount: number, broadcastState: boolean = false) {
    for (let i = 0; i < amount; i++) {
      if (this.deck.cards.length === 0) {
        this.refillDeckFromPile();
      }

      player.cards.push(this.deck.pickCard());
    }

    if (this.turn.id === player.id && this.started) {
      player.findPlayableCards(this.topCard());
    }

    if (broadcastState) {
      this.broadcastState();
    }
  }

  playCard(player: Player, cardIndex: number) {
    if (!player.cards[cardIndex] || this.turn.id !== player.id || !player.cards[cardIndex].playable) return;

    // get card and remove from players cards
    const card = player.cards[cardIndex];
    player.cards.splice(cardIndex, 1);

    // put card on pile
    this.pile.push(card);

    const nextPlayer = this.getNextPlayer();

    switch (card.type) {
      case CardType.Plus2:
        if (nextPlayer.cards.findIndex((c) => c.type === CardType.Plus2) !== -1) {
          nextPlayer.mustStack = true;
          this.stack += 2;
        } else {
          this.giveCards(nextPlayer, this.stack + 2);
          this.clearStack();
        }
        break;
      case CardType.Plus4:
        if (nextPlayer.cards.findIndex((c) => c.type === CardType.Plus4) !== -1) {
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

    // punish player for not calling uno
    if (player.cards.length === 2 && !player.hasCalledUno) {
      this.giveCards(player, 2);
    }
    player.hasCalledUno = false;

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
    this.turn.clearPlayableCards();
    this.turn = skip ? this.getNextPlayer(1) : this.getNextPlayer();

    this.turn.findPlayableCards(this.topCard());
    this.checkForWinner();
    this.broadcastState();
  }

  getNextPlayer(offset: number = 0): Player {
    let i = this.players.findIndex((p) => p.id === this.turn.id);

    if (this.directionReversed) {
      i -= 1 - offset;
      if (i < 0) i = this.players.length - 1 - offset;
    } else {
      i += 1 + offset;
      if (i > this.players.length - 1) i = 0 + offset;
    }

    return this.players[i];
  }

  checkForWinner() {
    this.players.forEach((p) => (p.cards.length === 0 ? (this.winner = p) : null));
  }

  refillDeckFromPile() {
    const cards = this.pile.splice(0, this.pile.length - 1);
    this.deck.cards.push(...cards);
    this.deck.shuffleDeck();
  }

  // gets the player who is in the seat offset number of positions clockwise from the given player
  getPlayerPosFromOffset(player: Player, offset: number) {
    const playerIndex = this.players.findIndex((p) => p.id === player.id);
    let newIndex = playerIndex + offset;
    newIndex > this.players.length - 1 ? (newIndex -= this.players.length) : null;

    return this.players[newIndex];
  }

  broadcastState() {
    this.players.forEach((player) => {
      if (player.bot) return;

      let right;
      let top;
      let left;
      switch (this.players.length) {
        case 4:
          left = this.getPlayerPosFromOffset(player, 3);
        case 3:
          top = this.getPlayerPosFromOffset(player, 2);
        case 2:
          right = this.getPlayerPosFromOffset(player, 1);
          break;
      }

      const winner = this.winner ? { username: this.winner.username, id: this.winner.id } : undefined;

      const state = {
        id: this.id,
        isHost: this.host.id === player.id,
        turn: this.turn.id,
        pile: this.pile,
        started: this.started,
        directionReversed: this.directionReversed,
        stack: this.stack,
        playerCount: this.players.length,
        you: {
          ...player,
          count: player.cards.length,
          socket: undefined,
        },
        right: right
          ? {
              username: right.username,
              count: right.cards.length,
              id: right.id,
              isBot: right.bot,
            }
          : undefined,
        top: top
          ? {
              username: top.username,
              count: top.cards.length,
              id: top.id,
              isBot: top.bot,
            }
          : undefined,
        left: left
          ? {
              username: left.username,
              count: left.cards.length,
              id: left.id,
              isBot: left.bot,
            }
          : undefined,
        winner,
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

  topCard(): Card {
    return this.pile[this.pile.length - 1];
  }
}
