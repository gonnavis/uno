<template>
  <section class="home">
    <header class="header">
      <img class="logo" src="@/assets/logo.jpg" alt="Scuffed Uno" />
      <h1 class="title">{{ options[currentLevel + "Title"] }}</h1>
    </header>

    <!-- <div class="container">
      <label for="username">Username*</label>
      <div class="input username-input">
        <input
          v-model="username"
          type="text"
          name="username"
          minlength="2"
          maxlength="20"
          style="width: 100%"
        />
      </div>

      <form @submit.prevent="joinRoom">
        <hr style="margin: 22px 0" />
        <label for="roomCode">Room Code</label>
        <div class="input">
          <input v-model="code" type="text" name="roomCode" />
          <button type="submit">Join</button>
        </div>
      </form>

      <p style="padding: 8px">Or</p>
      <button class="create-btn" @click="createRoom">Create Room</button>
    </div> -->
    <div class="options">
      <u-menu-card
        v-for="(option, i) in options[currentLevel]"
        :key="option.action + i"
        :action="option.action"
        :alwaysShowAction="option.alwaysShowAction ? true : false"
        :graphic="option.graphic"
        @click.native="
          option.level ? (currentLevel = option.level) : null;
          option.func ? option.func() : null;
        "
      />
    </div>

    <button
      v-if="
        (currentLevel === 'solo' || currentLevel === 'online') &&
        room.isHost &&
        room.playerCount > 1
      "
      class="start-game-btn"
      @click="startGame"
    >
      Start Game
    </button>
  </section>
</template>

<script>
import UMenuCard from "@/components/Menu/UMenuCard.vue";

export default {
  components: { UMenuCard },
  name: "Home",
  data() {
    return {
      username: "Freddie",
      showCreateRoomModal: false,
      currentLevel: "main",
      options: {
        mainTitle: "Main Menu",
        main: [
          {
            action: "Solo Play",
            graphic: require("@/assets/solo.jpg"),
            level: "solo",
            func: () => this.createRoom(),
          },
          {
            action: "Online Play",
            graphic: require("@/assets/online.jpg"),
            level: "online",
          },
          {
            action: "Settings",
            graphic: require("@/assets/settings.jpg"),
            level: "settings",
          },
        ],
        soloTitle: "Solo Game",
        solo: [
          {
            action: "You",
            alwaysShowAction: true,
            graphic: require("@/assets/solo.jpg"),
          },
          {
            action: "Add Bot",
            graphic: require("@/assets/plus.jpg"),
            func: () => this.addBot(),
          },
        ],
        onlineTitle: "Online Games",
        online: [
          {
            action: "Join Room",
            graphic: require("@/assets/arrow.jpg"),
          },
          {
            action: "Create Room",
            graphic: require("@/assets/plus.jpg"),
            func: () => (this.showCreateRoomModal = true),
          },
        ],
        settingsTitle: "Settings",
        settings: [],
      },
    };
  },
  computed: {
    room() {
      return this.$store.state.room;
    },
  },
  watch: {
    room(room) {
      const players = ["You"];

      if (room.right) players.push(room.right.username);
      if (room.top) players.push(room.top.username);
      if (room.left) players.push(room.left.username);

      const solo = [];
      for (let i = 0; i < players.length; i++) {
        const username = players[i];

        solo.push({
          action: username,
          alwaysShowAction: true,
          graphic: require("@/assets/solo.jpg"),
          func: () => this.kickPlayer(i),
        });
      }

      if (this.currentLevel === "solo") {
        if (solo.length < 4) {
          solo.push({
            action: "Add Bot",
            graphic: require("@/assets/plus.jpg"),
            func: () => this.addBot(),
          });
        }

        this.options.solo = solo;
      } else {
        this.options.online = solo;
      }
    },
  },
  methods: {
    createRoom() {
      if (this.username.length < 1 || this.username.length > 11) return;

      localStorage.setItem("username", this.username);
      this.$store.state.socket.emit("create-room", this.username);
    },
    createRoomSolo() {
      this.createRoom();
    },
    joinRoom() {
      if (this.username.length < 1 || this.username.length > 11) return;
      if (this.code.length !== 7) return;

      localStorage.setItem("username", this.username);
      this.$store.state.socket.emit("join-room", {
        roomId: this.code,
        username: this.username,
      });
    },
    addBot() {
      this.$store.state.socket.emit("add-bot");
    },
    kickPlayer(i) {
      switch (i) {
        case 1:
          this.$store.state.socket.emit("kick-player", this.room.right.id);
          break;
        case 2:
          this.$store.state.socket.emit("kick-player", this.room.top.id);
          break;
        case 3:
          this.$store.state.socket.emit("kick-player", this.room.left.id);
          break;
      }
    },
    startGame() {
      this.$store.state.socket.emit("start-game");
      this.$router.push({ name: "Game" });
    },
  },
};
</script>

<style lang="scss" scoped>
$mobile: 900px;

img {
  user-select: none;
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
}

.home {
  width: 100%;
  height: 100%;
  color: white;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;

  .header {
    width: 100%;
    height: 120px;
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;

    .logo {
      width: auto;
      height: 100%;
      user-select: none;
      -webkit-user-drag: none;
    }

    .title {
      margin-left: 30px;
      font-size: 2.5rem;
      font-weight: bold;
    }
  }

  .options {
    margin: auto;
    display: flex;

    * {
      margin-right: -100px;

      &:hover {
        margin-right: 20px;
      }

      &:last-of-type {
        margin-right: 0;

        &:hover {
          margin-left: 120px;
        }
      }
    }
  }

  .start-game-btn {
    padding: 15px 25px;
    font-size: 2rem;
    position: absolute;
    bottom: 3vh;
    left: 0;
    right: 0;
    margin: 0 auto;
    background-color: #ff520d;
    border: 2px solid white;
    border-radius: 8px;
    font-weight: bold;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #e72300;
    }
  }

  .response {
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    background-color: rgba(0, 255, 64, 0.459);
    border: 2px solid rgb(0, 255, 64);
    border-radius: 8px;
    color: rgb(0, 255, 64);
    font-weight: bold;
    font-size: 1.1em;

    p {
      margin-left: 3%;
    }

    &.error {
      background-color: rgba(255, 0, 0, 0.459);
      border: 2px solid rgb(255, 0, 0);
      color: rgb(255, 0, 0);
    }
  }
}
</style>