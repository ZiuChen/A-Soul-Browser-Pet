/* default TABLEs */
const NAMETABLE = ["ava", "bella", "carol", "diana", "eileen"];
const OPTIONSTABLE = [
  "followMouse",
  "followClick",
  "followDBClick",
  "dontFollow",
];

/* Chrome API applied */
async function loadStorage(key) {
  // Already initialized in background.js
  return await chrome.storage.sync.get(key).then((data) => {
    return JSON.parse(data[key]);
  });
}

async function updateStorage(key, value) {
  let option = {};
  option[key] = JSON.stringify(value);
  return await chrome.storage.sync.set(option);
}

/* config tab functions */
async function listenConfigTableChange() {
  NAMETABLE.forEach((name) => {
    $(`.${name}`).change(async (e) => {
      let actorName = e.currentTarget.classList[1]; // actor name
      let optionName = e.target.className; // changed option
      let optionStatus = e.target.checked;
      await loadStorage("CONFIG")
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
          updateStorage("CONFIG", newConfig);
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
    await loadStorage("CONFIG")
      .then((config) => {
        config.speed = e.target.value; // DIFFERENCE POINT
        return config;
      })
      .then((newConfig) => {
        updateStorage("CONFIG", newConfig);
      });
  });
  $(".generateBait").change(async (e) => {
    // generateBait config changed
    await loadStorage("CONFIG")
      .then((config) => {
        config.generateBait = e.target.checked; // DIFFERENCE POINT
        return config;
      })
      .then((newConfig) => {
        updateStorage("CONFIG", newConfig);
      });
  });
}

async function initConfigTable() {
  await loadStorage("CONFIG").then((config) => {
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
  });
}

/* collect tab functions */
async function appendCollectStorage() {
  await loadStorage("COLLECT").then((collect) => {
    if (collect.length === 0) {
      // append empty status
      $(".collects ul").append(
        `<div class="collect-tip"> 暂时没有收藏内容哦~ </div>`
      );
      return;
    }
    sortByProp(collect, "timeStamp", false).then((data) => {
      // use timeStamp as the ID of each collect
      data.forEach((item) => {
        $(".collects ul").append(/* html */ `
        <li id="${item.timeStamp}" class="mdui-list-item mdui-ripple">
        <div class="mdui-list-item-content">
          <div class="mdui-list-item-title mdui-list-item-one-line collect-title"></div>
          <div class="mdui-list-item-text mdui-list-item-two-line">
            <span class="mdui-text-color-theme-text collect-collectTime">${item.collectTime}</span>
            <span class="mdui-text-color-theme-text collect-content"></span>
          </div>
        </div>
        <svg class="mdui-list-item-icon mdui-ripple collect-remove-icon" t="1650358949716" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="20746" width="200" height="200"><path d="M725.333333 128a85.333333 85.333333 0 0 1 85.333334 85.333333v682.666667l-298.666667-128-298.666667 128V213.333333a85.333333 85.333333 0 0 1 85.333334-85.333333h426.666666M348.586667 366.08L451.84 469.333333l-103.253333 102.826667 60.586666 60.586667L512 529.493333l102.826667 103.253334 60.586666-60.586667L572.16 469.333333l103.253333-103.253333-60.586666-60.16L512 408.746667 409.173333 305.92 348.586667 366.08z" fill="" p-id="20747"></path></svg>
        
        </li>`);
        $(`#${item.timeStamp} .collect-content`).text(item.content); // avoid text including <tags> parsed to html
        $(`#${item.timeStamp} .collect-title`).text(item.title);
      });
    });
  });
}

async function addCollectRemoveListener() {
  $(".collect-remove-icon").click(async (ev) => {
    let collectID =
      ev.target.parentElement.parentElement.id === ""
        ? ev.target.parentElement.id
        : ev.target.parentElement.parentElement.id; // cant get parent node sometimes
    $(`#${collectID}`).remove(); // remove this collect's DOM
    if ($(".collects ul li").length === 0) {
      // append empty status
      $(".collects ul").append(
        `<div class="collect-tip"> 暂时没有收藏内容哦~ </div>`
      );
    }
    await loadStorage("COLLECT").then(async (collect) => {
      await findByKey(collect, "timeStamp", parseInt(collectID)).then((res) => {
        collect.splice(collect.indexOf(res[0]), 1); // remove this collect
        updateStorage("COLLECT", collect);
      });
    });
  });
}

async function sortByProp(array, prop, order) {
  return await array.sort((obj1, obj2) => {
    if (order) {
      return obj1[prop] - obj2[prop];
    } else {
      return obj2[prop] - obj1[prop];
    }
  });
}

async function findByKey(array, key, value) {
  return await array.filter((item) => {
    return item[key] === value;
  });
}

/* enterence */
initConfigTable();
listenConfigTableChange();

appendCollectStorage().then(() => {
  // async NECESSARY
  addCollectRemoveListener();
});
