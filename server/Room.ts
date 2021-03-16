import { hostname } from "node:os";
import { v4 as uuid } from "uuid";
import { Card, CardType } from "./Card";
import Deck from "./Deck";
import Player from "./Player";

interface RoomInterface {
  id: string;
  host: Player | null;
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
  host: Player = new Player(false);
  players: Player[] = [];
  deck: Deck = new Deck();
  pile: Card[] = [];
  turn: Player = this.host;
  directionReversed: boolean = false;
  stack: number = 0;

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

  removePlayer(player: Player) {
    player.gameId = "";
    player.inGame = false;
    player.cards = [];

    this.players = this.players.filter((p) => p.id !== player.id);
  }

  startGame() {
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
    let canStack = false;

    switch (card.type) {
      case CardType.Plus2:
        if (nextPlayer.cards.filter((card) => card.type === CardType.Plus2)) {
          this.stack += 2;
          canStack = true;
        } else {
          this.giveCards(nextPlayer, this.stack + 2);
          this.stack = 0;
        }
        break;
      case CardType.Plus4:
        if (nextPlayer.cards.filter((card) => card.type === CardType.Plus4)) {
          this.stack += 4;
          canStack = true;
        } else {
          this.giveCards(nextPlayer, this.stack + 4);
          this.stack = 0;
        }
        break;
      case CardType.Reverse:
        this.directionReversed = !this.directionReversed;
        break;
    }

    // go to next turn
    if (
      ((card.type === CardType.Plus2 || card.type === CardType.Plus4) && !canStack) ||
      card.type === CardType.Skip
    ) {
      this.nextTurn(true);
    } else {
      this.nextTurn();
    }
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
}
