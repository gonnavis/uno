<template>
  <div id="app">
    <router-view />

    <div v-if="offline" class="offline">
      <div class="message">You are currently offline and cannot play.</div>
    </div>
  </div>
</template>

<script>
import "@/api/socket";

export default {
  name: "App",
  data() {
    return {
      offline: !navigator.onLine,
    };
  },
  computed: {
    room() {
      return this.$store.state.room;
    },
  },
  watch: {
    room(room) {
      if (room.you.inRoom) {
        this.$router.push({ name: "Game" });
      }
    },
  },
  mounted() {
    // const roomCode = this.$route.query.room;
    // if (roomCode) {
    //   this.$router.push({ name: "Home" });
    //   let username;
    //   do {
    //     username = prompt("Enter a username to continue to the game.");
    //     if (!username || username.length < 3 || username.length > 24) {
    //       alert("Username must be between 3 and 24 characters.");
    //     }
    //   } while (!username || username.length < 3 || username.length > 24);
    //   if (username) {
    //     socket.emit("join-room", { code: roomCode, username });
    //   }
    // }
  },
};
</script>

<style lang="scss">
body {
  width: 100%;
  height: 100vh;
}

#app {
  width: 100%;
  height: 100%;
  background-color: #780e09;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .offline {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;

    .message {
      font-size: 1.8rem;
      background-color: white;
      border-radius: 10px;
      padding: 2.5rem;
      font-weight: bold;
    }
  }
}
</style>
