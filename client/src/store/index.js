import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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

const store = new Vuex.Store({
  state: {
    isMobile,
    windowWidth: 1920,
    windowHeight: 1080,
    socket: null,
    animateCards: [],
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
    SET_WINDOW_DIMENSIONS(state, { width, height }) {
      state.windowWidth = width;
      state.windowHeight = height;
    },
    ADD_ANIMATE_CARD(state, card) {
      state.animateCards = [...state.animateCards, card];
    },
    REMOVE_ANIMATE_CARD(state, index) {
      const cards = [...state.animateCards];
      cards.splice(index, 1);
      state.animateCards = cards;
    },
  },
  actions: {},
  modules: {},
});

const resizeObserver = new ResizeObserver(() => {
  store.commit("SET_WINDOW_DIMENSIONS", { width: window.innerWidth, height: window.innerHeight });
});

resizeObserver.observe(document.getElementsByTagName("html")[0]);

export default store;
