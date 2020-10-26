<template>
  <div class="game">
    <div class="color-picker">
    </div>
    <div class="pile">
      <Card  
        v-for="(card) in pile" 
        :key="card.id" 
        :color="card.color" 
        :number="card.number" 
        :offsetX="card.offsetX"
        :offsetY="card.offsetY"
        :pileRotate="card.rotate"
        :pile="true" 
      />
    </div>
    <div class="direction" :class="{ reverse: !playDirectionReverse }"></div>
    <div class="cards you">
      <Card 
        v-for="(card, i) in cards" 
        :key="card.id" 
        :color="card.color" 
        :number="card.number" 
        :style="{ zIndex: i }" 
        :length="cards.length" 
        :index="i"
        :hidden="card.hidden || false"
        :playable="card.playable || false"
        @clicked="cardClicked"
      />
    </div>
    <div class="cards other right">
      <Card 
        v-for="i in right.count" 
        :key="i" 
        :color="'plus4'" 
        :number="6" 
        :style="{ zIndex: i }" 
        :length="8" 
        :index="i"
        @clicked="cardClicked"
        :other="true"
      />
    </div>
    <div class="cards other left">
      <Card 
        v-for="i in left.count" 
        :key="i" 
        :color="'plus4'" 
        :number="6" 
        :style="{ zIndex: i }" 
        :length="8" 
        :index="i"
        @clicked="cardClicked"
        :other="true"
        :left="true"
      />
    </div>

    <div class="cards other top">
      <Card 
        v-for="i in top.count" 
        :key="i" 
        :color="'plus4'" 
        :number="6" 
        :style="{ zIndex: i }" 
        :length="8" 
        :index="i"
        @clicked="cardClicked"
        :other="true"
        :top="true"
      />
    </div>
    <div class="stack" @click="canDraw ? addCard() : null">
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" ref="topCard" :forceTransform="topCardTransform" style="" :noTransition="!topCardTransform ? true : false" />
    </div>
    <button @click="$emit('start-game')" v-if="!started && host && room.players.length === 4" style="position: absolute; top: 0; right: 0; background: white; font-size: 1.2em; padding: 8px;">start game</button>
  </div>
</template>

<script>
import Card from '../components/Card.vue'
import uniqid from "uniqid";

export default {
  name: "Game",
  components: {
    Card
  },
  props: {
    host: {
      type: Boolean,
      default: false
    },
    start: {
      type: Boolean,
      default: false
    },
    room: {
      type: Object,
      default() {
        return {
          players: []
        };
      }
    },
    socketId: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      topCardTransform: null,
      canDraw: false,
      top: {
        count: 0,
        id: ""
      },
      left: {
        count: 0,
        id: ""
      },
      right: {
        count: 0,
        id: ""
      },
      pile: [],
      cards: [],
      started: false,
      playDirectionReverse: false
    }
  },
  watch: {
    pile() {
      this.findPlayable();
    },
    start() {
      if (this.start) {
        this.startGame();
      }
    },
    room() {
      this.setPlayers()
    }
  },
  methods: {
    setPlayers() {
      if (this.room.players.length !== 4) return;
      const binds = [ "right", "top", "left" ]
      const me = this.room.players.indexOf(this.socketId);
      let i = me + 1;
      let count = 0;

      do {
        if (i > this.room.players.length - 1) {
          i = 0;
        }

        this[binds[count]].id = this.room.players[i];

        count++;
        i++;
      } while (i !== me);
    },
    sortCards() {
      const red = this.cards.filter(card => card.color === "red").sort((a, b) => a.number - b.number);
      const green = this.cards.filter(card => card.color === "green").sort((a, b) => a.number - b.number);
      const yellow = this.cards.filter(card => card.color === "yellow").sort((a, b) => a.number - b.number);
      const blue = this.cards.filter(card => card.color === "blue").sort((a, b) => a.number - b.number);
      const changeColor = this.cards.filter(card => card.color === "changeColor");
      const plus4 = this.cards.filter(card => card.color === "plus4");

      this.cards = [
        ...red,
        ...green,
        ...yellow,
        ...blue,
        ...changeColor,
        ...plus4
      ];
    },
    async giveCards(num, person = "you") {
      for (let i = 0; i < num; i++) {
        this.addCard(person); 
        await this.sleep(500);
      }
      
      person === "you" ? this.sortCards() : null;
      return;
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async startGame() {
      this.cards = [];

      await this.giveCards(7);
      await this.giveCards(7, "left");
      await this.giveCards(7, "top");
      await this.giveCards(7, "right");
    },
    findPlayable() {
      const indexes = [];
      const topCard = this.pile[this.pile.length - 1];

      if (!topCard) {
        this.cards.forEach(card => card.playable = true);
      }

      this.cards.forEach((card, i) => {
        card.playable = false;

        if (card.color === "plus4" || card.color === "changeColor") {
          return indexes.push(i);
        } else if (card.color === topCard.color) {
          return indexes.push(i);
        } else if (card.number === topCard.number) {
          return indexes.push(i);
        } else {
          return;
        }
      })

      indexes.forEach(i => {
        const card = {...this.cards[i]};

        card.playable = true;
        card.id = uniqid.time();

        this.cards.splice(i, 1, card);
      })
    },
    cardClicked(e) {
      this.cards.splice(e.index, 1);
      this.cards = [...this.cards];

      if (this.pile.length >= 12) {
        this.pile.unshift();
      }

      e.card.id = uniqid.time();
      this.pile.push(e.card);
    },
    addCard(person = "you") {
      let card;

      if (person === "you") {
        let colors = ["red", "green", "yellow", "blue" ];
        let color = colors[Math.floor(Math.random() * 4)];
        
        let number = Math.floor(Math.random() * 13) + 1;
        if (number === 10) number = 0;

        // special card chance
        if (Math.random() < 0.1) {
          color = ["plus4", "changeColor"][Math.floor(Math.random() * 2)];
          number = 1;
        }

        card = {
          color,
          number,
          id: uniqid.time(),
          hidden: true
        }

        this.cards.push(card);
      } else {
        this[person].count++;
      }

      const observer = new MutationObserver((mutations, me) => {
        let length = this.cards.length;

        if (person !== "you") {
          length = person === "right" ? 1 : this[person].count;
        }

        const element = document.querySelector(`.cards.${person} .card:nth-of-type(${length})`);
        
        if (element) {
          const { x, y } = this.$refs.topCard.$el.getBoundingClientRect();
          const { x: desX, y: desY } = element.getBoundingClientRect();

          if (person === "left") {
            this.topCardTransform = `translate(${(x - desX * 0.96) * -1}px, ${(y - desY) * -1}px) rotateX(-25deg) rotateY(52deg) scale(.66) !important`;
          } else if (person === "right") {
            this.topCardTransform = `translate(${(x - desX * 0.96) * -1}px, ${(y - desY) * -1}px) rotateX(25deg) rotateY(52deg) scale(.66) !important`;
          } else if (person === "top") {
            this.topCardTransform = `translate(${(x - desX * 0.96) * -1}px, ${(y - desY) * -1}px) rotateX(-30deg) scale(.65) !important`;
          } else {
            let rotate = element.style.transform.match(/[rotate](.*)/)[0];
            rotate = rotate.slice(7, rotate.length - 1);

            this.topCardTransform = `translate(${(x - desX * 0.96) * -1}px, ${(y - desY) * -1}px) rotate(${rotate}) rotateY(180deg) !important`;
          }

          this.$refs.topCard.$el.style.zIndex = 1000;

          setTimeout(() => {
            if (person === "you") {
              this.cards.splice(this.cards.length - 1, 1, { ...card, hidden: false }); 
            }

            this.topCardTransform = null;
          }, 450)

          me.disconnect(); // stop observing
          return;
        }
      });

      observer.observe(document, {
        childList: true,
        subtree: true
      })
    } 
  },
  mounted() {
    this.setPlayers();
  }
}
</script>

<style lang="scss">
.game {
  width: 100%;
  height: 100%;
  background-color: #780E09;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.direction {
  display: inline-block;
  position:absolute;
  vertical-align:middle;
  width: 350px;
  height: 350px;
  border: 14px solid transparent;
  border-top-color:#ffffff50;
  border-bottom-color:#ffffff50;
  border-radius: 50%;
  animation: rotate 8s linear infinite;
  transform: scale(1.2) rotateX(55deg);

  &.reverse {
    animation-direction: reverse;

    &::after {
      top: 36px;
      left: 8px;
      transform: rotate(-133deg);
    }

    &::before {
      bottom: 36px;
      right: 8px;
      left: auto;
      transform: rotate(44deg);
    }
  }

  &::after, &::before {
    position:absolute;
    content: "";
    width:0; height:0;
    border: 20px solid transparent;
    border-bottom-color:#ffffff50;
  }

  &::after {
    top: 36px;
    right: 8px;
    transform: rotate(135deg);
  }

  &::before {
    bottom: 36px;
    left: 8px;
    transform: rotate(-45deg);
  }

  @keyframes rotate {
    to { transform: scale(1.2) rotateX(55deg) rotate(360deg); }
  }
}

.stack {
  position: absolute;
  left: 60px;
  bottom: 290px;
  cursor: pointer;

  .card {
    pointer-events: none;
    transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) scale(.85) !important;
    cursor: pointer;

    &.draw {
      animation: pulse infinite 3s ease;

      @keyframes pulse {
        from {
          box-shadow: 0px 0px 5px 4px #ffe23f, inset 0px 0px 3px 3px #ffe448;
        }

        50% {
          box-shadow: 0px 0px 14px 14px #ffe23f, inset 0px 0px 3px 3px #ffe448;
        }

        to {
          box-shadow: 0px 0px 3px 2px #ffe23f, inset 0px 0px 3px 3px #ffe448;
        }
      }
    }
    
    &:not(:first-of-type) {
      margin-left: 0;
      position: absolute;
      margin-top: -197px !important;
    }

    &:nth-of-type(6) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-2px, 2px) scale(.85) !important;
    }

    &:nth-of-type(5) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-4px, 4px) scale(.85) !important;
    }

    &:nth-of-type(4) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-6px, 6px) scale(.85) !important;
    }

    &:nth-of-type(3) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-8px, 8px) scale(.85) !important;
    }

    &:nth-of-type(2) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-10px, 10px) scale(.85) !important;
    }

    &:nth-of-type(1) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-12px, 12px) scale(.85) !important;
    }
  }
}

.cards {
  display: flex;
  flex-direction: row;
  margin-bottom: 50px;
  margin-top: auto;
}

.pile {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotateX(55deg);
  position: absolute;
}

.you {
  .card {
    filter: brightness(.7);
  }
}

.other {
  position: absolute;

  .card {
    pointer-events: none;
  }

  &.right {
    right: 130px;
    bottom: 47.6%;

    .card {
      transform: rotateX(25deg) rotateY(52deg) scale(.66);

      &:not(:first-of-type) {
        margin-left: -95px;
      }
    }
  }

  &.left {
    left: 100px;
    top: 21.9%;

    .card {
      transform: rotateX(-25deg) rotateY(52deg) scale(.66);

      &:not(:first-of-type) {
        margin-left: -95px;
      }
    }
  }

  &.top {
    top: 30px;
    margin-left: -30px;

    .card {
      transform: rotateX(-30deg) scale(.65);
      
      &:not(:first-of-type) {
        margin-left: -95px;
      }
    }
  }
}
</style>
