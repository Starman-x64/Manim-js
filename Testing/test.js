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




class TestScene extends Scene {
  construct() {
    let square1 = new Square({ name: "Square 1", strokeColor: DARK_RED, fillColor: RED });
    let squareHidden = new Square({ name: "Square Hidden", strokeColor: DARK_RED, fillColor: RED });
    let square2 = new Square({ name: "Square 2", strokeColor: DARK_BLUE, fillColor: BLUE });
    //this.add(square1);
    this.add(square2);
    square1.shift(nj.array([-100, 0, 0]));
    squareHidden.shift(nj.array([-100, 0, 0]));
    square2.shift(nj.array([100, 0, 0]));
    
    //square1.pointwiseBecomePartial(squareHidden, 0, 1);
    this.play(new Create(square1));
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