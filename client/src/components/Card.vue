<script>
export default {
  name: "Card",
  data() {
    return {
      height: 197,
      width: 127,
      bgY: 0,
      bgX: 0,
      rotate: 0,
    };
  },
  props: {
    index: {
      type: Number,
      default: null,
    },
    color: {
      type: Number,
      default: 0,
    },
    number: {
      type: Number,
      default: 0,
    },
    type: {
      type: Number,
      default: 0,
    },
    playable: {
      type: Boolean,
      default: false,
    },
    back: {
      type: Boolean,
      default: false,
    },
    pile: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleClick() {
      if (this.back || this.index === null || !this.playable) return;

      // let user pick color of plus 4 or wildcard
      if (this.type === 4 || this.type === 5) {
        this.$emit("pick-color", this.index);
      }

      this.$store.state.socket.emit("play-card", this.index);
    },
    calculateColor() {
      const gap = 1.85;
      this.bgY = (this.height + gap) * this.color;
    },
    calculateNumber() {
      const number = this.number === 0 ? 10 : this.number;
      this.bgX = (this.width + 1.85) * (number - 1);
    },
    calculateType() {
      const gap = 1.85;

      switch (this.type) {
        case 1:
        case 2:
        case 3:
          this.bgX = (this.width + gap) * (9 + this.type);
          break;
        case 4:
        case 5:
          this.bgY = (this.height + gap) * this.type;
          if (this.color !== 4) {
            this.bgX = this.width + gap;
            switch (this.color) {
              case 0:
                this.bgX *= 2;
                break;
              case 1:
                this.bgX *= 4;
                break;
              case 2:
                this.bgX *= 1;
                break;
              case 3:
                this.bgX *= 3;
                break;
            }
          } else this.bgX = 0;
      }
    },
  },
  mounted() {
    if (this.back) {
      this.bgY = (this.height + 1.85) * 5;
      this.bgX = (this.width + 1.85) * 5;
    } else {
      this.calculateColor();
      this.calculateNumber();
      this.calculateType();
    }

    if (this.pile) {
      this.rotate = Math.floor(Math.random() * 360);
    }
  },
};
</script>

<template>
  <div
    class="card"
    :class="{ playable }"
    :style="{
      backgroundPositionY: -bgY + 'px',
      backgroundPositionX: -bgX + 'px',
      transform: `rotate(${rotate}deg)`,
    }"
    @click="handleClick"
  />
</template>

<style lang="scss" scoped>
.card {
  width: 127px;
  height: 197px;
  background: url("../assets/spritesheet.jpg") no-repeat;
  background-size: 1317%;
  border-radius: 14px;
  box-shadow: 0px 0px 15px 0px #00000073;
  transition: transform 0.3s ease, margin-left 0.2s ease, box-shadow 0.2s ease,
    width 0.2s ease, filter 0.2s ease;
  transition-delay: 0.2s;
  cursor: pointer;
  pointer-events: none;

  &.playable {
    transform: translateX(-15px) translateY(-15px) rotate(-4deg) !important;
    animation: pulse infinite 3s ease;
    filter: brightness(1);
    pointer-events: all;

    @keyframes pulse {
      from {
        box-shadow: 0px 0px 2px 1px #ffe23f, inset 0px 0px 2px 2px #ffe448;
      }

      50% {
        box-shadow: 0px 0px 6px 4px #ffe23f, inset 0px 0px 3px 3px #ffe448;
      }

      to {
        box-shadow: 0px 0px 2px 1px #ffe23f, inset 0px 0px 2px 2px #ffe448;
      }
    }

    &:hover {
      animation: none;
    }
  }

  &.noTransition {
    transition: margin-left 0.2s ease, box-shadow 0.2s ease, width 0.2s ease;
  }

  &.hidden {
    opacity: 0;
  }

  &:not(:first-of-type) {
    margin-left: -70px;
  }

  &:hover {
    transform: translateX(-45px) translateY(-45px) rotate(-5deg) !important;
    margin-left: 1px;
    box-shadow: 0px 0px 10px 8px #ffe23f, inset 0px 0px 3px 3px #ffe448;
  }

  &.pile {
    position: absolute;
    margin-left: 0px;

    &:hover {
      margin-left: 0;
      box-shadow: 0px 0px 15px 0px #00000073;
    }
  }

  &.animate {
    margin-left: -127px !important;
  }
}
</style>