<script>
export default {
  name: "UMenuModal",
  props: {
    title: {
      type: String,
      default: "Modal Title",
    },
  },
};
</script>

<template>
  <div class="modal-container">
    <div class="modal">
      <button class="close-btn" @click="$emit('close')">
        <div></div>
        <div></div>
      </button>

      <h1 class="title">{{ title }}</h1>
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-container {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 10;

  .modal {
    width: 100%;
    max-width: 800px;
    max-height: 100%;
    padding: 40px;
    background-color: white;
    border-radius: 15px;
    overflow-y: scroll;
    position: relative;
    color: black;
    display: flex;
    flex-direction: column;
    align-items: center;

    &::-webkit-scrollbar {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      width: 8px;
    }

    .close-btn {
      width: 25px;
      height: 25px;
      position: absolute;
      top: 20px;
      right: 15px;

      &:hover {
        div {
          background-color: rgb(110, 110, 110);
        }
      }

      div {
        background-color: rgb(163, 163, 163);
        width: 100%;
        height: 4px;
        border-radius: 3px;
        position: absolute;
        transition: background-color 0.2s ease;

        &:nth-of-type(1) {
          transform: rotate(45deg);
        }

        &:nth-of-type(2) {
          transform: rotate(-45deg);
        }
      }
    }

    .title {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 20px;
    }
  }
}
</style>