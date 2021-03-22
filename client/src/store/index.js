import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const username = localStorage.getItem("username") || "";

const defaultRoom = {
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
};

export default new Vuex.Store({
  state: {
    socket: null,
    username,
    room: { ...defaultRoom },
  },
  mutations: {
    SET_SOCKET(state, socket) {
      state.socket = socket;
    },
    SET_ROOM(state, room) {
      state.room = room;
    },
    RESET_ROOM(state) {
      state.room = { ...defaultRoom };
    },
    SET_USERNAME(state, username) {
      state.username = username;
    },
  },
  actions: {},
  modules: {},
});
