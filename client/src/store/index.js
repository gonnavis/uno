import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    socket: null,
    room: {
      id: "",
      isHost: false,
      turn: "",
      pile: [],
      started: false,
      directionReversed: false,
      stack: 0,
      playerCount: 0,
      you: {},
      right: {},
      left: {},
      top: {},
      winner: {},
    },
  },
  mutations: {
    SET_SOCKET(state, socket) {
      state.socket = socket;
    },
    SET_ROOM(state, room) {
      state.room = room;
    },
  },
  actions: {},
  modules: {},
});
