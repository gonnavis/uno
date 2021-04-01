<script>
import Card from "@/components/Card.vue";
import UMenuModal from "@/components/Menu/UMenuModal.vue";

export default {
  name: "Game",
  components: {
    Card,
    UMenuModal,
  },
  data() {
    return {
      topCardTransform: null,
      pickColor: false,
      wildcardColor: null,
      wildcardIndex: -1,
      drawing: false,
      hasCalledUnoClient: false,
      canDrawClient: true,
      canPlayClient: true,
    };
  },
  computed: {
    room() {
      return this.$store.state.room;
    },
    hideTopCard() {
      let hide = false;
      const animateCards = this.$store.state.animateCards;

      const playerCardIndex = animateCards.findIndex(
        (c) => !c.draw && c.player
      );
      if (playerCardIndex !== -1) {
        const card = animateCards[playerCardIndex];
        if (!card.isTransitionComplete && card.steps === 1) {
          hide = true;
        }
      } else if (
        animateCards.findIndex((c) => c.steps !== 0 && !c.draw && c.other) !==
        -1
      ) {
        hide = true;
      }

      return hide;
    },
    pile() {
      let pile;
      const limit = this.$store.state.isMobile ? 5 : 12;

      if (this.room.pile.length > limit) {
        pile = this.room.pile.slice(this.room.pile.length - limit);
      } else {
        pile = this.room.pile;
      }

      return this.hideTopCard ? pile.slice(0, pile.length - 1) : pile;
    },
    playableCardCount() {
      if (!this.room.you.cards) return null;

      const count = this.room.you.cards.reduce(
        (total, c) => total + c.playable,
        0
      );

      return count;
    },
    isTurn() {
      return this.room.turn === this.room.you.id;
    },
    // isPlayerDrawing() {
    //   let drawing = false;
    //   const animateCards = this.$store.state.animateCards;

    //   const playerCardIndex = animateCards.findIndex((c) => c.draw && c.player);
    //   if (playerCardIndex !== -1) {
    //     const card = animateCards[playerCardIndex];
    //     if (!card.isTransitionComplete && card.steps !== 0) {
    //       drawing = true;
    //     }
    //   }

    //   return drawing;
    // },
    playerCards() {
      return this.room.you.cards;
    },
    animateCards() {
      return this.$store.state.animateCards;
    },
  },
  watch: {
    isTurn(val) {
      if (val) {
        this.canDrawClient = true;
        this.canPlayClient = true;
      } else {
        this.canDrawClient = false;
        this.canPlayClient = false;
      }
    },
    playerCards(cards, oldCards) {
      // player draw card animation
      if (cards.length > oldCards.length) {
        const card = cards[this.room.you.lastDrawnCard];

        window.requestAnimationFrame(() => {
          const cardElement = document.querySelector(
            `.cards.you :nth-of-type(${this.room.you.lastDrawnCard + 1})`
          );

          if (cardElement) {
            cardElement.classList.add("hidden");

            const startBox = this.$refs.stackTopCard.$el.getBoundingClientRect();
            const destBox = cardElement.getBoundingClientRect();

            this.$store.commit("ADD_ANIMATE_CARD", {
              ...card,
              steps: 1,
              draw: true,
              player: true,
              isTransitionComplete: false,
              drawnIndex: this.room.you.lastDrawnCard,
              start: {
                x: startBox.x,
                y: startBox.y,
              },
              dest: {
                x: destBox.x,
                y: destBox.y,
              },
              transform:
                "rotate(-30deg) rotateY(20deg) rotateX(20deg) scale(0.85)",
            });
          }
        });
      }
    },
    wildcardColor(color) {
      if (this.pickColor && color !== null) {
        this.$store.state.socket.emit("play-card", this.wildcardIndex, color);
      }

      this.pickColor = false;
      this.wildcardColor = null;
      this.wildcardIndex = -1;
    },
    room(room, oldRoom) {
      if (room.you.count === 2 && this.hasCalledUnoClient)
        this.hasCalledUnoClient = false;

      // update check for drawing cards client side
      if (this.drawing) this.drawing = room.you.drawing;

      // player playing card animation
      const index = this.$store.state.animateCards.findIndex((c) => c.player);
      if (index !== -1 && oldRoom.pile.length !== room.pile.length) {
        const card = this.$store.state.animateCards[index];
        card.steps--;

        if (card.steps === 0) {
          this.$store.commit("REMOVE_ANIMATE_CARD", index);
        }
      }

      // other players playing card animations
      const others = ["right", "top", "left"];
      for (let i = 0; i < others.length; i++) {
        const other = others[i];

        if (!room[other]) continue;

        let transform;
        if (other === "right") {
          transform =
            "rotate(15deg) rotateY(50deg) rotateZ(5deg) rotateX(20deg) scale(0.75)";
        } else if (other === "left") {
          transform =
            "rotate(-15deg) rotateY(-50deg) rotateZ(-5deg) rotateX(20deg) scale(0.75)";
        } else {
          transform = "scale(0.6)";
        }

        const card = room.pile[room.pile.length - 1];
        const cardElement = document.querySelector(
          `.cards.other.${other} :nth-of-type(${Math.ceil(
            Math.random() * room[other].count
          )})`
        );
        if (!cardElement) continue;

        // play card animation
        if (room[other].count < oldRoom[other].count) {
          const box = cardElement.getBoundingClientRect();
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;

          this.$store.commit("ADD_ANIMATE_CARD", {
            ...card,
            steps: 1,
            other: true,
            isTransitionComplete: false,
            start: {
              x: box.x,
              y: box.y,
            },
            dest: {
              x: centerX - box.width / 2 - 25,
              y: centerY - box.height / 2 - 30,
            },
            transform: transform,
          });
        } else if (room[other].count > oldRoom[other].count) {
          const startBox = this.$refs.stackTopCard.$el.getBoundingClientRect();
          const destBox = cardElement.getBoundingClientRect();

          this.$store.commit("ADD_ANIMATE_CARD", {
            ...card,
            steps: 1,
            draw: true,
            other: true,
            isTransitionComplete: false,
            drawnIndex: this.room.you.lastDrawnCard,
            start: {
              x: startBox.x,
              y: startBox.y,
            },
            dest: {
              x: destBox.x,
              y: destBox.y,
            },
            transform:
              "rotate(-30deg) rotateY(20deg) rotateX(20deg) scale(0.85)",
            endTransform: transform,
          });
        }
      }
    },
  },
  methods: {
    leaveRoom() {
      this.$store.state.socket.emit("leave-room");
      this.$store.commit("RESET_ROOM");

      if (this.$route.name !== "Home") this.$router.push({ name: "Home" });
    },
    drawCard() {
      if (
        !this.room.started ||
        !this.isTurn ||
        this.drawing ||
        !this.room.you.canDraw ||
        !this.canDrawClient ||
        this.room.you.mustStack
      )
        return;

      this.$store.state.socket.emit("draw-card");
      this.canDrawClient = false;
      this.drawing = true;
    },
    playCard(index) {
      if (!this.room.you.canPlay || !this.canPlayClient) return;

      // stop player from drawing or playing while awaiting response from server
      this.canDrawClient = false;
      this.canPlayClient = false;

      this.$store.state.socket.emit("play-card", index);
    },
  },
  mounted() {
    if (!this.room.id) return this.$router.push({ name: "Home" });

    window.onblur = () => (this.$store.state.animateCards = []);
    window.onfocus = () => (this.$store.state.animateCards = []);
  },
  beforeDestroy() {
    this.leaveRoom();
  },
  destroyed() {
    window.onblur = null;
    window.onfocus = null;
  },
};
</script>

<template>
  <div class="game">
    <u-menu-modal
      v-if="room.winner"
      :title="`Congratulations to ${room.winner.username} on winning the game!`"
      @close="leaveRoom"
    >
      <button class="btn rounded-btn" @click="leaveRoom">Main Menu</button>
    </u-menu-modal>

    <div v-if="pickColor" class="color-picker">
      <div class="container">
        <button @click="wildcardColor = 0" class="red"></button>
        <button @click="wildcardColor = 1" class="green"></button>
        <button @click="wildcardColor = 2" class="yellow"></button>
        <button @click="wildcardColor = 3" class="blue"></button>
      </div>
    </div>

    <div class="animation-cards">
      <Card
        v-for="(card, i) in $store.state.animateCards"
        :key="`${i}-animate-${card.color}${card.number}${card.type}`"
        :index="i"
        :color="card.color"
        :number="card.number"
        :type="card.type"
        :start="card.start"
        :dest="card.dest"
        :transform="card.transform"
        :back="card.other && card.draw"
        animate
      />
    </div>

    <div class="pile">
      <Card
        v-for="(card, i) in pile"
        :key="`${i}-pile-${card.color}${card.number}${card.type}`"
        :color="card.color"
        :number="card.number"
        :type="card.type"
        pile
      />
    </div>

    <div class="direction" :class="{ reverse: !room.directionReversed }" />

    <div
      v-if="room.right"
      class="cards other right"
      :style="{ '--count': `${room.right.count}` }"
    >
      <Card
        v-for="i in room.right.count"
        :key="i"
        back
        :style="{ zIndex: i }"
      />
    </div>
    <div
      v-if="room.left"
      class="cards other left"
      :style="{ '--count': `${room.left.count}` }"
    >
      <Card v-for="i in room.left.count" :key="i" back :style="{ zIndex: i }" />
    </div>
    <div
      v-if="room.top"
      class="cards other top"
      :style="{ '--count': `${room.top.count}` }"
    >
      <Card v-for="i in room.top.count" :key="i" back :style="{ zIndex: i }" />
    </div>

    <div class="hud">
      <div class="stack" @click="drawCard">
        <Card back />
        <Card back />
        <Card back />
        <Card back />
        <Card back />
        <Card back />
        <Card
          back
          :class="{
            draw:
              playableCardCount === 0 &&
              isTurn &&
              canDrawClient &&
              !drawing &&
              room.you.canDraw,
          }"
        />
        <Card back ref="stackTopCard" />
      </div>

      <div
        v-if="room.you"
        class="cards you"
        :class="{ turn: isTurn && room.you.canPlay }"
        :style="{ '--count': `${room.you.count}` }"
      >
        <Card
          v-for="(card, i) in playerCards"
          :key="`${i}-you-${card.color}${card.number}${card.type}`"
          :index="i"
          :color="card.color"
          :number="card.number"
          :type="card.type"
          :playable="card.playable && isTurn && !drawing && room.you.canPlay"
          @card-played="playCard"
          @pick-color="
            pickColor = true;
            wildcardIndex = $event;
          "
        />
      </div>

      <!-- Player display cards -->
      <div
        v-if="room.you && room.started"
        class="player-card you"
        :class="{ playing: isTurn }"
      >
        {{ room.you.username }} : {{ room.you.count }}
      </div>
      <div
        v-if="room.right && room.started"
        class="player-card right"
        :class="{ playing: room.turn === room.right.id }"
      >
        {{ room.right.username }} : {{ room.right.count }}
      </div>
      <div
        v-if="room.left && room.started"
        class="player-card left"
        :class="{ playing: room.turn === room.left.id }"
      >
        {{ room.left.username }} : {{ room.left.count }}
      </div>
      <div
        v-if="room.top && room.started"
        class="player-card top"
        :class="{ playing: room.turn === room.top.id }"
      >
        {{ room.top.username }} : {{ room.top.count }}
      </div>

      <button
        v-if="room.isHost && !room.started && room.playerCount > 1"
        class="start-btn rounded-btn"
        @click="$store.state.socket.emit('start-game')"
      >
        Start Game
      </button>

      <img
        v-if="
          room.you &&
          room.you.cards &&
          room.you.cards.length === 2 &&
          isTurn &&
          !room.you.hasCalledUno &&
          !hasCalledUnoClient &&
          playableCardCount !== 0
        "
        src="@/assets/logo.png"
        class="uno-btn"
        @click="
          $store.state.socket.emit('call-uno');
          hasCalledUnoClient = true;
        "
      />
    </div>
  </div>
</template>

<style lang="scss">
$mobile: 900px;
$table-rotatex: 58deg;

.game {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.animation-cards {
  * {
    position: absolute;
  }
}

.rounded-btn {
  padding: 14px 22px;
  background-color: #ff520d;
  color: #fff;
  border: 2px solid white;
  border-radius: 6px;
  font-size: 1.5rem;
  font-weight: bold;
  transition: background-color 0.2s ease;
  outline: none;

  &:hover {
    background-color: #ff8e0d;
  }
}

.hud {
  margin-top: auto;
  z-index: 400;

  @media screen and (max-width: $mobile) {
    .top-left-text {
      font-size: 0.8rem !important;

      .btn {
        transform: scale(0.8);
        transform-origin: top left;
      }
    }

    .stack {
      transform-origin: bottom left;
      margin-left: -30px;
      margin-bottom: -10px;

      .card:not(:first-of-type) {
        margin-top: -98.5px !important;
      }
    }
  }

  .start-btn {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  .uno-btn {
    position: absolute;
    bottom: 85px;
    right: 60px;
    width: 200px;
    cursor: pointer;
    animation: grow 2.5s ease-in-out infinite;
    --start-transform: 1;
    --end-transform: 1.15;

    @keyframes grow {
      from {
        transform: scale(var(--start-transform));
      }

      50% {
        transform: scale(var(--end-transform));
      }

      to {
        transform: scale(--start-transform);
      }
    }

    @media screen and (max-width: $mobile) {
      transform: scale(0.7);
      bottom: 20px;
      right: 30px;
      --start-transform: 0.7;
      --end-transform: 0.8;
    }
  }

  .player-card {
    padding: 12px 22px;
    background-color: white;
    border: 6px solid black;
    border-radius: 8px;
    position: absolute;
    z-index: 100;
    font-weight: bold;
    display: flex;

    @media screen and (max-width: $mobile) {
      transform: scale(0.6);
      transform-origin: center;
    }

    &.playing {
      box-shadow: 0px 0px 8px 7px #fcc81c;
    }

    &.right {
      right: 105px;
      bottom: 51%;

      @media screen and (max-width: $mobile) {
        right: 20px;
      }
    }

    &.left {
      left: 105px;
      bottom: 51%;

      @media screen and (max-width: $mobile) {
        left: 10px;
      }
    }

    &.top {
      left: 44%;
      top: 160px;

      @media screen and (max-width: $mobile) {
        left: 40.5%;
        top: 50px;
      }
    }

    &.you {
      left: 45.5%;
      bottom: 15px;
      filter: brightness(0.6);

      @media screen and (max-width: $mobile) {
        bottom: 3px;
      }

      &.playing {
        filter: unset;
      }
    }
  }
}

.color-picker {
  width: 100vw;
  height: 100vh;
  position: absolute;
  z-index: 1001;
  display: flex;

  .container {
    $transform: rotateX($table-rotatex) translateY(-60px);
    transform: $transform;
    width: MAX(38vw, 350px);
    height: MAX(MIN(38vw, 75vh), 350px);
    border-radius: 20px;
    margin: auto;
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-gap: 10px;
    animation: enlarge 9s ease-in-out infinite;

    @keyframes enlarge {
      from {
        transform: $transform scale(1);
      }

      50% {
        transform: $transform scale(1.1);
      }

      to {
        transform: $transform scale(1);
      }
    }

    button {
      --shadow-color: black;
      opacity: 0.8;
      border-radius: 10px;
      width: 100%;
      height: 100%;
      outline: none;
      box-shadow: 0px 25px 30px 5px var(--shadow-color);
      transition: opacity 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;

      &:hover {
        box-shadow: 0 35px 40px 10px var(--shadow-color);
        opacity: 0.9;
        transform: scale(1.1);
        z-index: 5;
      }
    }

    .red {
      border-top-left-radius: 100%;
      background-color: #ff171a;
      --shadow-color: #ff000479;
    }

    .green {
      border-top-right-radius: 100%;
      background-color: #41dd2c;
      --shadow-color: #00ff0d79;
    }

    .yellow {
      border-bottom-left-radius: 100%;
      background-color: #ffee00;
      --shadow-color: #ffe60079;
    }

    .blue {
      border-bottom-right-radius: 100%;
      background-color: #00a2ff;
      --shadow-color: #00c3ff79;
    }
  }
}

.direction {
  display: inline-block;
  position: absolute;
  vertical-align: middle;
  width: 350px;
  height: 350px;
  border: 14px solid transparent;
  border-top-color: #ffffff50;
  border-bottom-color: #ffffff50;
  border-radius: 50%;
  animation: rotate 8s linear infinite;
  transform: scale(1.2) rotateX($table-rotatex);

  @media screen and (max-width: $mobile) {
    transform: scale(0.58) rotateX($table-rotatex);
    animation: rotate-mobile 8s linear infinite;
  }

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

  &::after,
  &::before {
    position: absolute;
    content: "";
    width: 0;
    height: 0;
    border: 20px solid transparent;
    border-bottom-color: #ffffff50;
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
    to {
      transform: scale(1.2) rotateX($table-rotatex) rotate(360deg);
    }
  }

  @keyframes rotate-mobile {
    to {
      transform: scale(0.58) rotateX($table-rotatex) rotate(360deg);
    }
  }
}

.stack {
  position: absolute;
  left: 60px;
  bottom: 29vh;
  cursor: pointer;

  &.canDraw {
    box-shadow: 0px 0px 14px 14px #ffe23f, inset 0px 0px 3px 3px #ffe448;
  }

  .card {
    pointer-events: none;
    transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) scale(0.85) !important;
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
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg)
        translate(-2px, 2px) scale(0.85) !important;
    }

    &:nth-of-type(5) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg)
        translate(-4px, 4px) scale(0.85) !important;
    }

    &:nth-of-type(4) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg)
        translate(-6px, 6px) scale(0.85) !important;
    }

    &:nth-of-type(3) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg)
        translate(-8px, 8px) scale(0.85) !important;
    }

    &:nth-of-type(2) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg)
        translate(-10px, 10px) scale(0.85) !important;
    }

    &:nth-of-type(1) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg)
        translate(-12px, 12px) scale(0.85) !important;
    }
  }
}

.pile {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotateX($table-rotatex);
  position: absolute;

  @media screen and (max-width: $mobile) {
    transform: rotateX($table-rotatex);
  }

  .card {
    position: absolute;
    margin-left: 0 !important;
  }
}

.you {
  .card {
    filter: brightness(0.7);
  }
}

.cards {
  display: flex;
  flex-direction: row;
  margin-bottom: 50px;
  margin-top: auto;

  &.you {
    transition: transform 0.5s ease, filter 0.5s ease;
    transform-origin: bottom center;
    transform: scale(0.8);
    filter: brightness(0.5);

    &.turn {
      transform: scale(1);
      filter: brightness(1);
    }

    .card {
      margin-left: max(calc(-4.5px * var(--count)), -90px);

      &:first-of-type {
        margin-left: 0 !important;
      }

      @media screen and (max-width: $mobile) {
        margin-left: max(calc(-2.25px * var(--count)), -45px);
      }
    }

    @media screen and (max-width: $mobile) {
      margin-bottom: 30px;
    }
  }

  &.other {
    position: absolute;

    .card {
      margin-left: max(calc(-5.5px * var(--count)), -105px) !important;

      @media screen and (max-width: $mobile) {
        margin-left: max(calc(-2.75px * var(--count)), -52.5px) !important;
      }
    }

    &.right {
      right: 120px;
      bottom: 48%;
      transform-origin: bottom right;
      transform: rotate(15deg) rotateY(50deg) rotateZ(5deg) rotateX(20deg)
        scale(0.75);

      @media screen and (max-width: $mobile) {
        right: 50px;
        bottom: 46%;
      }
    }

    &.left {
      left: 120px;
      bottom: 48%;
      transform-origin: bottom left;
      transform: rotate(-15deg) rotateY(-50deg) rotateZ(-5deg) rotateX(20deg)
        scale(0.75);

      @media screen and (max-width: $mobile) {
        left: 50px;
        bottom: 46%;
      }

      .card:first-of-type {
        margin-left: 0 !important;
      }
    }

    &.top {
      top: 20px;
      transform: scale(0.6);

      @media screen and (max-width: $mobile) {
        transform-origin: top center;
        top: 20px;
      }
    }
  }
}
</style>
