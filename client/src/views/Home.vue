<script>
import UMenuCard from "@/components/Menu/UMenuCard.vue";
import UMenuModal from "@/components/Menu/UMenuModal.vue";
import UMenuInput from "@/components/Menu/UMenuInput.vue";
import UMenuBtn from "@/components/Menu/UMenuBtn.vue";

import menuOptions from "@/mixins/menuOptions";

let observer;

export default {
  name: "Home",
  components: { UMenuCard, UMenuModal, UMenuInput, UMenuBtn },
  mixins: [menuOptions],
  data() {
    return {
      isMounted: false,
      formError: "",
      createRoomForm: {
        username: "",
        roomCode: "",
        settings: {
          stacking: false,
          forcePlay: false,
          bluffing: false,
          drawToPlay: false,
          public: false,
          maxPlayers: 4,
        },
      },
      joinRoomForm: {
        username: "",
        roomCode: "",
      },
      optionsWidth: 0,
      showCreateRoomModal: false,
      showJoinRoomModal: false,
      showSettingsModal: false,
      showPublicRoomsModal: false,
      publicRooms: [],
      fetchingPublicRooms: false,
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

      if (solo.length < room.maxPlayers && room.isHost) {
        solo.push({
          action: "Add Bot",
          graphic: require("@/assets/plus.jpg"),
          func: () => this.addBot(),
        });
      }

      if (this.currentLevel === "solo") {
        this.options.solo = solo;
      } else {
        this.options.onlineRoom = solo;
      }

      if (room.started) {
        this.$router.push({ name: "Game" });
      }

      if (room.id === "") {
        this.currentLevel = "online";
      }
    },
  },
  methods: {
    createRoom() {
      // validate form
      if (
        this.createRoomForm.username.length < 2 ||
        this.createRoomForm.username.length > 11
      )
        return (this.formError =
          "Username must be between 2 and 11 characters");
      if (
        this.createRoomForm.roomCode &&
        (this.createRoomForm.roomCode.length < 4 ||
          this.createRoomForm.roomCode.length > 12)
      )
        return (this.formError =
          "Room Code must be between 4 and 12 characters");

      this.currentLevel = "onlineRoom";
      this.showCreateRoomModal = false;
      this.formError = "";

      this.$store.state.socket.emit("create-room", this.createRoomForm);
    },
    createRoomSolo() {
      this.$store.state.socket.emit("create-room", {
        username: "You",
        settings: {
          stacking: false,
          forcePlay: false,
          bluffing: false,
          drawToPlay: false,
          public: false,
          maxPlayers: 4,
        },
      });
    },
    joinRoom() {
      // validate form
      if (
        this.joinRoomForm.username.length < 2 ||
        this.joinRoomForm.username.length > 11
      )
        return (this.formError =
          "Username must be between 2 and 11 characters");
      if (
        this.joinRoomForm.roomCode.length < 4 ||
        this.joinRoomForm.roomCode.length > 13
      )
        return (this.formError =
          "Room Code must be between 4 and 12 characters");

      this.currentLevel = "onlineRoom";
      this.showJoinRoomModal = false;
      this.formError = "";

      this.$store.state.socket.emit("join-room", this.joinRoomForm);
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
    backOptions() {
      this.options[this.currentLevel + "Back"]();
    },
    copyJoinRoomLink() {
      const link = `${window.location.origin}/?room=${this.room.id}`;
      window.navigator.clipboard
        .writeText(link)
        .then(() => alert("Copied!"))
        .catch((err) =>
          alert(`Sorry we couldn't copy the link to the clipboard: ${err}`)
        );
    },
    closeJoinRoomModal() {
      this.showJoinRoomModal = false;
      this.formError = "";

      if (this.currentLevel === "main") {
        this.$router.replace({ query: null });
      }
    },
    fetchPublicRooms() {
      this.$store.state.socket.emit("get-public-rooms");
      this.fetchingPublicRooms = true;
    },
  },
  mounted() {
    this.isMounted = true;

    observer = new ResizeObserver(() => {
      this.optionsWidth = this.$refs.options.clientWidth;
    });
    observer.observe(this.$refs.options);

    const roomCode = this.$route.query.room;
    if (roomCode) {
      this.joinRoomForm.roomCode = roomCode;
      this.showJoinRoomModal = true;
    }

    this.$store.state.socket.on("recieve-public-rooms", (rooms) => {
      this.publicRooms = rooms;
      this.fetchingPublicRooms = false;
    });
  },
  destroyed() {
    observer.disconnect();
    this.$store.state.socket.off("recieve-public-rooms");
  },
};
</script>

<template>
  <section class="home">
    <a
      class="watermark"
      href="https://freddienelson.co.uk"
      rel="noopener"
      target="_blank"
      >made by <span>Freddie</span></a
    >

    <header class="header">
      <img
        v-if="currentLevel === 'main'"
        class="logo"
        src="@/assets/logo.png"
        alt="Scuffed Uno"
      />
      <img
        v-else
        class="logo back"
        src="@/assets/back.png"
        alt="Back"
        @click="backOptions"
      />
      <h1 class="title">{{ options[currentLevel + "Title"] }}</h1>

      <div
        v-if="currentLevel === 'solo' || currentLevel === 'onlineRoom'"
        class="room-info"
      >
        <p class="code" v-if="currentLevel === 'onlineRoom'">
          Room Code: <span>{{ room.id }}</span>
          <button class="copy" @click="copyJoinRoomLink">Copy Link</button>
        </p>

        <u-menu-btn
          v-if="room.isHost && room.playerCount > 1"
          class="start-game-btn"
          @click="$store.state.socket.emit('start-game')"
        >
          Start Game
        </u-menu-btn>
      </div>
    </header>

    <u-menu-modal
      v-if="showCreateRoomModal"
      @close="
        showCreateRoomModal = false;
        formError = '';
      "
      title="Create Room"
    >
      <u-menu-input
        v-model="createRoomForm.username"
        label="Username (required)"
        placeholder="Your username..."
      />

      <u-menu-input
        v-model="createRoomForm.roomCode"
        label="Room Code (optional)"
        placeholder="Custom room code..."
      />

      <u-menu-input
        v-model="createRoomForm.settings.maxPlayers"
        :label="`Max Players (${createRoomForm.settings.maxPlayers})`"
        type="range"
      />

      <u-menu-input
        v-model="createRoomForm.settings.public"
        label="Public (shown in public rooms list)"
        type="checkbox"
      />

      <div class="rules">
        <u-menu-input
          v-model="createRoomForm.settings.forcePlay"
          label="Force Play"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomForm.settings.drawToPlay"
          label="Draw To Play"
          type="checkbox"
          class="rule"
        />
        <u-menu-input
          v-model="createRoomForm.settings.bluffing"
          label="Bluffing"
          type="checkbox"
          class="rule"
          style="opacity: 0.5; pointer-events: none"
        />
      </div>

      <div v-if="formError" class="response error">
        <p>{{ formError }}</p>
      </div>

      <u-menu-btn @click="createRoom">Create Room</u-menu-btn>
    </u-menu-modal>

    <u-menu-modal
      v-if="showJoinRoomModal"
      @close="closeJoinRoomModal"
      title="Join Room"
    >
      <u-menu-input
        v-model="joinRoomForm.username"
        label="Username (required)"
        placeholder="Your username..."
      />

      <u-menu-input
        v-model="joinRoomForm.roomCode"
        label="Room Code (required)"
        placeholder="Room code..."
      />

      <div v-if="formError" class="response error">
        <p>{{ formError }}</p>
      </div>

      <u-menu-btn @click="joinRoom()">Join Room</u-menu-btn>
    </u-menu-modal>

    <u-menu-modal
      v-if="showSettingsModal"
      title="Settings"
      class="settings-modal"
      hideClose
    >
      <u-menu-btn class="btn rounded-btn" @click="backOptions">
        Main Menu
      </u-menu-btn>
    </u-menu-modal>

    <u-menu-modal
      v-if="showPublicRoomsModal"
      @close="showPublicRoomsModal = false"
      class="public-rooms-modal"
    >
      <div class="room rooms-header">
        <div>
          <p class="host">Host</p>
          <p class="code">Code</p>
        </div>

        <div>
          <p class="players">Players</p>
          <u-menu-btn class="join-btn" style="opacity: 0; pointer-events: none"
            >Join</u-menu-btn
          >
        </div>
      </div>
      <div class="rooms">
        <div class="room" v-for="room in publicRooms" :key="room.code">
          <div>
            <p class="host">{{ room.host }}</p>
            <p class="code">{{ room.code }}</p>
          </div>

          <div>
            <p class="players">
              {{ room.playerCount }} / {{ room.maxPlayers }}
            </p>
            <u-menu-btn
              class="join-btn"
              @click="
                joinRoomForm.roomCode = room.code;
                showPublicRoomsModal = false;
                showJoinRoomModal = true;
              "
              >Join</u-menu-btn
            >
          </div>
        </div>
      </div>

      <u-menu-btn class="refresh-btn" @click="fetchPublicRooms"
        >Refresh</u-menu-btn
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
        :key="option.action + i || i"
        :action="option.action"
        :alwaysShowAction="option.alwaysShowAction || $store.state.isMobile"
        :graphic="option.graphic"
        @click.native="
          option.level ? (currentLevel = option.level) : null;
          option.func ? option.func() : null;
        "
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
$mobile: 900px;

.watermark {
  color: white;
  opacity: 0.5;
  font-size: clamp(1rem, 2vw, 1.3rem);
  position: absolute;
  bottom: 1.5vh;
  right: 1.1vw;
  font-weight: bold;

  span {
    text-decoration: underline;
  }
}

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
    height: MIN(18%, 120px);
    display: flex;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;

    .logo {
      margin-left: 10px;
      width: auto;
      height: 100%;
      user-select: none;
      -webkit-user-drag: none;
      transform: scale(0.9);

      &.back {
        cursor: pointer;
      }
    }

    .title {
      margin-left: clamp(5px, 2vw, 20px);
      font-size: clamp(1.7rem, 4vw, 2.5rem);
      font-weight: bold;
    }
  }

  .options {
    margin: auto;
    display: flex;

    @media screen and (max-width: $mobile) {
      padding-top: 65px;
    }

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

  // .rules-title {
  //   font-size: 1.6rem;
  //   font-weight: bold;
  //   margin: 1rem auto 0.5rem 0;
  // }

  .rules {
    display: flex;
    width: 100%;
    justify-content: space-between;

    .rule {
      width: auto;
      align-items: center;
    }
  }

  .room-info {
    margin-left: auto;
    margin-right: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;

    .code {
      font-size: CLAMP(1.1rem, 2.5vw, 1.5rem);
      font-weight: bold;
      color: rgba(255, 255, 255, 0.6);
      padding: 4px 0;

      span {
        color: #fff;
      }

      .copy {
        text-decoration: underline;
        font-weight: bold;
        margin-left: MIN(1vw, 12px);
        color: #53a944;
        outline: none;
        transition: color 0.2s ease;

        &:hover,
        &:focus {
          color: #50ff31;
        }
      }
    }

    .start-game-btn {
      font-size: CLAMP(1.2rem, 3vw, 1.8rem);
      border: 4px solid white;
      padding: 0 3vw;
      height: 85%;
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
    margin-bottom: 25px;

    p {
      margin-left: 3%;
    }

    &.error {
      background-color: rgba(255, 0, 0, 0.459);
      border: 2px solid rgb(255, 0, 0);
      color: rgb(255, 0, 0);
    }
  }

  .settings-modal {
    background: transparent;
    z-index: 0;
  }

  .public-rooms-modal {
    .refresh-btn {
      font-size: 1.3rem;
      padding: 0.9rem;
    }

    .rooms {
      width: 100%;
      display: flex;
      flex-direction: column;
      height: 60vh;
      overflow-y: scroll;

      &::-webkit-scrollbar {
        background: transparent;
        width: 7px;

        &::-webkit-scrollbar-thumb {
          border-radius: 3px;
          background-color: rgb(141, 141, 141);
        }
      }
    }

    .room {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 1rem;
      height: 3rem;
      margin: 0.4rem 0;
      position: relative;

      &.rooms-header {
        width: 100%;
        font-weight: bold;

        .join-btn {
          opacity: 0;
          pointer-events: none;
        }

        .players {
          margin-left: -7px;
        }
      }

      div {
        display: flex;
        align-items: center;
      }

      .code {
        position: absolute;
        margin-left: 8rem;
      }

      .host {
        max-width: 6rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .players {
        margin-right: 1.2rem;
      }

      .join-btn {
        font-size: 1rem;
        padding: 0.6rem 1.2rem;
        width: auto;
        background-color: rgb(22, 179, 43);

        &:hover {
          background-color: rgb(54, 138, 65);
        }
      }
    }
  }
}
</style>