<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import Card from './components/Card.vue'
import uniqid from "uniqid";

import io from "socket.io-client";
const socket = io("http://localhost:3000")

export default {
  name: 'App',
  components: {
    Card
  },
  data() {
    return {
      roomId: "",
      host: null,
    }
  },
  mounted() {
    socket.on("created-room", id => {
      this.roomId = id;
      this.host = true;
    })
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
</style>
