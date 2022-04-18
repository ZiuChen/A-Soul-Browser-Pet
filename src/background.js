const DEFAULTCONFIG = {
  speed: 250,
  generateBait: false,
  actors: {
    ava: {
      enabled: false,
      options: {
        followMouse: false,
        followClick: false,
        dontFollow: true,
      },
    },
    bella: {
      enabled: false,
      options: {
        followMouse: false,
        followClick: false,
        dontFollow: true,
      },
    },
    carol: {
      enabled: false,
      options: {
        followMouse: false,
        followClick: false,
        dontFollow: true,
      },
    },
    diana: {
      enabled: true,
      options: {
        followMouse: false,
        followClick: true,
        dontFollow: false,
      },
    },
    eileen: {
      enabled: false,
      options: {
        followMouse: false,
        followClick: false,
        dontFollow: true,
      },
    },
  },
};
chrome.storage.sync.get("CONFIG").then((data) => {
  if (data["CONFIG"] === undefined) {
    chrome.storage.sync.set({ CONFIG: JSON.stringify(DEFAULTCONFIG) }, () => {
      console.log("[background.js] CONFIG INIT!");
    });
  } else {
    console.log("[background.js] CONFIG LOADED!");
  }
});
chrome.storage.onChanged.addListener(function (changes, namespace) {
  chrome.storage.sync.get("CONFIG", (data) => {
    console.log(data["CONFIG"]);
  });
  console.log("[background.js] storage changed");
});
