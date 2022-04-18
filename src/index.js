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
    this.status = "thinking"; // thinking | chasing | happy | unhappy
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
    $(".actor.diana").on("dragover", (ev) => {
      // NECESSARY
      ev.originalEvent.preventDefault(); // prevent default behavior
    });
    $(".actor.diana").on("drop", (ev) => {
      let data = ev.originalEvent.dataTransfer.getData("text/uri-list");
      let content = data;
      if (!data) {
        content = ev.originalEvent.dataTransfer.getData("text/plain");
      }
      this.sendMessage("收到！");
      console.log(content);
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
      });
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
    readConfig((config) => {
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

/* Chrome API applied */
function getImgURL(src) {
  if (chrome.runtime.getURL !== undefined) {
    return chrome.runtime.getURL(src);
  } else {
    return src;
  }
}

function readConfig(calllBack) {
  chrome.storage.sync.get("CONFIG", function (data) {
    calllBack(JSON.parse(data["CONFIG"]));
  });
}

/* common functions */
function randInt(min, max) {
  return parseInt(Math.random() * (max - min + 1) + min, 10);
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

/* action effect */
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
function main() {
  readConfig((config) => {
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
      ev.dataTransfer.setData("text/uri-list", ev.target.href); // link
    } else if (ev.target.src !== undefined) {
      ev.dataTransfer.setData("text/uri-list", ev.target.src); // image link
    } else {
      ev.dataTransfer.setData("text/plain", ev.target.data); // plain text
    }
  },
  false
);
