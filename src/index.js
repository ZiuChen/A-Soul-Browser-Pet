/*
 * index.js
 * @Github ZiuChen
 * Released under the MIT license
 */
/* TABLES */
const NAMETABLE = ["ava", "bella", "carol", "diana", "eileen"];
const OPTIONSTABLE = [
  "followMouse",
  "followClick",
  "followDBClick",
  "dontFollow",
];
const TABLE = {
  ava: {
    bait: "bowl",
  },
  bella: {
    bait: "star",
  },
  carol: {
    bait: "knight",
  },
  diana: {
    bait: "candy",
  },
  eileen: {
    bait: "icecream",
  },
};

/* class definition */
class ASoul {
  constructor({ x, y, speed, actor }) {
    this.selector = `.actor.${actor}`;
    this.speed = speed; // px per second
    this.actor = actor; // diana | ava | bella | carol | eileen
    this.generateActor({ x: x, y: y });
    this.addEventListener();
    this.x = this.getPosition(this.selector).x;
    this.y = this.getPosition(this.selector).y;
    towardFollowMouse(this);
  }
  generateActor({ x, y }) {
    let img = document.createElement("img");
    img.src = getImgURL(`./static/img/${this.actor}/thinking.png`);
    img.alt = this.actor;
    img.draggable = false; // prevent native draggable event
    $(img)
      .css({ left: x, top: y })
      .addClass("actor")
      .addClass(this.actor)
      .addClass("draggable");
    $("body").append(img);
    beejdnd.init(); // draggable init
  }
  chase(bait) {
    this.removeMessage();
    anime.remove(this.selector); // only chase the lastest candy
    this.updateDirection(bait.x);
    anime({
      targets: this.selector,
      left: bait.x - 50,
      top: bait.y - 75,
      duration: (this.getDistance(bait.x, bait.y) / this.speed) * 1000,
      easing: "linear",
      update: () => {
        // call frequently when chasing
        this.changeStatus("chasing");
        this.x = this.getPosition(this.selector).x;
        this.y = this.getPosition(this.selector).y;
      },
      complete: () => {
        if (bait.hadEaten === false) {
          bait.eaten();
          this.changeStatus("happy");
        } else {
          this.changeStatus("unhappy");
        }
      },
    });
  }
  addEventListener() {
    // click on actor trigger events
    $(this.selector)
      .mousedown((e) => {
        this.changeStatus("interact_1");
      })
      .mouseup((e) => {
        this.updatePosition(this.getPosition(this.selector));
        let min = 2;
        let max = 5;
        let rand = parseInt(Math.random() * (max - min + 1) + min, 10);
        this.sendMessage();
        setTimeout(() => {
          this.changeStatus("interact_" + rand);
        }, 500);
      })
      // drag & drop event
      .on("dragover", (ev) => {
        // NECESSARY
        ev.originalEvent.preventDefault(); // prevent default behavior
      })
      .on("drop", (ev) => {
        this.sendMessage("收到！");
        let content = ev.originalEvent.dataTransfer.getData("text/plain");
        let title = "文本";
        let type = "text";
        try {
          // Image or Link innerHTML
          new URL(content);
          let splits = content.split("#");
          title = splits[splits.length - 1]; // avoid situation of link default have #
          content = content.split("#" + title)[0];
          if (isImg(content)) {
            type = "image";
          } else {
            type = "link";
          }
        } catch (err) {
          // plain text
          // do nothing
        }
        pushCollect(title, content, type, new Date().getTime());
      });
  }
  updateDirection(x) {
    if (x - 100 >= this.x) {
      // turn right
      anime({
        targets: this.selector,
        rotateY: "180deg",
      });
    } else {
      anime({
        targets: this.selector,
        rotateY: "360deg",
      });
    }
  }
  updatePosition({ x, y }) {
    this.x = x;
    this.y = y;
  }
  changeStatus(status) {
    $(this.selector).attr(
      "src",
      getImgURL(`./static/img/${this.actor}/${status}.png`)
    );
  }
  getPosition(selector) {
    return {
      x: parseInt($(selector).css("left").split("px")[0] - 50),
      y: parseInt($(selector).css("top").split("px")[0] - 50),
    };
  }
  getDistance(x, y) {
    let distance = Math.sqrt(
      Math.pow(x - this.x - 100, 2) + Math.pow(y - this.y - 125, 2) // Adaptive vaule adjustment
    );
    return distance;
  }
  async sendMessage(content) {
    $(`.message-box.${this.actor}`).remove(); // remove other message-boxs when generate
    await this.getRandMessage(this.actor).then((message) => {
      if (content !== undefined) {
        message = content;
      }
      let div = document.createElement("div");
      $(div)
        .css({
          left: this.x + 100,
          top: this.y + 50,
        })
        .addClass(`message-box ${this.actor}`)
        .append(`<p>${message}</p>`);
      $("body").append(div);
      setTimeout(() => {
        this.removeMessage(); // auto remove after append
      }, 1000);
    });
  }
  async removeMessage() {
    $(`.message-box.${this.actor}`).remove();
  }
  async getRandMessage(actorName) {
    const messageJSON = "./static/message.json";
    return await fetch(chrome.runtime.getURL(messageJSON))
      .then((RES) => RES.json())
      .then((data) => {
        let rand = randInt(0, data[actorName].length - 1); // choose one message return
        return data[actorName][rand];
      });
  }
}

class Bait {
  constructor({ x, y, type }) {
    this.id = new Date().getTime().toString();
    this.selector = "#" + this.id;
    this.fadeTime = 5000;
    this.x = x;
    this.y = y;
    this.type = type;
    this.hadEaten = false;
    this.generateBait(x, y);
  }
  generateBait(x, y) {
    // TODO: Add animation to candy generation
    let img = document.createElement("img");
    img.src = getImgURL(`./static/img/${this.type}.png`);
    img.draggable = false; // prevent native draggable event
    img.id = this.id;
    loadStorage("CONFIG").then((config) => {
      if (config.generateBait) {
        $(img).css({ display: "" });
      }
    });
    $(img)
      .css({ left: x - 75, top: y - 75, display: "none" })
      .addClass("bait");
    $("body").append(img);
    this.addFadeListener();
  }
  addFadeListener() {
    setTimeout(() => {
      $(this.selector).remove();
      this.hadEaten = true;
    }, this.fadeTime);
  }
  eaten() {
    $(this.selector).remove();
    this.hadEaten = true;
  }
}

/* Date prototype expand */
Date.prototype.format = function (fmt) {
  let ret;
  const opt = {
    "Y+": this.getFullYear().toString(),
    "M+": (this.getMonth() + 1).toString(),
    "D+": this.getDate().toString(),
    "H+": this.getHours().toString(),
    "m+": this.getMinutes().toString(),
    "S+": this.getSeconds().toString(),
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
};

/* Chrome API applied */
function getImgURL(src) {
  // transfer common url to extension link
  if (chrome.runtime.getURL !== undefined) {
    return chrome.runtime.getURL(src);
  } else {
    return src;
  }
}

async function loadStorage(key) {
  // same to popup.js > loadStorage
  return await chrome.storage.sync.get(key).then((data) => {
    return JSON.parse(data[key]);
  });
}

async function updateStorage(key, value) {
  // same to popup.js > updateStorage
  let option = {};
  option[key] = JSON.stringify(value);
  return await chrome.storage.sync.set(option);
}

/* common functions */
function randInt(min, max) {
  return parseInt(Math.random() * (max - min + 1) + min, 10);
}

function isImg(path) {
  return /\w.(png|jpg|jpeg|svg|webp|gif|bmp)$/i.test(path);
}

function documentListenerDebounce(fun, time) {
  let timeout = null; // debounce
  $(document).mousemove((e) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fun(e);
    }, time);
  });
}

/* collect relative */
async function pushCollect(title, data, type, timeStamp) {
  loadStorage("COLLECT").then((collect) => {
    collect.push({
      title: title,
      content: data,
      type: type,
      timeStamp: timeStamp,
      collectTime: new Date(timeStamp).format("YYYY-MM-DD HH:mm"),
    });
    updateStorage("COLLECT", collect);
  });
}

/* effect relative */
function followClick(actor) {
  $(document).mousedown((e) => {
    $(".bait").remove(); // only one candy appear
    Object.keys(TABLE).forEach((key) => {
      if (actor.actor === key) {
        let bait = new Bait({
          x: e.clientX,
          y: e.clientY,
          type: TABLE[key].bait,
        });
        actor.chase(bait);
      }
    });
  });
}

function followDBClick(actor) {
  $(document).dblclick((e) => {
    $(".bait").remove(); // only one candy appear
    Object.keys(TABLE).forEach((key) => {
      if (actor.actor === key) {
        let bait = new Bait({
          x: e.clientX,
          y: e.clientY,
          type: TABLE[key].bait,
        });
        actor.chase(bait);
      }
    });
  });
}

function followMouse(actor) {
  documentListenerDebounce((e) => {
    actor.chase({
      x: e.clientX,
      y: e.clientY,
      hadEaten: false,
      eaten: () => {
        return;
      },
    });
  }, 15);
}

function towardFollowMouse(actor) {
  documentListenerDebounce((e) => {
    actor.updateDirection(e.clientX);
  }, 15);
}

/* main */
async function main() {
  await loadStorage("CONFIG").then((config) => {
    NAMETABLE.forEach((actorName) => {
      let actorConfig = config.actors[actorName];
      if (actorConfig.enabled) {
        // enabled
        let actor = new ASoul({
          x: 0,
          y: $(window).height() - 100, // pic height
          speed: config.speed,
          actor: actorName,
        });
        if (actorConfig.options.followClick) {
          followClick(actor);
        }
        if (actorConfig.options.followDBClick) {
          followDBClick(actor);
        }
        if (actorConfig.options.followMouse) {
          followMouse(actor);
        }
      }
    });
  });
}

main();

document.addEventListener(
  "dragstart",
  (ev) => {
    if (ev.target.href !== undefined) {
      // link
      // pass title with #
      ev.dataTransfer.setData(
        "text/plain",
        ev.target.href + "#" + ev.target.innerText
      );
    } else if (ev.target.src !== undefined) {
      // image link
      ev.dataTransfer.setData("text/plain", ev.target.src + "#" + "图像");
    } else {
      // plain text
      ev.dataTransfer.setData("text/html", ev.target.data);
    }
  },
  false
);
