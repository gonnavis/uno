<template>
  <div class="home">
    <div class="logo">
      <img src="@/assets/logo.jpg" alt="Scuffed Uno" />
      <h2>By Freddie</h2>
    </div>

    <div class="container">
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
          <input
            v-model="code"
            type="text"
            name="roomCode"
            minlength="8"
            maxlength="8"
            required
          />
          <button type="submit">Join</button>
        </div>
      </form>

      <p style="padding: 8px">Or</p>
      <button class="create-btn" @click="createRoom">Create Room</button>

      <div
        class="response"
        :class="{ error: response.error }"
        v-if="responseRecieved"
      >
        <p>
          {{
            (this.response.error ? "Error" : "Success") +
            ": " +
            this.response.message
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  props: {
    response: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  computed: {
    responseRecieved() {
      return !!this.response.message;
    },
  },
  data() {
    return {
      code: "",
      username: localStorage.getItem("username")
        ? localStorage.getItem("username")
        : "",
    };
  },
  methods: {
    createRoom() {
      if (this.username.length < 2 || this.username.length > 20) return;

      localStorage.setItem("username", this.username);
      this.$emit("create-room", this.username);
    },
    joinRoom() {
      if (this.username.length < 2 || this.username.length > 20) return;
      if (this.code.length !== 8) return;

      localStorage.setItem("username", this.username);
      this.$emit("join-room", { code: this.code, username: this.username });
    },
  },
};
</script>

<style lang="scss" scoped>
$mobile: 900px;

.home {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: #570001;
  color: white;
  overflow-y: scroll;

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

  .logo {
    display: flex;
    flex-direction: column;
    align-items: center;

    @media screen and (max-width: $mobile) {
      position: absolute;
      margin-top: -180px;
      left: -12px;
      width: 23vw;

      h2 {
        font-size: 90% !important;
      }
    }

    img {
      width: 65%;
    }

    h2 {
      font-weight: bold;
      font-size: 2.5em;
      margin-bottom: 15px;
    }

    $face: #ffdd00;
    $shadow: black;
    $shadow2: transparent;
  }
}
</style>