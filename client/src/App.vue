<template>
  <div id="app">
    <router-view @join-room="joinRoom" @create-room="createRoom" :response="response" :host="host" />
  </div>
</template>

<script>
import io from "socket.io-client";
const socket = io("http://localhost:3000")

export default {
  name: 'App',
  data() {
    return {
      roomId: "",
      host: null,
      response: {
        error: null,
        message: null
      }
    }
  },
  methods: {
    joinRoom(code) {
      if (this.roomId) return;

      socket.emit("join-room", code);
    },
    createRoom() {
      socket.emit("create-room");
    }
  },
  mounted() {
    socket.on("created-room", id => {
      this.roomId = id;
      this.host = true;

      this.$router.push({ name: "Game" })
    })

    socket.on("join-room-response", res => {
      this.response = res;
    })

    const params = new URLSearchParams(window.location.search);

    if (params.get("roomCode")) {
      socket.emit("join-room", params.get("roomCode"));
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
</style>
