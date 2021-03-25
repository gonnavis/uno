export default {
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
            func: () => this.createRoomSolo(),
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
        soloTitle: "Solo Game",
        solo: [],
        onlineTitle: "Online Games",
        online: [
          {
            action: "Join Room",
            graphic: require("@/assets/arrow.jpg"),
            func: () => (this.showJoinRoomModal = true),
          },
          {
            action: "Create Room",
            graphic: require("@/assets/plus.jpg"),
            func: () => (this.showCreateRoomModal = true),
          },
        ],
        onlineRoomTitle: "Online Room",
        onlineRoom: [],
        settingsTitle: "Settings",
        settings: [],
      },
    };
  },
};
