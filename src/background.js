/* default TABLEs */
const DEFAULTCONFIG = {
  speed: 250,
  generateBait: false,
  actors: {
    ava: {
      enabled: false,
      options: {
        followMouse: false,
        followClick: false,
        followDBClick: false,
        dontFollow: true,
      },
    },
    bella: {
      enabled: false,
      options: {
        followMouse: false,
        followClick: false,
        followDBClick: false,
        dontFollow: true,
      },
    },
    carol: {
      enabled: false,
      options: {
        followMouse: false,
        followClick: false,
        followDBClick: false,
        dontFollow: true,
      },
    },
    diana: {
      enabled: true,
      options: {
        followMouse: false,
        followClick: false,
        followDBClick: false,
        dontFollow: true,
      },
    },
    eileen: {
      enabled: false,
      options: {
        followMouse: false,
        followClick: false,
        followDBClick: false,
        dontFollow: true,
      },
    },
  },
};
const DEFAULTCOLLECT = [
  {
    title: "Text",
    content: `欢迎使用收藏功能，这是一条默认消息，可以点击右侧按钮删除。
    将任意文字/链接/图片拖拽到小然身上就可以把内容收藏到此处哦~`,
    type: "text",
    timeStamp: 1650340800000,
    collectTime: "2022-04-19 12:00",
  },
];

/* storage initialization */
chrome.storage.sync.get("CONFIG").then((data) => {
  if (data["CONFIG"] === undefined) {
    chrome.storage.sync.set({ CONFIG: JSON.stringify(DEFAULTCONFIG) }, () => {
      console.log("[background.js] CONFIG INIT!");
    });
  } else {
    console.log("[background.js] CONFIG LOADED!");
  }
});
chrome.storage.sync.get("COLLECT").then((data) => {
  if (data["COLLECT"] === undefined) {
    chrome.storage.sync.set({ COLLECT: JSON.stringify(DEFAULTCOLLECT) }, () => {
      console.log("[background.js] COLLECT INIT!");
    });
  } else {
    console.log("[background.js] COLLECT LOADED!");
  }
});
chrome.storage.onChanged.addListener(function (changes, namespace) {
  chrome.storage.sync.get("CONFIG", (data) => {
    // current storage
  });
  console.log("[background.js] storage changed");
});
