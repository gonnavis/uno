export enum CardColor {
  Red = 0,
  Green,
  Yellow,
  Blue,
  None,
}

export enum CardType {
  None = 0,
  Plus2,
  Reverse,
  Skip,
  Wildcard,
  Plus4,
}

export class Card {
  number = 0;
  color: CardColor = 0;
  type: CardType = 0;

  constructor(number: number, color: CardColor, type: CardType) {
    this.number = number;
    this.color = color;
    this.type = type;
  }
}
