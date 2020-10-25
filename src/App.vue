<template>
  <div id="app">
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
        @clicked="cardClicked"
      />
    </div>
    <div class="cards other right">
      <Card 
        v-for="i in 8" 
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
        v-for="i in 8" 
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
        v-for="i in 8" 
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
    <div class="stack">
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" />
      <Card :color="'plus4'" :number="6" ref="topCard" :forceTransform="topCardTransform" :noTransition="!topCardTransform ? true : false" />
    </div>
    <button class="addcard" @click="addCard">Add card</button>
  </div>
</template>

<script>
import Card from './components/Card.vue'
import uniqid from "uniqid";

export default {
  name: 'App',
  components: {
    Card
  },
  data() {
    return {
      topCardTransform: null,
      pile: [],
      cards: [
        { color: "red", number: 0, id: uniqid.time() },
        { color: "red", number: 9, id: uniqid.time() },
        { color: "red", number: 11, id: uniqid.time() },
        { color: "green", number: 3, id: uniqid.time() },
        { color: "green", number: 7, id: uniqid.time() },
        { color: "green", number: 12, id: uniqid.time() },
        { color: "yellow", number: 3, id: uniqid.time() },
        { color: "yellow", number: 11, id: uniqid.time() },
        { color: "yellow", number: 13, id: uniqid.time() },
        { color: "blue", number: 2, id: uniqid.time() },
        { color: "blue", number: 5, id: uniqid.time() },
      ]
    }
  },
  methods: {
    cardClicked(e) {
      this.cards.splice(e.index, 1);
      this.cards = [...this.cards];

      if (this.pile.length >= 12) {
        this.pile.unshift();
      }

      e.card.id = uniqid.time();
      this.pile.push(e.card);
    },
    addCard() {
      let colors = ["red", "green", "yellow", "blue" ]
      let color = colors[Math.floor(Math.random() * 4)];
      
      let number = Math.floor(Math.random() * 13) + 1;
      if (number === 10) number = 0;

      // special card chance
      if (Math.random() < 0.1) {
        color = ["plus4", "changeColor"][Math.floor(Math.random() * 2)];
        number = 1;
      }

      const card = {
        color,
        number,
        id: uniqid.time(),
        hidden: true
      }

      this.cards.push(card);

      const observer = new MutationObserver((mutations, me) => {
        const element = document.querySelector(`.cards.you .card:nth-of-type(${this.cards.length})`)

        if (element) {
          const { x, y } = this.$refs.topCard.$el.getBoundingClientRect();
          const { x: desX, y: desY } = element.getBoundingClientRect();
          let rotate = element.style.transform.match(/[rotate](.*)/)[0];
          rotate = rotate.slice(7, rotate.length - 1);
          console.log(rotate);

          this.topCardTransform = `translate(${(x - desX * 0.96) * -1}px, ${(y - desY) * -1}px) rotate(${rotate}) rotateY(180deg) !important`;
          this.$refs.topCard.$el.style.zIndex = 1000;

          setTimeout(() => {
            this.cards.splice(this.cards.length - 1, 1, { ...card, hidden: false }); 
            this.topCardTransform = null;
          }, 500)

          me.disconnect(); // stop observing
          return;
        }
      });

      observer.observe(document, {
        childList: true,
        subtree: true
      })
    } 
  }
}
</script>

<style lang="scss">
body {
  width: 100%;
  height: 100vh;
}

#app {
  width: 100%;
  height: 100%;
  background-color: #780E09;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.addcard {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: white;
  padding: 10px;
}

.stack {
  position: absolute;
  left: 100px;
  bottom: 200px;

  .card {
    pointer-events: none;
    transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) !important;
    
    &:not(:first-of-type) {
      margin-left: 0;
      position: absolute;
      margin-top: -197px !important;
    }

    &:nth-of-type(6) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-3px, 3px) !important;
    }

    &:nth-of-type(5) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-6px, 6px) !important;
    }

    &:nth-of-type(4) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-9px, 9px) !important;
    }

    &:nth-of-type(3) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-12px, 12px) !important;
    }

    &:nth-of-type(2) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-15px, 15px) !important;
    }

    &:nth-of-type(1) {
      transform: rotate(-30deg) rotateY(20deg) rotateX(20deg) translate(-18px, 18px) !important;
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

.other {
  position: absolute;
  top: 20%;

  .card {
    pointer-events: none;
  }

  &.right {
    right: 130px;

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
