const App = {
  data() {
    return {
      keys: {
        followMouse: {
          id: "followMouse",
          name: "跟随鼠标",
        },
        followClick: {
          id: "followClick",
          name: "跟随点击",
        },
        dontFollow: {
          id: "dontFollow",
          name: "不跟随",
        },
      },
      actors: [
        {
          name_EN: "ava",
          name_ZH: "向晚",
          enable: true,
          followMouse: true,
          followClick: false,
          dontFollow: false,
        },
        {
          name_EN: "bella",
          name_ZH: "贝拉",
          enable: true,
          followMouse: true,
          followClick: false,
          dontFollow: false,
        },
        {
          name_EN: "carol",
          name_ZH: "珈乐",
          enable: true,
          followMouse: true,
          followClick: false,
          dontFollow: false,
        },
        {
          name_EN: "diana",
          name_ZH: "嘉然",
          enable: true,
          followMouse: true,
          followClick: false,
          dontFollow: false,
        },
        {
          name_EN: "eileen",
          name_ZH: "乃琳",
          enable: true,
          followMouse: true,
          followClick: false,
          dontFollow: false,
        },
      ],
    };
  },
  methods: {
    handleChange: function (e) {
      // Update Config
      let target = e.target;
      this.actors.forEach((actor) => {
        if (actor.name_EN === target.name) {
          Object.keys(this.keys).forEach((key) => {
            actor[key] = false;
          });
          actor[target.className] = target.checked;
        }
      });
    },
  },
  created: function () {
    console.log("MOUNTED");
    console.log(chrome.runtime);
    // chrome.runtime.sendMessage({ val1, val2 }, (response) => {
    //   console.log(response);
    // });
    // chrome.storage.sync.get("CONFIG", function (data) {
    //   console.log(data);
    // });
  },
};

Vue.createApp(App).mount("#app-setting");

window.addEventListener("message", function (event) {
  console.log(event);
  event.source.postMessage({ result: "asdasdasd" }, event.origin);
  console.info("message received in sandbox: " + event.data.message);
});
