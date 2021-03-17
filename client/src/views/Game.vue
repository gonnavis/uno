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
      drawing: false,
    };
  },
};
</script>

<template>
  <div class="game">
    <div v-if="winnerFound" class="winner">
      <div class="card">
        <h1>
          Congratulations to {{ winnerData.username }} on winning the game!
        </h1>

        <button class="btn rounded-btn" @click="resetGame(true)">
          Main Menu
        </button>
      </div>
    </div>

    <div v-if="pickColor" class="color-picker">
      <div class="container">
        <button @click="wildcardColor = 3" class="red"></button>
        <button @click="wildcardColor = 5" class="green"></button>
        <button @click="wildcardColor = 2" class="yellow"></button>
        <button @click="wildcardColor = 4" class="blue"></button>
      </div>
    </div>

    <div class="pile">
      <Card
        v-for="card in pile"
        :key="card.id"
        :color="card.color"
        :number="card.number"
        :offsetX="card.offsetX"
        :offsetY="card.offsetY"
        :pileRotate="card.rotate"
        :pile="true"
      />
    </div>

    <div class="direction" :class="{ reverse: !playDirectionReverse }" />

    <div class="cards other right">
      <Card
        v-for="i in right.count"
        :ref="'right' + i"
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
        :ref="'left' + i"
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
        :ref="'top' + i"
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

    <div class="hud">
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
          :playable="(card.playable && turn === 'you') || false"
          @clicked="cardClicked"
        />
      </div>
      <div
        class="stack"
        @click="turn === 'you' && !drawing ? addCard('you', true, true) : null"
      >
        <Card :color="'plus4'" :number="6" />
        <Card :color="'plus4'" :number="6" />
        <Card :color="'plus4'" :number="6" />
        <Card :color="'plus4'" :number="6" />
        <Card :color="'plus4'" :number="6" />
        <Card :color="'plus4'" :number="6" />
        <Card :color="'plus4'" :number="6" :class="{ draw: highlightStack }" />
        <Card
          :color="'plus4'"
          :number="6"
          ref="topCard"
          :forceTransform="topCardTransform"
          style=""
          :noTransition="!topCardTransform ? true : false"
        />
      </div>
      <div
        v-if="this.start"
        class="player-card you"
        :class="{ playing: this.turn === 'you' }"
      >
        {{ this.getUsernameFromId(this.socketId) }} : {{ this.cards.length }}
      </div>
      <div
        v-if="this.right.id && this.start"
        class="player-card right"
        :class="{ playing: this.turn === 'right' }"
      >
        {{ this.getUsernameFromId(this.right.id) }} : {{ this.right.count }}
      </div>
      <div
        v-if="this.left.id && this.start"
        class="player-card left"
        :class="{ playing: this.turn === 'left' }"
      >
        {{ this.getUsernameFromId(this.left.id) }} : {{ this.left.count }}
      </div>
      <div
        v-if="this.top.id && this.start"
        class="player-card top"
        :class="{ playing: this.turn === 'top' }"
      >
        {{ this.getUsernameFromId(this.top.id) }} : {{ this.top.count }}
      </div>
      <button
        v-if="canStartGame"
        class="start-btn rounded-btn"
        @click="$emit('start-game')"
      >
        Start Game
      </button>
      <button
        v-if="
          this.cards.length === 2 &&
          this.turn === 'you' &&
          !this.hasCalledUno &&
          this.playableCardsCount > 0
        "
        class="uno-btn rounded-btn"
        @click="hasCalledUno = true"
      >
        Call Uno
      </button>
      <div class="top-left-text">
        <p class="room">
          Room Code: {{ room.id }}
          <button
            class="copy"
            style="margin-top: 0px"
            @click="copyJoinRoomLink"
          >
            Copy Link
          </button>
        </p>
        <p class="players">
          Players: {{ playerCount === 0 ? 1 : playerCount }} / 4
        </p>
        <button class="rounded-btn btn" @click="resetGame(true)">
          Leave Game
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
$mobile: 900px;

.game {
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle,
    rgb(192, 34, 26) 0%,
    rgb(146, 25, 19) 60%,
    rgb(109, 16, 11) 100%
  );
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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
      transform: scale(0.52);
      transform-origin: bottom left;
      margin-left: -30px;
      margin-bottom: -10px;
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

    @media screen and (max-width: $mobile) {
      transform: scale(0.6);
      transform-origin: center;
    }

    &.playing {
      box-shadow: 0px 0px 10px 9px #fcc81c;
    }

    &.right {
      right: 120px;
      top: 41%;

      @media screen and (max-width: $mobile) {
        right: 65px;
        top: 42%;
      }
    }

    &.left {
      left: 90px;
      top: 41%;

      @media screen and (max-width: $mobile) {
        left: 65px;
        top: 42%;
      }
    }

    &.top {
      left: 44.5%;
      top: 160px;

      @media screen and (max-width: $mobile) {
        top: 60px;
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
  transform: scale(1.2) rotateX(55deg);

  @media screen and (max-width: $mobile) {
    transform: scale(0.58) rotateX(55deg);
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
      transform: scale(1.2) rotateX(55deg) rotate(360deg);
    }
  }

  @keyframes rotate-mobile {
    to {
      transform: scale(0.58) rotateX(55deg) rotate(360deg);
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

.cards {
  display: flex;
  flex-direction: row;
  margin-bottom: 50px;
  margin-top: auto;

  &.you {
    @media screen and (max-width: $mobile) {
      transform: scale(0.5);
      transform-origin: bottom center;
      margin-bottom: 30px;
    }
  }
}

.pile {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: rotateX(55deg);
  position: absolute;

  @media screen and (max-width: $mobile) {
    transform: scale(0.4) rotateX(55deg);
  }
}

.you {
  .card {
    filter: brightness(0.7);
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

    @media screen and (max-width: $mobile) {
      transform: scale(0.6);
      transform-origin: bottom center;
      right: 50px;
      bottom: 31%;
    }

    .card {
      transform: rotateX(25deg) rotateY(52deg) scale(0.66);

      &:not(:first-of-type) {
        margin-left: -95px;
      }
    }
  }

  &.left {
    left: 100px;
    top: 21.9%;

    @media screen and (max-width: $mobile) {
      transform: scale(0.6);
      transform-origin: top center;
      left: 50px;
      top: 17%;
    }

    .card {
      transform: rotateX(-25deg) rotateY(52deg) scale(0.66);

      &:not(:first-of-type) {
        margin-left: -95px;
      }
    }
  }

  &.top {
    top: 30px;
    margin-left: -30px;

    @media screen and (max-width: $mobile) {
      transform: scale(0.6);
      transform-origin: top center;
      top: 0px;
      margin-left: -15px;
    }

    .card {
      transform: rotateX(-30deg) scale(0.65);

      &:not(:first-of-type) {
        margin-left: -95px;
      }
    }
  }
}
</style>
