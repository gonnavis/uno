<template>
  <div class="home">
    <h1>Scuffed Uno</h1>
    <h2>By Freddie</h2>
    
    <form>
      <label for="roomCode">Room Code</label>
      <input type="text" name="roomCode">
      <button>Join</button>
    </form>

    <button class="create-btn">Create Room</button>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
}
</style>