<template>
  <div class="home">
    <h1><span>UNO</span></h1>
    <h2>By Freddie</h2>
    
    <form @submit.prevent="$emit('join-room', code)">
      <label for="roomCode">Room Code</label>
      <div>
        <input v-model="code" type="text" name="roomCode" minlength="8" maxlength="8" required>
        <button type="submit">Join</button>
      </div>
    </form>

    <button class="create-btn" @click="$emit('create-room')">Create Room</button>

    <div class="response" :class="{ error: response.error }" v-if="responseRecieved">
      <p>{{ (this.response.error ? "Error" : "Success") + ": " + this.response.message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  props: {
    response: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    responseRecieved() {
      return !!this.response.message;
    }
  },
  data() {
    return {
      code: ""
    }
  }
}
</script>

<style lang="scss" scoped>
@font-face {
  font-family:'Rig Bold Coarse'; 
  src:url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/209981/Rig-BoldCoarse.otf');
}

@font-face {
  font-family:'Rig Bold Extrude'; 
  src:url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/209981/Rig-BoldExtrude.otf');
}

@font-face {
  font-family:'Rig Bold Shadow'; 
  src:url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/209981/Rig-BoldShadow.otf');
}

@font-face {
  font-family:'Rig Bold Face'; 
  src:url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/209981/Rig-BoldFace.otf');
}

@font-face {
  font-family:'Rig Bold Inline'; 
  src:url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/209981/Rig-BoldInline.otf');
}

.home {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: #570001;
  padding-top: 9%;
  color: white;

  .response {
    width: max(30%, 350px);
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
    width: max(30%, 350px);
    background-color: #ffd000;
    padding: 10px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1.4em;
    transition: background-color .2s ease;
    outline: none;
    margin-bottom: 10px;

    &:hover, &:focus {
      background-color: #ff7b00;
    }
  }

  form {
    display: flex;
    flex-direction: column;
    width: max(30%, 350px);
    margin-bottom: 5px;

    label {
      font-size: 1.05em;
      margin-bottom: 2px;
      font-weight: 400;
    }

    div {
      padding: 6px;
      border-radius: 8px;
      color: black;
      width: 100%;
      display: flex;
      justify-content: space-between;
      background-color: white;
    }

    input {
      width: 82%;
      font-size: 1.3em;
      padding: 4px;
      outline: none;
    }

    button {
      width: 18%;
      background-color: #EE151F;
      color: white;
      border-radius: 5px;
      outline: none;
      transition: background-color .2s ease;

      &:hover, &:focus {
        background-color: #b9161e;
      }
    }
  }

  h2 {
    font-weight: bold;
    font-size: 2.5em;
    margin-bottom: 15px;
  }

  $face: #ffdd00;
  $shadow: black;
  $shadow2: transparent;

  h1 {
    font-family: 'Rig Bold Face';
    text-transform: uppercase;
    font-size: 12em;
    text-align: center;
    font-weight: normal;
    margin: 0;
    color: $face;
    position: relative;
    z-index: 2;
    transform: rotate(-10deg);
    margin-bottom: 20px;
    user-select: none;

    &::after {
      content: "";
      width: 120%;
      height: 110%;
      position: absolute;
      background-color: #EE151F;
      border-radius: 50%;
      z-index: -1;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -54%);
    }
  }

  span {
    -webkit-text-stroke: 8px white;
    
    &::after {
      font-family: 'Rig Bold Extrude';
      color: $shadow;
    }
    
    &:after {
      content: "UNO";
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      z-index: 1;
      font-weight: normal;
      text-shadow: none;
      -webkit-text-stroke: 4px white;
    }
  }
}
</style>