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
    img.src = `./static/${this.actor}/thinking.png`;
    $(img).css({ left: x, top: y }).addClass("actor").addClass(this.actor);
    $("body").append(img);
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
    $(this.selector).attr("src", `./static/${this.actor}/${status}.png`);
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
    img.src = `./static/${this.type}.png`;
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

function main() {
  let diana = new ASoul({ x: 140, y: 0, speed: 250, actor: "diana" });
  let ava = new ASoul({ x: 160, y: 100, speed: 150, actor: "ava" });
  let bella = new ASoul({ x: 180, y: 200, speed: 200, actor: "bella" });
  let eileen = new ASoul({ x: 200, y: 300, speed: 250, actor: "eileen" });
  let carol = new ASoul({ x: 220, y: 400, speed: 300, actor: "carol" });
  let followFlag = 1; // 0 | 1 | 2
  switch (followFlag) {
    case 1:
      $(document).click((e) => {
        $(".bait").remove(); // only one candy appear
        let candy = new Bait({ x: e.pageX, y: e.pageY, type: "candy" });
        diana.chase(candy);
        // let bowl = new Bait({ x: e.pageX, y: e.pageY, type: "bowl" });
        // ava.chase(bowl);
        // let star = new Bait({ x: e.pageX, y: e.pageY, type: "star" });
        // bella.chase(star);
        // let icecream = new Bait({ x: e.pageX, y: e.pageY, type: "icecream" });
        // eileen.chase(icecream);
        // let knight = new Bait({ x: e.pageX, y: e.pageY, type: "knight" });
        // carol.chase(knight);
      });
      return;

    case 2:
      let timeout = null; // debounce
      $(document).mousemove((e) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          diana.chase({
            x: e.pageX,
            y: e.pageY,
            hadEaten: false,
            eaten: () => {
              return;
            },
          });
        }, 10);
      });
      return;
  }
}

main();
