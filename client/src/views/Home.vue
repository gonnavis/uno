<script>
import UMenuCard from "@/components/Menu/UMenuCard.vue";
import UMenuModal from "@/components/Menu/UMenuModal.vue";
import UMenuInput from "@/components/Menu/UMenuInput.vue";
import UMenuBtn from "@/components/Menu/UMenuBtn.vue";

export default {
  components: { UMenuCard, UMenuModal, UMenuInput, UMenuBtn },
  name: "Home",
  data() {
    return {
      isMounted: false,
      username: "",
      roomCode: "",
      maxPlayers: "4",
      optionsWidth: 0,
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
        solo: [],
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
        onlineRoomTitle: "Online Room",
        onlineRoom: [],
        settingsTitle: "Settings",
        settings: [],
      },
    };
  },
  computed: {
    room() {
      return this.$store.state.room;
    },
    optionsScale() {
      return Math.min(this.$store.state.windowWidth / 1500, 1);
    },
    optionsOffsetLeft() {
      const windowWidth = this.$store.state.windowWidth;
      if (this.isMounted && windowWidth < this.optionsWidth) {
        return (windowWidth - this.optionsWidth) / 2;
      }

      return 0;
    },
    optionsOffsetTop() {
      const windowHeight = this.$store.state.windowHeight;
      if (this.isMounted && windowHeight < this.$refs.options.clientHeight)
        return (windowHeight - this.$refs.options.clientHeight) / 2 + 10;

      return 0;
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

      if (solo.length < 4) {
        solo.push({
          action: "Add Bot",
          graphic: require("@/assets/plus.jpg"),
          func: () => this.addBot(),
        });
      }

      if (this.currentLevel === "solo") {
        this.options.solo = solo;
      } else {
        this.options.online = solo;
      }
    },
  },
  methods: {
    createRoom() {
      this.$store.state.socket.emit("create-room", this.username || "You");
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
  mounted() {
    this.isMounted = true;

    const observer = new ResizeObserver(() => {
      this.optionsWidth = this.$refs.options.clientWidth;
    });

    observer.observe(this.$refs.options);
  },
};
</script>

<template>
  <section class="home">
    <header class="header">
      <img class="logo" src="@/assets/logo.jpg" alt="Scuffed Uno" />
      <h1 class="title">{{ options[currentLevel + "Title"] }}</h1>
    </header>

    <u-menu-modal
      v-if="showCreateRoomModal"
      @close="showCreateRoomModal = false"
      title="Create Room"
    >
      <u-menu-input
        v-model="username"
        label="Username (required)"
        placeholder="Your username..."
      />

      <u-menu-input
        v-model="roomCode"
        label="Room Code (optional)"
        placeholder="Custom room code..."
        type="text"
      />

      <u-menu-input
        v-model="maxPlayers"
        :label="`Max Players (${maxPlayers})`"
        type="range"
      />

      <div class="settings"></div>

      <u-menu-btn
        @click="
          createRoom();
          showCreateRoomModal = false;
        "
        >Create Room</u-menu-btn
      >
    </u-menu-modal>

    <div
      ref="options"
      class="options"
      :style="{
        transform: `translate(${optionsOffsetLeft}px, ${optionsOffsetTop}px) scale(${optionsScale})`,
      }"
    >
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
        (currentLevel === 'solo' || currentLevel === 'onlineRoom') &&
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
  display: flex;
  flex-direction: column;

  .header {
    width: 100%;
    height: calc(min(15%, 120px));
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
      font-size: clamp(1.7rem, 4vw, 2.5rem);
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
    border: 4px solid white;
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