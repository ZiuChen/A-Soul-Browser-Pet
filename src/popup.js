const NAMETABLE = ["ava", "bella", "carol", "diana", "eileen"];
const OPTIONSTABLE = ["followMouse", "followClick", "dontFollow"];

async function listenTableChange() {
  NAMETABLE.forEach((name) => {
    $(`.${name}`).change(async (e) => {
      let actorName = e.currentTarget.classList[1]; // actor name
      let optionName = e.target.className; // changed option
      let optionStatus = e.target.checked;
      await loadConfig()
        .then((config) => {
          if (optionName === "enabled") {
            // enabled status changed
            config.actors[actorName].enabled = optionStatus;
          } else {
            // options changed
            OPTIONSTABLE.forEach((item) => {
              // turn all status to false firstly
              config.actors[actorName].options[item] = false;
            });
            config.actors[actorName].options[optionName] = optionStatus;
          }
          return config;
        })
        .then((newConfig) => {
          updateConfig(newConfig);
        });
      // additional effect
      if (optionName === "enabled") {
        let detailContainer = $(`.${actorName} .detail-custom-container`);
        if (!optionStatus) {
          // enabled
          detailContainer.hide();
        } else {
          detailContainer.show();
        }
      }
    });
  });
  $(".speed").change(async (e) => {
    // speed config changed
    await loadConfig()
      .then((config) => {
        config.speed = e.target.value; // DIFFERENCE POINT
        return config;
      })
      .then((newConfig) => {
        updateConfig(newConfig);
      });
  });
  $(".generateBait").change(async (e) => {
    // generateBait config changed
    await loadConfig()
      .then((config) => {
        config.generateBait = e.target.checked; // DIFFERENCE POINT
        return config;
      })
      .then((newConfig) => {
        updateConfig(newConfig);
      });
  });
  $(".positionValue").change(async (e) => {
    // positionValue config changed
    await loadConfig()
      .then((config) => {
        config.positionValue = e.target.value; // DIFFERENCE POINT
        return config;
      })
      .then((newConfig) => {
        updateConfig(newConfig);
      });
  });
}

async function loadConfig() {
  // Already initialized in background.js
  return await chrome.storage.sync.get("CONFIG").then((data) => {
    return JSON.parse(data["CONFIG"]);
  });
}

async function updateConfig(config) {
  return await chrome.storage.sync.set({ CONFIG: JSON.stringify(config) });
}

async function initTable() {
  await loadConfig().then((config) => {
    NAMETABLE.forEach((actorName) => {
      // init enabled status
      let enableStatus = config.actors[actorName].enabled;
      $(`.${actorName} .enabled`).get(0).checked = enableStatus;
      // init options status
      OPTIONSTABLE.forEach((optionName) => {
        let optionStatus = config.actors[actorName].options[optionName];
        $(`.${actorName} .${optionName}`).get(0).checked = optionStatus;
      });
      // hide options when disabled
      if (enableStatus) {
        // enabled
        $(`.${actorName} .detail-custom-container`).show();
      } else {
        $(`.${actorName} .detail-custom-container`).hide();
      }
    });
    $(".speed").get(0).value = config.speed;
    $(".generateBait").get(0).checked = config.generateBait;
    $(".positionValue").get(0).value = config.positionValue;
  });
}

initTable();
listenTableChange();
