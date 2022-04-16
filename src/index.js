const TABLE = {
  ava: {
    bait: "bowl",
    speed: 250,
  },
  bella: {
    bait: "star",
    speed: 250,
  },
  caro: {
    bait: "knight",
    speed: 250,
  },
  diana: {
    bait: "candy",
    speed: 250,
  },
  eileen: {
    bait: "icecream",
    speed: 250,
  },
};
class ASoul {
  constructor({ x, y, speed, actor }) {
    this.selector = `.${actor}`;
    this.speed = speed; // px per second
    this.status = "thinking"; // thinking | chasing | happy | unhappy
    this.actor = actor; // diana | ava | bella | carol | eileen
    this.generateActor({ x: x, y: y });
    this.x = this.getCurrentPosition(this.selector).x;
    this.y = this.getCurrentPosition(this.selector).y;
  }
  generateActor({ x, y }) {
    let img = document.createElement("img");
    img.src = `./static/img/${this.actor}/thinking.png`;
    $(img)
      .css({ left: x, top: y })
      .addClass("actor")
      .addClass(this.actor)
      .addClass("draggable");
    $("body").append(img);
    beejdnd.init();
  }
  chase(bait) {
    anime.remove(this.selector); // only chase the lastest candy
    this.updateDirection(bait.x);
    this.changeStatus("chasing");
    anime({
      targets: this.selector,
      left: bait.x - 50,
      top: bait.y - 75,
      duration: (this.getDistance(bait.x, bait.y) / this.speed) * 1000,
      easing: "linear",
      update: () => {
        // console.log(`bait.x: ${bait.x}, this.x: ${this.x}`);
        // console.log(`bait.y: ${bait.y}, this.y: ${this.y}`);
        this.x = this.getCurrentPosition(this.selector).x;
        this.y = this.getCurrentPosition(this.selector).y;
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
  changeStatus(status) {
    $(this.selector).attr("src", `./static/img/${this.actor}/${status}.png`);
  }
  getCurrentPosition(selector) {
    return {
      x: parseInt($(selector).css("left").split("px")[0] - 50),
      y: parseInt($(selector).css("top").split("px")[0] - 50),
    };
  }
  getDistance(x, y) {
    console.log(`bait.x: ${x} bait.y: ${y}`);
    console.log(`this.x: ${this.x} this.y: ${this.y}`);
    let distance = Math.sqrt(
      Math.pow(x - this.x - 100, 2) + Math.pow(y - this.y - 125, 2) // Adaptive vaule adjustment
    );
    console.log(`distance: ${distance}`);
    return distance;
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
    img.src = `./static/img/${this.type}.png`;
    img.id = this.id;
    $(img)
      .css({ left: x - 75, top: y - 75 })
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

function followClick(actor) {
  $(document).mousedown((e) => {
    $(".bait").remove(); // only one candy appear
    Object.keys(TABLE).forEach((key) => {
      if (actor.actor === key) {
        let bait = new Bait({ x: e.pageX, y: e.pageY, type: TABLE[key].bait });
        actor.chase(bait);
      }
    });
  });
}

function followArrow(actor) {
  let timeout = null; // debounce
  $(document).mousemove((e) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      actor.chase({
        x: e.pageX,
        y: e.pageY,
        hadEaten: false,
        eaten: () => {
          return;
        },
      });
    }, 10);
  });
}

function main() {
  let ava = new ASoul({ x: 160, y: 100, speed: 150, actor: "ava" });
  let bella = new ASoul({ x: 180, y: 200, speed: 200, actor: "bella" });
  let carol = new ASoul({ x: 220, y: 400, speed: 300, actor: "carol" });
  let diana = new ASoul({ x: 140, y: 0, speed: 250, actor: "diana" });
  let eileen = new ASoul({ x: 200, y: 300, speed: 250, actor: "eileen" });
  followClick(diana);
  // followClick(bella);
}

main();
