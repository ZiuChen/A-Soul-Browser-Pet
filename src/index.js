class Diana {
  constructor(selector) {
    this.selector = selector;
    this.speed = 250; // px per second
    this.status = "unhappy"; // thinking | chasing | happy | unhappy
    this.x = this.getCurrentPosition(selector).x;
    this.y = this.getCurrentPosition(selector).y;
  }
  chase(candy) {
    let x = candy.x;
    let y = candy.y;
    anime.remove(this.selector); // only chase the lastest candy
    this.updateDirection(x);
    this.changeStatus("chasing");
    anime({
      targets: this.selector,
      left: x - 50,
      top: y - 75,
      duration: (this.getDistance(x, y) / this.speed) * 1000,
      easing: "linear",
      update: () => {
        this.x = this.getCurrentPosition(this.selector).x;
        this.y = this.getCurrentPosition(this.selector).y;
        if (
          this.x + 100 === candy.x &&
          this.y + 125 === candy.y &&
          candy.hadEaten === false
        ) {
          candy.eaten();
          this.changeStatus("happy");
        } else if (
          this.x + 100 === candy.x &&
          this.y + 125 === candy.y &&
          candy.hadEaten === true
        ) {
          this.changeStatus("unhappy");
        }
      },
    });
  }
  updateDirection(x) {
    if (x >= this.x) {
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
    $(this.selector).attr("src", `./static/${status}.png`);
  }
  getCurrentPosition(selector) {
    return {
      x: parseInt($(selector).css("left").split("px")[0] - 50),
      y: parseInt($(selector).css("top").split("px")[0] - 50),
    };
  }
  getDistance(x, y) {
    return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
  }
}
class Candy {
  constructor(x, y) {
    this.id = new Date().getTime().toString();
    this.selector = "#" + this.id;
    this.fadeTime = 5000;
    this.x = x;
    this.y = y;
    this.hadEaten = false;
    this.generateCandy(x, y);
  }
  generateCandy(x, y) {
    let img = document.createElement("img");
    img.src = "./static/candy.png";
    img.id = this.id;
    $(img)
      .css({ left: x - 80, top: y - 50 })
      .addClass("candy");
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
  let diana = new Diana(".target img");
  let followFlag = 1; // 0 | 1 | 2
  switch (followFlag) {
    case 1:
      $(document).click((e) => {
        $(".candy").remove(); // only one candy appear
        let candy = new Candy(e.pageX, e.pageY);
        diana.chase(candy);
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
