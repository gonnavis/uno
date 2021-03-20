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
        v-for="option in options[currentLevel]"
        :key="option.action + option.level"
        :action="option.action"
        :graphic="option.graphic"
        @click.native="option.level ? (currentLevel = option.level) : null"
      />
    </div>
  </section>
</template>

<script>
import UMenuCard from "@/components/Menu/UMenuCard.vue";

export default {
  components: { UMenuCard },
  name: "Home",
  data() {
    return {
      currentLevel: "main",
      options: {
        mainTitle: "Main Menu",
        main: [
          {
            action: "Solo Play",
            graphic: require("@/assets/solo.jpg"),
            level: "solo",
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
        soloTitle: "Solo Games",
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
          },
        ],
        settingsTitle: "Settings",
        settings: [],
      },
    };
  },
  methods: {
    createRoom() {
      if (this.username.length < 1 || this.username.length > 11) return;

      localStorage.setItem("username", this.username);
      this.$store.state.socket.emit("create-room", this.username);
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

  .create-btn {
    width: 100%;
    background-color: #ffd000;
    padding: 10px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.4em;
    transition: background-color 0.2s ease;
    outline: none;
    margin-bottom: 10px;

    &:hover,
    &:focus {
      background-color: #ff7b00;
    }
  }

  .container {
    width: max(40%, 400px);
    display: flex;
    flex-direction: column;

    @media screen and (max-width: $mobile) {
      width: 64%;
    }

    p {
      margin: auto;
    }
  }

  .input {
    padding: 6px;
    border-radius: 8px;
    color: black;
    width: 100%;
    display: flex;
    justify-content: space-between;
    background-color: white;

    input {
      width: 82%;
      font-size: 1.3em;
      padding: 4px;
      outline: none;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;

    label {
      font-size: 1.05em;
      margin-bottom: 2px;
      font-weight: 400;
    }

    button {
      width: 18%;
      background-color: #ee151f;
      color: white;
      border-radius: 5px;
      outline: none;
      transition: background-color 0.2s ease;

      &:hover,
      &:focus {
        background-color: #b9161e;
      }
    }
  }
}
</style>