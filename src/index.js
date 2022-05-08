/*
 * index.js
 * @Github ZiuChen
 * Released under the MIT license
 */
/* TABLES */
const NAMETABLE = ["ava", "bella", "carol", "diana", "eileen"]
const OPTIONSTABLE = [
  "followMouse",
  "followClick",
  "followDBClick",
  "dontFollow",
]
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
}
const POSITIONS = [
  {
    x: 0,
    y: $(window).height() - 100,
  },
  {
    x: 0,
    y: 0,
  },
  {
    x: $(window).width() - 100,
    y: 0,
  },
  {
    x: $(window).width() - 100,
    y: $(window).height() - 100,
  },
  {
    x: ($(window).width() - 100) / 2,
    y: $(window).height() - 100,
  },
]

/* Class Definition */
class ASoul {
  constructor({ x, y, speed, actor }) {
    this.selector = ".actor-asoul." + actor
    this.speed = speed // px per second
    this.actor = actor // diana | ava | bella | carol | eileen
    this.generateActor({ x: x, y: y })
    this.addClickEventListener()
    this.x = this.getPosition(this.selector).x
    this.y = this.getPosition(this.selector).y
  }
  generateActor({ x, y }) {
    let img = document.createElement("img")
    img.alt = this.actor
    img.draggable = false // prevent native draggable event
    $(img)
      .addClass("actor-asoul")
      .addClass("draggable")
      .addClass(this.actor)
      .css({ left: x, top: y })
    $("body").append(img)
    this.updateStatus("thinking")
    beejdnd.init() // draggable init
    Interactions.facingToMouse(this)
  }
  chase(bait) {
    anime.remove(this.selector) // only chase the lastest candy
    this.removeMessage(this.actor)
    this.updateDirection(bait.x)
    this.updateStatus("chasing")
    anime({
      targets: this.selector,
      left: bait.x - 50,
      top: bait.y - 75,
      duration: (this.getDistanceToBait(bait.x, bait.y) / this.speed) * 1000,
      easing: "linear",
      update: () => {
        // call frequently when chasing
        this.x = this.getPosition(this.selector).x
        this.y = this.getPosition(this.selector).y
      },
      complete: () => {
        if (bait.hadEaten === false) {
          bait.eaten()
          this.updateStatus("happy")
        } else {
          this.updateStatus("unhappy")
        }
      },
    })
  }
  addClickEventListener() {
    // click on actor trigger events
    $(this.selector)
      .mousedown((e) => {
        this.removeMessage(this.actor)
        this.updateStatus("interact_1")
      })
      .mouseup((e) => {
        this.updatePosition(this.getPosition(this.selector))
        this.sendMessage()
        setTimeout(() => {
          this.updateStatus("rand")
        }, 500)
      })
      // drag & drop event
      .on("dragover", (ev) => {
        // NECESSARY
        ev.originalEvent.preventDefault() // prevent default behavior
      })
  }
  addDropEventListener() {
    $(this.selector).on("drop", (ev) => {
      processDropEvent(ev)
      this.sendMessage("收到！")
      this.updateStatus("rand")
    })
    async function processDropEvent(ev) {
      let content = ev.originalEvent.dataTransfer.getData("text/plain")
      let title = "文本"
      let type = "text"
      try {
        // Image or Link innerHTML
        new URL(content)
        let splits = content.split("#")
        title = splits[splits.length - 1] // avoid situation of link default have #
        content = content.split("#" + title)[0]
        if (isImg(content)) {
          type = "image"
        } else {
          type = "link"
        }
      } catch (err) {
        // plain text
        // do nothing
      }
      await pushCollect(title, content, type, new Date().getTime())
    }
    async function pushCollect(title, data, type, timeStamp) {
      loadStorage("COLLECT").then((collect) => {
        collect.push({
          title: title,
          content: data,
          type: type,
          timeStamp: timeStamp,
          collectTime: new Date(timeStamp).format("YYYY-MM-DD HH:mm"),
        })
        updateStorage("COLLECT", collect)
      })
    }
  }
  getDistanceToBait(x, y) {
    let distance = Math.sqrt(
      Math.pow(x - this.x - 100, 2) + Math.pow(y - this.y - 125, 2) // Adaptive vaule adjustment
    )
    return distance
  }
  updateDirection(x) {
    if (x - 100 >= this.x) {
      // turn right
      anime({
        targets: this.selector,
        rotateY: "180deg",
      })
    } else {
      anime({
        targets: this.selector,
        rotateY: "360deg",
      })
    }
  }
  getPosition(selector) {
    return {
      x: parseInt($(selector).css("left").split("px")[0] - 50),
      y: parseInt($(selector).css("top").split("px")[0] - 50),
    }
  }
  updatePosition({ x, y }) {
    this.x = x
    this.y = y
  }
  updateStatus(status) {
    if (status === "rand") {
      status = "interact_" + randInt(2, 9).toString()
    }
    $(this.selector).attr(
      "src",
      getImgURL(`./static/img/${this.actor}/${status}.gif`)
    )
  }
  async sendMessage(content) {
    await this.getRandMessage(this.actor).then((message) => {
      if (content !== undefined) {
        message = content
      }
      let div = document.createElement("div")
      let timeStamp = new Date().getTime()
      $(div)
        .addClass("message-box-asoul")
        .addClass(this.actor)
        .addClass(timeStamp.toString())
        .css({
          left: this.x + 100,
          top: this.y + 50,
        })
        .append(`<p>${message}</p>`)
      $("body").append(div)
      setTimeout(() => {
        this.removeMessage(this.actor, timeStamp) // auto remove after append
      }, 1000)
    })
  }
  async removeMessage(actorName, timeStamp) {
    if (timeStamp === undefined) {
      $(`.message-box-asoul.${actorName}`).remove()
    } else {
      $(`.message-box-asoul.${actorName}.${timeStamp}`).remove()
    }
  }
  async getRandMessage(actorName) {
    return await fetch(chrome.runtime.getURL("static/message.json"))
      .then((RES) => RES.json())
      .then((json) => {
        let rand = randInt(0, json[actorName].length - 1) // choose one message return
        return json[actorName][rand]
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

class Bait {
  constructor({ x, y, type }) {
    this.id = new Date().getTime().toString()
    this.selector = "#" + this.id
    this.fadeTime = 5000
    this.x = x
    this.y = y
    this.type = type
    this.hadEaten = false
    this.generateBait(x, y)
  }
  generateBait(x, y) {
    // TODO: Add animation to candy generation
    let img = document.createElement("img")
    img.src = getImgURL(`./static/img/${this.type}.png`)
    img.draggable = false // prevent native draggable event
    img.id = this.id
    loadStorage("CONFIG").then((config) => {
      if (config.generateBait) {
        $(img).css({ display: "" })
      }
    })
    $(img)
      .addClass("bait-asoul")
      .css({ left: x - 75, top: y - 75, display: "none" })
    $("body").append(img)
    this.addFadeListener()
  }
  addFadeListener() {
    setTimeout(() => {
      $(this.selector).remove()
      this.hadEaten = true
    }, this.fadeTime)
  }
  eaten() {
    $(this.selector).remove()
    this.hadEaten = true
  }
}

/* Chrome API Applied */
function getImgURL(src) {
  // transfer common url to extension link
  if (chrome?.runtime?.getURL) {
    return chrome.runtime.getURL(src)
  } else {
    return src
  }
}

async function loadStorage(key) {
  // same to popup.js > loadStorage
  return new Promise((resolve, reject) => {
    return chrome.storage.sync.get(key, (data) => {
      return resolve(JSON.parse(data[key]))
    })
  })
}

async function updateStorage(key, value) {
  // same to popup.js > updateStorage
  let option = {}
  option[key] = JSON.stringify(value)
  return await chrome.storage.sync.set(option)
}

/* common functions */
function randInt(min, max) {
  return parseInt(Math.random() * (max - min + 1) + min, 10)
}

function isImg(path) {
  return /\w.(png|jpg|jpeg|svg|webp|gif|bmp)$/i.test(path)
}

function debounceFunc(fun, time) {
  let timeout = null // debounce
  $(document).mousemove((e) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      fun(e)
    }, time)
  })
}

/* Date prototype Expand */
Date.prototype.format = function (fmt) {
  let ret
  const opt = {
    "Y+": this.getFullYear().toString(),
    "M+": (this.getMonth() + 1).toString(),
    "D+": this.getDate().toString(),
    "H+": this.getHours().toString(),
    "m+": this.getMinutes().toString(),
    "S+": this.getSeconds().toString(),
  }
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt)
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      )
    }
  }
  return fmt
}

/* Interactions */
let Interactions = {
  facingToMouse: function (actor) {
    debounceFunc((e) => {
      actor.updateDirection(e.clientX)
    }, 85)
  },
  followClick: function (actor) {
    $(document).mousedown((e) => {
      $(".bait-asoul").remove() // only one candy appear
      Object.keys(TABLE).forEach((key) => {
        if (actor.actor === key) {
          let bait = new Bait({
            x: e.clientX,
            y: e.clientY,
            type: TABLE[key].bait,
          })
          actor.chase(bait)
        }
      })
    })
  },
  followDBClick: function (actor) {
    $(document).dblclick((e) => {
      $(".bait-asoul").remove() // only one candy appear
      Object.keys(TABLE).forEach((key) => {
        if (actor.actor === key) {
          let bait = new Bait({
            x: e.clientX,
            y: e.clientY,
            type: TABLE[key].bait,
          })
          actor.chase(bait)
        }
      })
    })
  },
  followMouse: function (actor) {
    debounceFunc((e) => {
      actor.chase({
        x: e.clientX,
        y: e.clientY,
        hadEaten: false,
        eaten: () => {
          return
        },
      })
    }, 75)
  },
}

/* Drag & Collect */
function addDragListener() {
  document.addEventListener(
    "dragstart",
    (ev) => {
      if (ev.target.href !== undefined) {
        // link
        // pass title with #
        let title = ev.target.innerText
        if (title === "") {
          title = "链接"
        }
        ev.dataTransfer.setData("text/plain", ev.target.href + "#" + title)
      } else if (ev.target.src !== undefined) {
        // image link
        ev.dataTransfer.setData("text/plain", ev.target.src + "#" + "图像")
      } else {
        // plain text
        ev.dataTransfer.setData("text/html", ev.target.data)
      }
    },
    false
  )
}

/* Main */
async function main() {
  await loadStorage("CONFIG").then((config) => {
    let position = 0 // default position index = 0
    NAMETABLE.forEach((actorName) => {
      let actorConfig = config.actors[actorName]
      if (actorConfig.enabled) {
        // actor enabled, generate
        let actor = new ASoul({
          x: POSITIONS[position].x,
          y: POSITIONS[position].y,
          speed: config.speed,
          actor: actorName,
        })
        position += 1
        // add interaction
        for (let key of Object.keys(actorConfig.options)) {
          if (key === "dontFollow") break
          if (actorConfig.options[key]) {
            Interactions[key](actor)
          }
        }
        if (config.collectEnabled) {
          // accept drop event
          actor.addDropEventListener()
        }
      }
    })
    if (config.collectEnabled) {
      // enable drag event
      addDragListener()
    }
  })
}

main()
