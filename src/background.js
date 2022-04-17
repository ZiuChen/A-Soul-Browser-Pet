const DEFAULTCONFIG = {
  speed: 250,
  generateBait: false,
  actors: {
    ava: {
      enabled: true,
      options: {
        followMouse: true,
        followClick: false,
        dontFollow: false,
      },
    },
    bella: {
      enabled: true,
      options: {
        followMouse: true,
        followClick: false,
        dontFollow: false,
      },
    },
    carol: {
      enabled: true,
      options: {
        followMouse: true,
        followClick: false,
        dontFollow: false,
      },
    },
    diana: {
      enabled: true,
      options: {
        followMouse: true,
        followClick: false,
        dontFollow: false,
      },
    },
    eileen: {
      enabled: true,
      options: {
        followMouse: true,
        followClick: false,
        dontFollow: false,
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
