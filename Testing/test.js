const s = ( sketch ) => {

  let x = 100;
  let y = 100;

  sketch.setup = () => {
    sketch.createCanvas(400, 400);
  };

  sketch.draw = () => {
    sketch.background(0);
    sketch.fill(255);
    sketch.rect(x,y,50,50);
    sketch.stroke(255);
    sketch.drawingContext.stroke(new Path2D("M 190 190 A 50 100 45 1 1 215,215"));
  };
};

class Square extends GraphicMobject {
  drawGraphics(p5) {
    //super.drawGraphics(p5);
    let dimensions = this.strokeWeight == 0 ? [this.width, this.height] : [this.width - this.strokeWeight, this.height - this.strokeWeight];
    console.log(this.strokeWeight);
    let fc = p5.getColor(this.fillColor);
    let sc = p5.getColor(this.strokeColor);
    fc.setAlpha(this.fillOpacity);
    sc.setAlpha(this.strokeOpacity);

    this.graphics.noStroke();
    this.graphics.fill(fc);
    this.graphics.rect(-dimensions[0]/2, -dimensions[1]/2, dimensions[0], dimensions[1]);
    
    this.graphics.stroke(sc);
    this.graphics.strokeWeight(this.strokeWeight);
    this.graphics.noFill();
    if (this.strokeWeight > 0) {
      this.graphics.rect(-this.width/2, -this.height/2, this.width, this.height);
    }
  }
}


class TestScene extends Scene {
  construct() {
    let square1 = new Square({ name: "Square 1", strokeColor: DARK_RED, fillColor: RED });
    let square2 = new Square({ name: "Square 2", strokeColor: DARK_BLUE, fillColor: BLUE });
    this.add(square1);
    this.add(square2);
    square1.shift(nj.array([-100, 0, 0]));
    square2.shift(nj.array([100, 0, 0]));
    //this.play(square1.animate().scale(1.1).shift(nj.array([50, 100, 0])));
    //this.play(square2.animate().shift(nj.array([50, 100, 0])));
  }
  setup(p5) {
   p5.createCanvas(810, 540);
   
   super.setup(p5);
  }

  draw(p5) {
    p5.background(p5.getColor(BLACK));

    super.draw(p5);
  }
}

let scene = new TestScene();
scene.construct();
scene.initialize();
scene.runSketch();