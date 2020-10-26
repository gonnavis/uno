<template>
  <div
    class="card"
    :class="{ pile, animate, hidden, noTransition, playable }"
    :style="{
      marginTop,
      transform: forceTransform ? forceTransform : animate ? animate : pile
        ? `rotate(${pileRotate}) scale(.95) translateX(${offsetX}px) translateY(${offsetY}px) !important`
        : `rotate(${rotate})`,
      backgroundPositionY: -bgY + 'px',
      backgroundPositionX: -bgX + 'px',
    }"
    @click="clicked"
    @transitionend="emit ? removeCard() : null"
  />
</template>

<script>
export default {
  name: "Card",
  data() {
    return {
      height: 197,
      width: 127,
      marginTop: 0,
      bgY: 0,
      bgX: 0,
      animate: null,
      rotate: "",
      emit: false,
      offsets: {}
    };
  },
  props: {
    index: {
      type: Number,
      default: 0,
    },
    length: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      default: "red",
    },
    number: {
      type: Number,
      default: null,
    },
    pile: {
      type: Boolean,
      default: false,
    },
    offsetX: {
      type: Number,
      default: 0
    },
    offsetY: {
      type: Number,
      default: 0
    },
    pileRotate: {
      type: String,
      default: ""
    },
    other: {
      type: Boolean,
      default: false
    },
    left: {
      type: Boolean,
      default: false
    },
    top: {
      type: Boolean,
      default: false
    },
    forceTransform: {
      type: String,
      default: ""
    },
    hidden: {
      type: Boolean,
      default: false
    },
    noTransition: {
      type: Boolean,
      default: false
    },
    playable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    removeCard() {
      this.emit = false;

      this.$emit("clicked", {
        index: this.index,
        card: {
          color: this.color,
          number: this.number,
          ...this.offsets
        }
      });
    },
    clicked(e) {
      if (this.pile) return;

      const { x, y } = e.target.getBoundingClientRect()
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const rotate = Math.floor(Math.random() * 140) - 70 + "deg";

      const offsetX = Math.floor(Math.random() * 20) - 10;
      const offsetY = Math.floor(Math.random() * 20) - 10;

      const transform = `translate(${((x - centerX / 1.1) + offsetX) * -1}px, ${((y - centerY + this.height / 1.3) + offsetY) * -1}px) rotateX(55deg) rotate(${rotate}) scale(.95) !important`;
      this.animate = transform;

      this.offsets = { 
        offsetX,
        offsetY,
        rotate
      }

      this.emit = true;
    },
    calculateColor() {
      const gap = 1.85;

      switch (this.color) {
        case "red":
          this.bgY = 0;
          break;
        case "green":
          this.bgY = this.height + gap;
          break;
        case "yellow":
          this.bgY = (this.height + gap) * 2;
          break;
        case "blue":
          this.bgY = (this.height + gap) * 3;
          break;
        case "changeColor":
          this.bgY = (this.height + gap) * 4;
          break;
        case "plus4":
          this.bgY = (this.height + gap) * 5;
          break;
        default:
          break;
      }
    },
    calculateNumber() {
      const number = this.number === 0 ? 10 : this.number;
      this.bgX = (this.width + 1.85) * (number - 1);
    },
  },
  mounted() {
    const margin = 1.3 * (this.index - this.length / 2);
    const rotate = 0.35 * margin;

    if (!this.other) {
      if (margin < 0) {
        this.marginTop = margin * -1 + "px";
        this.rotate = rotate + "deg";
      } else {
        this.marginTop = margin + "px";
        this.rotate = rotate + "deg";

      }
    } else {
      this.marginTop = this.left ? margin * -13 + "px" : margin * 13 + "px";
    }

    if (this.top) {
      this.marginTop = 0;
    }

    this.calculateColor();
    this.calculateNumber();
  },
};
</script>

<style lang="scss" scoped>
.card {
  width: 127px;
  height: 197px;
  background: url("../assets/spritesheet.jpg") no-repeat;
  background-size: 1317%;
  border-radius: 14px;
  box-shadow: 0px 0px 15px 0px #00000073;
  transition: transform 0.3s ease, margin-left 0.2s ease, box-shadow 0.2s ease, width 0.2s ease, filter 0.2s ease;
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