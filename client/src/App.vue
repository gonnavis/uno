<template>
  <div id="app">
    <router-view
      ref="router"
      @current-player="currentPlayer"
      @play-card="playCard"
      :currentPlayerId="currentPlayerId"
      :start="start"
      :socketId="socketId"
      :room="room"
      @start-game="startGame"
      @join-room="joinRoom"
      @create-room="createRoom"
      @draw-card="drawCard"
      @has-won="hasWon"
      @reset-game="resetGame"
      @cant-stack="cantStack"
      :response="response"
      :host="host"
      :winner="winner"
    />
  </div>
</template>

<script>
import io from "socket.io-client";
const socket = io(
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://uno-freddie.herokuapp.com/"
);

export default {
  name: "App",
  data() {
    return {
      roomId: "",
      start: false,
      host: null,
      currentPlayerId: "",
      response: {
        error: null,
        message: null,
      },
      room: {
        id: "",
        players: [],
      },
      socketId: "",
      winner: null,
    };
  },
  computed: {
    currentRoute() {
      return this.$route.name;
    },
  },
  watch: {
    currentRoute(val) {
      if (val === "Home" && this.room.id) {
        this.resetGame();
      }
    },
  },
  methods: {
    resetGame() {
      socket.emit("leave-game", this.socketId);

      this.room = {
        id: "",
        players: [],
      };

      this.winner = null;
      this.roomId = "";
      this.start = false;
      this.host = null;
      this.currentPlayerId = "";
    },
    joinRoom(data) {
      if (this.roomId) return;

      socket.emit("join-room", data);
    },
    createRoom(username) {
      socket.emit("create-room", username);
    },
    startGame() {
      socket.emit("start-game");
    },
    currentPlayer(id) {
      socket.emit("current-player", id);
    },
    playCard(data) {
      socket.emit("play-card", data);

      const { card } = data;

      if (card.number === 11) {
        socket.emit("plus-card-played", { id: data.nextPlayer, amount: 2 });
      } else if (card.color === "plus4") {
        socket.emit("plus-card-played", { id: data.nextPlayer, amount: 4 });
      } else if (card.number === 13) {
        socket.emit("reverse-card-played");
      }
    },
    drawCard(amount) {
      socket.emit("add-cards", {
        amount,
        id: this.socketId,
        skipIfReceiver: true,
      });
    },
    cantStack(amount) {
      socket.emit("add-cards", { amount, id: this.socketId });
    },
    hasWon() {
      socket.emit("has-won", this.socketId);
    },
  },
  mounted() {
    socket.on("connect", () => (this.socketId = socket.id));

    socket.on("player-disconnect", (id) => {
      const room = { ...this.room };

      const index = room.players.findIndex((playerId) => playerId === id);
      room.players.splice(index, 1);
      room.usernames.splice(index, 1);

      this.room = room;
    });

    socket.on("created-room", (room) => {
      this.room = room;
      this.host = true;

      this.$router.push({ name: "Game", query: { room: room.id } });
    });

    socket.on("join-room-response", (res) => {
      if (res.error) this.response = res;
      else {
        this.$router.push({ name: "Game", query: { room: this.room.id } });
      }
    });

    socket.on("start-the-game", () => {
      this.start = true;
    });

    socket.on("room-data", (data) => {
      this.room = data;
    });

    socket.on("current-player-update", (id) => {
      this.currentPlayerId = id;
    });

    socket.on("played-card", (data) => {
      this.$refs.router.otherPlayedCard(data.id, data.card);
    });

    socket.on("receive-cards", (data) => {
      this.$refs.router.giveCards(data);
    });

    socket.on("reverse-play-direction", () => {
      this.$refs.router.playDirectionReverse = !this.$refs.router
        .playDirectionReverse;
    });

    socket.on("give-cards", (data) => {
      if (data.id === this.socketId && data.skipIfReceiver) return;

      this.$refs.router.giveCards(
        data.amount,
        this.$refs.router.getPosFromId(data.id)
      );
    });

    socket.on("can-player-stack", ({ stack, amount }) => {
      this.$refs.router.checkIfPlayerCanStack(amount, stack);
    });

    socket.on("winner", (id) => {
      this.winner = id;
    });

    const roomCode = this.$route.query.room;

    if (roomCode) {
      this.$router.push({ name: "Home" });

      let username;
      do {
        username = prompt("Enter a username to continue to the game.");
        if (!username || username.length < 3 || username.length > 24) {
          alert("Username must be between 3 and 24 characters.");
        }
      } while (!username || username.length < 3 || username.length > 24);

      socket.emit("join-room", { code: roomCode, username });
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
  background-color: #780e09;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
</style>
