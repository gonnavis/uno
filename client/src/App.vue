<template>
  <div id="app">
    <router-view />

    <div v-if="offline" class="offline">
      <div class="message">You are currently offline and cannot play.</div>
    </div>

    <div v-else-if="!$store.state.isConnected" class="connecting">
      <div class="loading">
        <card back />
        <card back />
        <card back />
        <card back />
        <card back />
      </div>

      <h1>Connecting to server...</h1>
    </div>
  </div>
</template>

<script>
import "@/api/socket";
import Card from "@/components/Card.vue";

export default {
  components: { Card },
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
    route(route) {
      if (route === "Game" && !this.room.id)
        return this.$router.push({ name: "Home" });
      else if (route === "Home" && this.room.id) {
        this.$store.state.socket.emit("leave-room");
        this.$store.commit("RESET_ROOM");
      }
    },
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

  .connecting {
    @extend .offline;
    background: radial-gradient(
      circle,
      rgb(192, 34, 26) 0%,
      rgb(146, 25, 19) 60%,
      rgb(109, 16, 11) 100%
    );

    @media screen and (max-width: 900px) {
      .loading * {
        margin-left: -30px !important;

        &:nth-child(1) {
          margin-left: 0 !important;
        }
      }

      h1 {
        margin-top: 37vh !important;
      }
    }

    h1 {
      position: absolute;
      font-weight: bold;
      color: white;
      font-size: 2rem;
      margin-top: 30vh;
    }

    .loading {
      display: flex;

      * {
        margin-left: -60px;
        animation: lift 2s ease-in-out infinite;

        &:nth-child(1) {
          margin-left: 0;
        }

        &:nth-child(2) {
          animation-delay: 0.4s;
        }

        &:nth-child(3) {
          animation-delay: 0.8s;
        }

        &:nth-child(4) {
          animation-delay: 1.2s;
        }

        &:nth-child(5) {
          animation-delay: 1.6s;
        }

        @keyframes lift {
          from {
            transform: translateY(0);
          }

          25% {
            transform: translateY(-25px);
          }

          50%,
          to {
            transform: translateY(0);
          }
        }
      }
    }
  }
}
</style>
