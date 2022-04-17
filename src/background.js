const CONFIG = {
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
  speed: 250,
  hideBait: true,
};
chrome.storage.sync.get("CONFIG", (data) => {
  if (data["CONFIG"] === undefined) {
    chrome.storage.sync.set({ CONFIG: JSON.stringify(CONFIG) }, () => {
      console.log("CONFIG INIT!");
    });
  } else {
    console.log("CONFIG LOADED!");
  }
});
