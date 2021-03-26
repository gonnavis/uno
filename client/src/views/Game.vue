<script>
import Card from "@/components/Card.vue";

export default {
  name: "Game",
  components: {
    Card,
  },
  data() {
    return {
      topCardTransform: null,
      pickColor: false,
      wildcardColor: null,
      wildcardIndex: -1,
      drawing: false,
      hasCalledUnoClient: false,
    };
  },
  computed: {
    room() {
      return this.$store.state.room;
    },
    hideTopCard() {
      return (
        this.$store.state.animateCards.findIndex((c) => c.steps !== 0) !== -1
      );
    },
    pile() {
      let pile;

      if (this.room.pile.length > 12) {
        pile = this.room.pile.slice(this.room.pile.length - 12);
      } else {
        pile = this.room.pile;
      }

      return this.hideTopCard ? pile.slice(0, pile.length - 1) : pile;
    },
  },
  watch: {
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

        if (room[other] && room[other].count < oldRoom[other].count) {
          const card = room.pile[room.pile.length - 1];
          const cardElement = document.querySelector(
            `.cards.other.${other} :nth-of-type(${Math.ceil(
              Math.random() * room[other].count
            )})`
          );
          if (!cardElement) break;

          const box = cardElement.getBoundingClientRect();
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;

          this.$store.commit("ADD_ANIMATE_CARD", {
            ...card,
            steps: 1,
            start: {
              x: box.x,
              y: box.y,
            },
            dest: {
              x: centerX - box.width / 2 - 50,
              y: centerY - box.height / 2 - 25,
            },
            transform:
              "rotate(15deg) rotateY(50deg) rotateZ(5deg) rotateX(20deg) scale(0.75)",
          });
        }
      }
    },
  },
  methods: {
    copyJoinRoomLink() {
      const link = `${window.location.origin}/game?room=${this.room.id}`;
      window.navigator.clipboard
        .writeText(link)
        .then(() => alert("Copied!"))
        .catch((err) =>
          alert(`Sorry we couldn't copy the link to the clipboard: ${err}`)
        );
    },
  },
  mounted() {
    window.onblur = () => (this.$store.state.animateCards = []);
    window.onfocus = () => (this.$store.state.animateCards = []);
  },
};
</script>

<template>
  <div class="game">
    <div v-if="room.winner" class="winner">
      <div class="card">
        <h1>
          Congratulations to {{ room.winner.username }} on winning the game!
        </h1>

        <button class="btn rounded-btn" @click="resetGame(true)">
          Main Menu
        </button>
      </div>
    </div>

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
      <div
        v-if="room.you"
        class="cards you"
        :style="{ '--count': `${room.you.count}` }"
      >
        <Card
          v-for="(card, i) in room.you.cards"
          :key="`${i}-you-${card.color}${card.number}${card.type}`"
          :index="i"
          :color="card.color"
          :number="card.number"
          :type="card.type"
          :playable="card.playable"
          @pick-color="
            pickColor = true;
            wildcardIndex = $event;
          "
        />
      </div>

      <div
        class="stack"
        @click="
          room.started && room.turn === room.you.id && !drawing
            ? $store.state.socket.emit('draw-card')
            : null
        "
      >
        <Card back />
        <Card back />
        <Card back />
        <Card back />
        <Card back />
        <Card back />
        <!-- // TODO highlight when player has no playable cards -->
        <Card back :class="{ draw: false }" />
        <Card back ref="topCard" />
      </div>

      <!-- Player display cards -->
      <div
        v-if="room.you && room.started"
        class="player-card you"
        :class="{ playing: room.turn === room.you.id }"
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

      <button
        v-if="
          room.you &&
          room.you.cards &&
          room.you.cards.length === 2 &&
          room.turn === room.you.id &&
          !room.you.hasCalledUno &&
          !hasCalledUnoClient
        "
        class="uno-btn rounded-btn"
        @click="
          $store.state.socket.emit('call-uno');
          hasCalledUnoClient = true;
        "
      >
        Call Uno
      </button>

      <div class="top-left-text">
        <p class="room">
          Room Code: <span>{{ room.id }}</span>
          <button
            class="copy"
            style="margin-top: 0px"
            @click="copyJoinRoomLink"
          >
            Copy Link
          </button>
        </p>

        <p class="players">Players: {{ room.playerCount }} / 4</p>

        <button
          class="rounded-btn btn"
          @click="
            () => {
              $store.state.socket.emit('leave-room');
              $store.commit('RESET_ROOM');
            }
          "
        >
          Leave Game
        </button>
      </div>
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

.winner {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1000;

  .card {
    margin: auto;
    background-color: white;
    padding: 35px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    flex-direction: column;

    h1 {
      font-size: 2rem;
      font-weight: bold;
    }

    .btn {
      margin-top: 10px;
    }
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
    bottom: 60px;
    right: 60px;
    font-size: 2rem;

    @media screen and (max-width: $mobile) {
      transform: scale(0.7);
      bottom: 30px;
      right: 30px;
    }
  }

  .top-left-text {
    position: absolute;
    top: 20px;
    left: 20px;
    color: white;
    font-weight: bold;
    font-size: 1.2rem;

    .btn {
      padding: 5px 10px;
      font-size: 1rem;
      margin-top: 10px;
    }

    .room {
      .copy {
        text-decoration: underline;
        font-weight: bold;
        margin-left: 12px;
        color: #53a944;
        outline: none;
        transition: color 0.2s ease;

        &:hover,
        &:focus {
          color: #50ff31;
        }
      }
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
      left: 45%;
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
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  position: absolute;
  z-index: 1000;
  display: flex;

  .container {
    width: 60%;
    height: 60%;
    background-color: white;
    border-radius: 20px;
    margin: auto;
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-gap: 15px;

    button {
      border-radius: 10px;
      width: 100%;
      height: 100%;
    }

    .red {
      background-color: #ff171a;
    }

    .green {
      background-color: #5db151;
    }

    .yellow {
      background-color: #ffde17;
    }

    .blue {
      background-color: #1388d7;
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
    .card {
      margin-left: max(calc(-4.5px * var(--count)), -90px);
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
        margin-left: calc(
          max(calc(-5.5px * var(--count)), -105px) / 2
        ) !important;
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
