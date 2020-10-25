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
    <div class="cards">
      <Card 
        v-for="(card, i) in cards" 
        :key="card.id" 
        :color="card.color" 
        :number="card.number" 
        :style="{ zIndex: i }" 
        :length="cards.length" 
        :index="i"
        @clicked="cardClicked"
      />
    </div>
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

      e.card.id = uniqid.time();
      this.pile.push(e.card);
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
</style>
