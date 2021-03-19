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
    route() {
      return this.$route.name;
    },
  },
  watch: {
    room(room) {
      if (!room.id) {
        if (this.route !== "Home") this.$router.push({ name: "Home" });
        return;
      }

      if (room.you.inRoom && this.route !== "Game") {
        this.$router.push({ name: "Game", query: { room: room.id } });
      }
    },
    route(route) {
      if (route === "Game" && !this.room.id)
        return this.$router.push({ name: "Home" });
      else if (route === "Home" && this.room.id) {
        this.$store.state.socket.emit("leave-room");
        this.$store.commit("RESET_ROOM");
      }
    },
  },
  mounted() {
    const roomId = this.$route.query.room;

    if (this.route === "Game" && !this.room.id)
      this.$router.push({ name: "Home" });

    if (roomId && roomId.length === 7) {
      let username;
      do {
        username = prompt("Enter a username to continue to the game.");
        if (!username || username.length < 1 || username.length > 11) {
          alert("Username must be between 2 and 11 characters.");
        }
      } while (!username || username.length < 1 || username.length > 11);
      if (username) {
        this.$store.state.socket.emit("join-room", {
          roomId,
          username,
        });
      }
    }
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
