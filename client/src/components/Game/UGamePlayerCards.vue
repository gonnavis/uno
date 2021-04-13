<script>
export default {
  name: "UGamePlayerCards",
  props: {
    room: {
      type: Object,
      default() {
        return {
          right: {},
          left: {},
          top: {},
        };
      },
    },
    isTurn: Boolean,
  },
};
</script>

<template>
  <div class="player-cards">
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
  </div>
</template>

<style lang="scss" scoped>
$mobile: 900px;

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
</style>