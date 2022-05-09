/*
 * popup.js
 * @Github ZiuChen
 * Released under the MIT license
 */

const CollectBar = {
  data() {
    return {
      collectList: [],
    }
  },
  created() {
    this.initCollectList()
  },
  methods: {
    async initCollectList() {
      this.collectList = await loadStorage("COLLECT").then((res) => {
        return res
      })
    },
    handleCollectClick(collectObj) {
      switch (collectObj.type) {
        case "text":
          copyText(collectObj.content)
          return
        case "image":
          copyImage(collectObj.content)
          return
        case "link":
          window.open(collectObj.content)
          mdui.snackbar("链接已打开")
          return
      }
    },
    handleCollectRemove(collectObj) {
      if (this.collectList.length === 1) {
        document.querySelector(".mdui-tooltip-open").remove() // bug: last collect removed, tooltip wont disappear
      }
      this.collectList.splice(this.collectList.indexOf(collectObj), 1)
      updateStorage("COLLECT", this.collectList)
    },
  },
}

const SettingBar = {
  data() {
    return {
      config: {},
      NAMETABLE: [
        {
          id: "Ava",
          name: "向晚",
        },
        {
          id: "Bella",
          name: "贝拉",
        },
        {
          id: "Carol",
          name: "珈乐",
        },
        {
          id: "Diana",
          name: "嘉然",
        },
        {
          id: "Eileen",
          name: "乃琳",
        },
      ],
      COMMONCONFIGTABLE: [
        {
          id: "generateBait",
          type: "radio",
          name: "诱饵",
        },
        {
          id: "collectEnabled",
          type: "radio",
          name: "收藏",
        },
        {
          id: "speed",
          type: "text",
          name: "速度",
        },
      ],
    }
  },
  created() {
    this.initConfig()
  },
  methods: {
    async initConfig() {
      this.config = await loadStorage("CONFIG").then((res) => {
        console.log(res) // FIXME: debugging
        return res
      })
    },
    async handleEnabledChange(e) {
      let target = e.target
      for (let actor of Object.keys(this.config.actors)) {
        if (actor === target.name.toLowerCase()) {
          this.config.actors[actor]["enabled"] = target.checked
        }
      }
      return await updateStorage("CONFIG", this.config)
    },
    async handleOptionChange(e) {
      let target = e.target
      for (let actor of Object.keys(this.config.actors)) {
        if (actor === target.name.toLowerCase()) {
          this.restoreOptions(actor) // single option, set other options to false
          this.config.actors[actor]["options"][target.className] =
            target.checked
        }
      }
      return await updateStorage("CONFIG", this.config)
    },
    async handleCommonConfigChange(e) {
      let target = e.target
      this.COMMONCONFIGTABLE.forEach((CONFIG) => {
        if (target.name === CONFIG.id) {
          let value // number | boolen
          if (CONFIG.type === "radio") {
            value = target.checked
          } else if (CONFIG.type === "text") {
            value = target.value
          }
          this.config[target.name] = value
        }
      })
      return await updateStorage("CONFIG", this.config)
    },
    optionsFormatter(option) {
      switch (option) {
        case "dontFollow":
          return "不跟随"
        case "followClick":
          return "跟随单击"
        case "followDBClick":
          return "跟随双击"
        case "followMouse":
          return "跟随鼠标"
        default:
          return "未定义"
      }
    },
    restoreOptions(actor) {
      for (key of Object.keys(this.config.actors[actor]["options"])) {
        this.config.actors[actor]["options"][key] = false
      }
    },
  },
}

Vue.createApp(CollectBar).mount("#collect-bar")
Vue.createApp(SettingBar).mount("#setting-bar")

async function loadStorage(key) {
  // Already initialized in background.js
  return new Promise((resolve, reject) => {
    return chrome.storage.sync.get(key, (data) => {
      return resolve(JSON.parse(data[key]))
    })
  })
}

async function updateStorage(key, value) {
  let option = {}
  option[key] = JSON.stringify(value)
  return await chrome.storage.sync.set(option)
}

function copyText(text) {
  try {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text) // use navigator.clipboard
    } else {
      var textarea = document.createElement("textarea")
      document.body.appendChild(textarea)
      // hide this input area
      textarea.style.position = "fixed"
      textarea.style.clip = "rect(0 0 0 0)"
      textarea.style.top = "10px"
      // execute
      textarea.value = text
      textarea.select()
      document.execCommand("copy", true)
      // remove the input area
      document.body.removeChild(textarea)
    }
    mdui.snackbar("文本已复制到剪切板")
  } catch (err) {
    mdui.snackbar("出错了：" + err)
  }
}

async function copyImage(url) {
  // only support png other link will open directly
  try {
    const data = await fetch(url)
    const blob = await data.blob()
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ])
    mdui.snackbar("图片已复制到剪切板")
  } catch (err) {
    window.open(url)
    mdui.snackbar("出错了：" + err)
  }
}

/* Listener */
document.querySelector(".description-box").addEventListener("click", e => {
  switch (e.target.name) {
    case "github":
      window.open("https://github.com/ZiuChen/A-Soul-Browser-Pet")
      return
    case "gitee":
      window.open("https://gitee.com/ziuc/A-Soul-Browser-Pet")
      return
  }
})