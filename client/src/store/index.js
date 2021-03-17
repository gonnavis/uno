import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    socket: null,
    room: {
      isHost: false,
      turn: "",
      pile: [],
      started: false,
      directionReversed: false,
      stack: 0,
      you: {},
      others: [],
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
